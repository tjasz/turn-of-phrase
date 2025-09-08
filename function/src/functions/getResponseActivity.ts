import { ChatCompletionMessageParam } from "openai/resources";
import { getOpenAiClient, getResponse } from "../openai";
import * as df from "durable-functions";

export const getResponseActivity: df.ActivityHandler = async (input: { messages: ChatCompletionMessageParam[] }) => {
  console.log("getResponseActivity called with input:", input);

  const client = getOpenAiClient();
  const response = await getResponse(client, input.messages);

  return response;
}

df.app.activity("getResponseActivity", {
  handler: getResponseActivity
});

export default getResponseActivity;
