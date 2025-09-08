import * as df from "durable-functions";
import { systemPrompt } from "../openai";
import { getPromptForSubThemes } from "../openai/getSubThemes";
import { getMainPhrasePrompt } from "../openai/getMainPhrases";
import { getChallengesPrompt } from "../openai/getChallenges";

const orchestrator = df.app.orchestration("getThemeOrchestrator", function* (context) {
  const input = context.df.getInput();
  console.log("Orchestrator input:", input);

  const messages = [systemPrompt];

  // Step 1: Get Sub-Themes
  context.df.setCustomStatus("Generating sub-themes...");
  messages.push(getPromptForSubThemes(input['Title'], input['Description']));
  const subThemesResponse = yield context.df.callActivity("getResponseActivity", { messages });
  messages.push(subThemesResponse);
  const subThemes = JSON.parse(subThemesResponse.content!);
  context.df.setCustomStatus(`Sub-themes generated (${subThemes.length}): ${subThemes.join(", ")}`);

  // Step 2: Get Main Phrases
  context.df.setCustomStatus(`Generating main phrases for ${subThemes.length} sub-themes ${subThemes.join(", ")}...`);
  messages.push(getMainPhrasePrompt(subThemes));
  const mainPhrasesResponse = yield context.df.callActivity("getResponseActivity", { messages });
  messages.push(mainPhrasesResponse);
  const mainPhrases = JSON.parse(mainPhrasesResponse.content!);
  context.df.setCustomStatus(`Main phrases generated (${mainPhrases.length}): ${mainPhrases.join(", ")}`);

  // Step 3: Get Challenges
  context.df.setCustomStatus(`Generating challenges for ${mainPhrases.length} main phrases...`);
  messages.push(getChallengesPrompt(mainPhrases));
  const challengesResponse = yield context.df.callActivity("getResponseActivity", { messages });
  messages.push(challengesResponse);
  const challenges = JSON.parse(challengesResponse.content!);
  context.df.setCustomStatus(`Challenges generated (${challenges.length})`);

  return {
    Title: input['Title'],
    Description: input['Description'],
    SubThemes: subThemes,
    Challenges: challenges
  };
});

export default orchestrator;
