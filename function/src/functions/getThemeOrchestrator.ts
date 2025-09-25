import * as df from "durable-functions";
import { systemPrompt } from "../openai";
import { getPromptForSubThemes } from "../openai/getSubThemes";
import { getMainPhrasePrompt } from "../openai/getMainPhrases";
import { getChallengesPrompt } from "../openai/getChallenges";
import getGenerationPrompt from "../openai/getGenerationPrompt";
import { getPromptForDescription } from "./getDescription";
import partitionArray from "../partitionArray";

const orchestrator = df.app.orchestration("getThemeOrchestrator", function* (context) {
  // Get input request object
  const input = context.df.getInput<GetThemeRequest>();
  const result: GetThemeRequest = {
    Title: input.Title,
    Description: input.Description,
    SubThemes: input.SubThemes || [],
    MainPhrases: [...input.MainPhrases || [], ...input.Challenges?.map(c => c.Main) || []],
  };
  context.df.setCustomStatus({ message: "Started", data: result });

  const generationPrompt = getGenerationPrompt(result.Title, result.Description);

  // If no description provided, generate one
  if (!result.Description || result.Description.trim().length === 0) {
    context.df.setCustomStatus({ message: "Generating description...", data: result });
    const descriptionPrompt = getPromptForDescription(result.Title, result.Description);
    const descriptionResponse = yield context.df.callActivity("getResponseActivity", { messages: [systemPrompt, generationPrompt, descriptionPrompt] });
    result.Description = descriptionResponse.content;
    context.df.setCustomStatus({ message: "Generated description", data: result });
  }

  // If fewer than 5 sub-themes, generate more
  if (result.SubThemes!.length < 5) {
    context.df.setCustomStatus({ message: "Generating sub-themes...", data: result });
    const subThemePrompt = getPromptForSubThemes(result.Title, result.Description, result.SubThemes);
    const subThemesResponse = yield context.df.callActivity("getResponseActivity", { messages: [systemPrompt, generationPrompt, subThemePrompt] });
    const newSubThemes = subThemesResponse.content!.split(";").map((s) => s.trim());
    result.SubThemes = Array.from(new Set([...result.SubThemes, ...newSubThemes]));
    context.df.setCustomStatus({
      message: `Generated sub-themes for a total of ${result.SubThemes.length} sub-themes`,
      data: result,
    });
  }

  // If fewer than 100 main phrases, generate more
  const targetChallengeCount = 100;
  if (result.MainPhrases!.length < targetChallengeCount) {
    const targetCount = Math.ceil((targetChallengeCount - result.MainPhrases!.length) / result.SubThemes.length);
    for (let i = 0; i < result.SubThemes.length; i++) {
      const subTheme = result.SubThemes[i];
      context.df.setCustomStatus({
        message: `Generated ${result.MainPhrases!.length} phrases so far. Generating main phrases for sub-theme ${i + 1}/${result.SubThemes.length}: "${subTheme}"...`,
        data: result,
      });
      const mainPhrasePrompt = getMainPhrasePrompt(result.Title, subTheme, targetCount);
      const mainPhraseResponse = yield context.df.callActivity("getResponseActivity", { messages: [systemPrompt, generationPrompt, mainPhrasePrompt] });
      // Filter out non-compliant phrases: keep only unique, short main phrases
      const mainPhrasesForSubTheme = mainPhraseResponse.content!
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length <= 30 && s.split(" ").length <= 4);
      result.MainPhrases = Array.from(new Set([...result.MainPhrases, ...mainPhrasesForSubTheme]));
    }
    result.MainPhrases = Array.from(new Set(result.MainPhrases));
    context.df.setCustomStatus({ message: `Generated ${result.MainPhrases.length} main phrases.`, data: result });
  }

  // Step 3: Get Challenges
  const batchLength = 5;
  let phrasesInChallenges = new Set(input.Challenges?.map(c => c.Main) || []);
  let [completeChallenges, incompleteChallenges] = partitionArray(input.Challenges || [], c => c.Related.filter(r => r.trim().length > 0).length >= 4);
  incompleteChallenges = [...incompleteChallenges, ...result.MainPhrases.filter(mp => !phrasesInChallenges.has(mp)).map(mp => ({ Main: mp, Related: [] }))];
  for (let i = 0; i < incompleteChallenges.length; i += batchLength) {
    const mainPhrase = incompleteChallenges[i].Main;
    context.df.setCustomStatus({
      message: `Generating challenges for main phrase ${i + 1}/${incompleteChallenges.length}: "${mainPhrase}"...`,
      data: result,
    });
    const challengePrompt = getChallengesPrompt(incompleteChallenges.slice(i, i + batchLength));
    const challengeResponse = yield context.df.callActivity("getResponseActivity", { messages: [systemPrompt, generationPrompt, challengePrompt] });
    completeChallenges = [...completeChallenges, ...JSON.parse(challengeResponse.content!)];
    context.df.setCustomStatus({ message: `Generated ${completeChallenges.length}/${result.MainPhrases.length} challenges`, data: result });
  }
  context.df.setCustomStatus({ message: `Generated ${completeChallenges.length} challenges`, data: result });

  return {
    Title: result.Title,
    Description: result.Description,
    SubThemes: result.SubThemes,
    MainPhrases: result.MainPhrases,
    Challenges: completeChallenges,
  };
});

export default orchestrator;
