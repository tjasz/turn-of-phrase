import * as df from "durable-functions";
import { systemPrompt } from "../openai";
import { getPromptForSubThemes } from "../openai/getSubThemes";
import { getMainPhrasePrompt } from "../openai/getMainPhrases";
import { getChallengePrompt, getChallengesPrompt } from "../openai/getChallenges";

const orchestrator = df.app.orchestration("getThemeOrchestrator", function* (context) {
  // Step 0: Get input
  const input = context.df.getInput();
  const results = {};
  results['Title'] = input['Title'];
  results['Description'] = input['Description'];
  context.df.setCustomStatus({ message: "Started", data: results });

  const messages = [systemPrompt];

  // Step 1: Get Sub-Themes
  context.df.setCustomStatus({ message: "Generating sub-themes...", data: results });
  messages.push(getPromptForSubThemes(input['Title'], input['Description']));
  const subThemesResponse = yield context.df.callActivity("getResponseActivity", { messages });
  messages.push(subThemesResponse);
  const subThemes = JSON.parse(subThemesResponse.content!);
  results['SubThemes'] = subThemes;
  context.df.setCustomStatus({
    message: `Generated ${subThemes.length} sub-themes`,
    data: results,
  });

  // Step 2: Get Main Phrases
  const targetCount = Math.ceil(100 / subThemes.length);
  let mainPhrases: string[] = [];
  for (let i = 0; i < subThemes.length; i++) {
    const subTheme = subThemes[i];
    context.df.setCustomStatus({
      message: `Generated ${mainPhrases.length} phrases so far. Generating main phrases for sub-theme ${i + 1}/${subThemes.length}: "${subTheme}"...`,
      data: { SubThemes: subThemes },
    });
    messages.push(getMainPhrasePrompt(input['Title'], subTheme, targetCount));
    const mainPhraseResponse = yield context.df.callActivity("getResponseActivity", { messages });
    messages.push(mainPhraseResponse);
    mainPhrases = [...mainPhrases, ...JSON.parse(mainPhraseResponse.content!)];
    results['MainPhrases'] = mainPhrases;
  }
  context.df.setCustomStatus({ message: `Generated ${mainPhrases.length} main phrases.`, data: results });

  // Get only unique, short main phrases
  mainPhrases = Array.from(new Set(mainPhrases));
  mainPhrases = mainPhrases.filter((phrase) => phrase.split(" ").length <= 4 && phrase.length <= 30);
  results['MainPhrases'] = mainPhrases;

  // Step 3: Get Challenges
  const batchLength = 10;
  let challenges: Challenge[] = [];
  for (let i = 0; i < mainPhrases.length; i += batchLength) {
    const mainPhrase = mainPhrases[i];
    context.df.setCustomStatus({
      message: `Generating challenges for main phrase ${i + 1}/${mainPhrases.length}: "${mainPhrase}"...`,
      data: { results },
    });
    const challengePrompt = getChallengesPrompt(mainPhrases.slice(i, i + batchLength));
    const challengeResponse = yield context.df.callActivity("getResponseActivity", { messages: [systemPrompt, challengePrompt] });
    challenges = [...challenges, ...JSON.parse(challengeResponse.content!)];
    results['Challenges'] = challenges;
    context.df.setCustomStatus({ message: `Generated ${challenges.length}/${mainPhrases.length} challenges`, data: results });
  }
  context.df.setCustomStatus({ message: `Generated ${challenges.length} challenges`, data: results });

  return {
    Title: input['Title'],
    Description: input['Description'],
    SubThemes: subThemes,
    Challenges: challenges
  };
});

export default orchestrator;
