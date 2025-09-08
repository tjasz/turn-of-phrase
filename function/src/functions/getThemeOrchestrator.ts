import * as df from "durable-functions";
import { systemPrompt } from "../openai";
import { getPromptForSubThemes } from "../openai/getSubThemes";
import { getMainPhrasePrompt } from "../openai/getMainPhrases";
import { getChallengesPrompt } from "../openai/getChallenges";

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
  context.df.setCustomStatus({
    message: `Generating main phrases for ${subThemes.length} sub-themes...`,
    data: { SubThemes: subThemes },
  });
  messages.push(getMainPhrasePrompt(subThemes));
  const mainPhrasesResponse = yield context.df.callActivity("getResponseActivity", { messages });
  messages.push(mainPhrasesResponse);
  const mainPhrases = JSON.parse(mainPhrasesResponse.content!);
  results['MainPhrases'] = mainPhrases;
  context.df.setCustomStatus({ message: `Generated ${mainPhrases.length} main phrases`, data: results });

  // Step 3: Get Challenges
  context.df.setCustomStatus({ message: `Generating challenges for ${mainPhrases.length} main phrases...`, data: results });
  messages.push(getChallengesPrompt(mainPhrases));
  const challengesResponse = yield context.df.callActivity("getResponseActivity", { messages });
  messages.push(challengesResponse);
  const challenges = JSON.parse(challengesResponse.content!);
  results['Challenges'] = challenges;
  context.df.setCustomStatus({ message: `Generated ${challenges.length} challenges`, data: results });

  return {
    Title: input['Title'],
    Description: input['Description'],
    SubThemes: subThemes,
    Challenges: challenges
  };
});

export default orchestrator;
