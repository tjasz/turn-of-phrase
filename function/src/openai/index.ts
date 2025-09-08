import type { ChatCompletionMessageParam } from "openai/resources";
import systemPrompt from "./systemPrompt";
import validateChallenges from "./validateChallenges";
import getSubThemes from "./getSubThemes";
import { getMainPhrases } from "./getMainPhrases";
import { getChallenges } from "./getChallenges";
import getOpenAiClient from "./getOpenAiClient";
import getResponse from "./getResponse";

async function getAiTheme(title: string, description: string): Promise<Challenge[]> {
  const client = getOpenAiClient();
  const getResponseFromClient = (messages: ChatCompletionMessageParam[]) => getResponse(client, messages);

  const messages = [systemPrompt];
  const maxRetries = 3;

  // try to get subThemes
  let subThemes: string[] | null = null;
  for (let tryCount = 0; !subThemes && tryCount < maxRetries; ++tryCount) {
    try {
      subThemes = await getSubThemes(title, description, messages, getResponseFromClient);
    }
    catch (error) {
      console.error(error);
      if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
        console.error("Rate limit exceeded");
      }
      else if (error instanceof Error) {
        messages.push({
          role: "user",
          content: `The assistant response caused the following error: ${error.toString()}.\n\nPlease try again.`
        });
        continue;
      }
      else {
        throw error;
      }
    }
  }

  // try to get main phrases
  if (subThemes) {
    let mainPhrases: string[] | null = null;
    for (let tryCount = 0; !mainPhrases && tryCount < maxRetries; ++tryCount) {
      try {
        mainPhrases = await getMainPhrases(subThemes, messages, getResponseFromClient);
      }
      catch (error) {
        console.error(error);
        if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
          console.error("Rate limit exceeded");
        }
        else if (error instanceof Error) {
          messages.push({
            role: "user",
            content: `The assistant response caused the following error: ${error.toString()}.\n\nPlease try again.`
          });
          continue;
        }
        else {
          throw error;
        }
      }
    }

    // try to get challenges
    if (mainPhrases) {
      let challenges: Challenge[] | null = null;
      let challengeErrors: ChallengeErrors[] | null = null;
      for (let tryCount = 0; (!challenges || challengeErrors && challengeErrors.length > 0) && tryCount < maxRetries; ++tryCount) {
        try {
          [challenges, challengeErrors] = await getChallenges(mainPhrases, messages, getResponseFromClient);
          if (challengeErrors && challengeErrors.length > 0) {
            messages.push({
              role: "user",
              content: `The following challenges are invalid: ${JSON.stringify(challengeErrors)}.`
            });
            continue;
          }
        }
        catch (error) {
          console.error(error);
          if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
            console.error("Rate limit exceeded");
          }
          else if (error instanceof Error) {
            messages.push({
              role: "user",
              content: `The assistant response caused the following error: ${error.toString()}.\n\nPlease try again.`
            });
            continue;
          }
          else {
            throw error;
          }
        }
      }

      // we tried our best given the retry limit. If we got any challenges, return them.
      if (challenges) {
        return challenges;
      }
    }
  }

  throw new Error("Failed to generate AI theme");
}

export { systemPrompt, validateChallenges, getAiTheme, getOpenAiClient, getResponse, getSubThemes, getMainPhrases, getChallenges };
