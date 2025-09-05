import { AzureOpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import systemPrompt from "./systemPrompt";
import validateChallenges from "./validateChallenges";
import getSubThemes from "./getSubThemes";
import { getMainPhrases } from "./getMainPhrases";
import { getChallenges } from "./getChallenges";

async function getAiTheme(title: string, description: string, apiKey: string): Promise<Challenge[]> {
  // You will need to set these environment variables or edit the following values
  const endpoint = "https://top-ai.openai.azure.com/";
  const apiVersion = "2025-01-01-preview";
  const deployment = "gpt-4.1-mini"; // This must match your deployment name

  const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment, dangerouslyAllowBrowser: true });

  const getResponse = async (messages: ChatCompletionMessageParam[]) => {
    console.log(messages);
    const result = await client.chat.completions.create({
      messages,
      model: deployment,
      max_tokens: 16384,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: null
    });
    return result.choices[0].message;
  }

  const messages = [systemPrompt];
  const maxRetries = 3;

  // try to get subThemes
  let subThemes: string[] | null = null;
  for (let tryCount = 0; !subThemes && tryCount < maxRetries; ++tryCount) {
    try {
      subThemes = await getSubThemes(title, description, messages, getResponse);
    }
    catch (error) {
      console.error(error);
      if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
        console.error("Rate limit exceeded");
      }
      else {
        messages.push({
          role: "user",
          content: `The assistant response caused the following error: ${JSON.stringify(error)}.\n\nPlease try again.`
        });
        continue;
      }
    }
  }

  // try to get main phrases
  if (subThemes) {
    let mainPhrases: string[] | null = null;
    for (let tryCount = 0; !mainPhrases && tryCount < maxRetries; ++tryCount) {
      try {
        mainPhrases = await getMainPhrases(subThemes, messages, getResponse);
      }
      catch (error) {
        console.error(error);
        if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
          console.error("Rate limit exceeded");
        }
        else {
          messages.push({
            role: "user",
            content: `The assistant response caused the following error: ${JSON.stringify(error)}.\n\nPlease try again.`
          });
          continue;
        }
      }
    }

    // try to get challenges
    if (mainPhrases) {
      let challenges: Challenge[] | null = null;
      for (let tryCount = 0; !challenges && tryCount < maxRetries; ++tryCount) {
        try {
          challenges = await getChallenges(mainPhrases, messages, getResponse);
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

export { validateChallenges, getAiTheme };
