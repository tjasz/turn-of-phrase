import { ChatCompletionMessageParam } from "openai/resources";
import { getOpenAiClient, getResponse, systemPrompt } from "../openai";
import getSubThemes from "../openai/getSubThemes";
import * as df from "durable-functions";

export const getSubThemesActivity: df.ActivityHandler = async (input: { Title: string; Description: string }) => {
  console.log("getSubThemesActivity called with input:", input);

  const client = getOpenAiClient();
  const getResponseFromClient = (messages: ChatCompletionMessageParam[]) => getResponse(client, messages);
  const subThemes = await getSubThemes(input.Title, input.Description, [systemPrompt], getResponseFromClient);

  return subThemes;
}

df.app.activity("getSubThemesActivity", {
  handler: getSubThemesActivity
});

export default getSubThemesActivity;
