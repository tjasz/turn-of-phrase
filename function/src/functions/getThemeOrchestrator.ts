import * as df from "durable-functions";
import { systemPrompt } from "../openai";
import { getPromptForSubThemes } from "../openai/getSubThemes";
import { getMainPhrasePrompt } from "../openai/getMainPhrases";
import { getChallengesPrompt } from "../openai/getChallenges";
import getGenerationPrompt from "../openai/getGenerationPrompt";

const orchestrator = df.app.orchestration("getThemeOrchestrator", function* (context) {
  // Step 0: Get input
  const input = context.df.getInput();
  const title = input['Title'];
  const description = input['Description'];
  const results = {};
  results['Title'] = title;
  results['Description'] = description;
  context.df.setCustomStatus({ message: "Started", data: results });

  const generationPrompt = getGenerationPrompt(title, description);

  // Step 1: Get Sub-Themes
  context.df.setCustomStatus({ message: "Generating sub-themes...", data: results });
  const subThemePrompt = getPromptForSubThemes(title, description);
  const subThemesResponse = yield context.df.callActivity("getResponseActivity", { messages: [systemPrompt, generationPrompt, subThemePrompt] });
  const subThemes = subThemesResponse.content!.split(";").map((s) => s.trim());
  results['SubThemes'] = subThemes;
  context.df.setCustomStatus({
    message: `Generated ${subThemes.length} sub-themes`,
    data: results,
  });

  // Step 2a: Get Main Phrases
  const targetCount = Math.ceil(100 / subThemes.length);
  let mainPhrases: string[] = [];
  for (let i = 0; i < subThemes.length; i++) {
    const subTheme = subThemes[i];
    context.df.setCustomStatus({
      message: `Generated ${mainPhrases.length} phrases so far. Generating main phrases for sub-theme ${i + 1}/${subThemes.length}: "${subTheme}"...`,
      data: results,
    });
    const mainPhrasePrompt = getMainPhrasePrompt(title, subTheme, targetCount);
    const mainPhraseResponse = yield context.df.callActivity("getResponseActivity", { messages: [systemPrompt, generationPrompt, mainPhrasePrompt] });
    const mainPhrasesForSubTheme = mainPhraseResponse.content!.split(";").map((s) => s.trim()).filter((s) => s.length > 0);
    mainPhrases = [...mainPhrases, ...mainPhrasesForSubTheme];
    results['MainPhrases'] = mainPhrases;
  }
  mainPhrases = Array.from(new Set(mainPhrases));
  context.df.setCustomStatus({ message: `Generated ${mainPhrases.length} main phrases.`, data: results });

  // Step 2b: Filter out non-compliant phrases: keep only unique, short main phrases
  mainPhrases = Array.from(new Set(mainPhrases));
  mainPhrases = mainPhrases.filter((phrase) => phrase.split(" ").length <= 4 && phrase.length <= 30);
  results['MainPhrases'] = mainPhrases;

  // Step 3: Get Challenges
  const batchLength = 5;
  let challenges: Challenge[] = [];
  for (let i = 0; i < mainPhrases.length; i += batchLength) {
    const mainPhrase = mainPhrases[i];
    context.df.setCustomStatus({
      message: `Generating challenges for main phrase ${i + 1}/${mainPhrases.length}: "${mainPhrase}"...`,
      data: results,
    });
    const challengePrompt = getChallengesPrompt(mainPhrases.slice(i, i + batchLength));
    const challengeResponse = yield context.df.callActivity("getResponseActivity", { messages: [systemPrompt, generationPrompt, challengePrompt] });
    challenges = [...challenges, ...JSON.parse(challengeResponse.content!)];
    context.df.setCustomStatus({ message: `Generated ${challenges.length}/${mainPhrases.length} challenges`, data: results });
  }
  context.df.setCustomStatus({ message: `Generated ${challenges.length} challenges`, data: results });

  return {
    Title: title,
    Description: description,
    SubThemes: subThemes,
    MainPhrases: mainPhrases,
    Challenges: challenges,
  };
});

export default orchestrator;
