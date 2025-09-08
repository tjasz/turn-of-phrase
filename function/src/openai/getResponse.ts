import { AzureOpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { deployment } from "./constants";

export async function getResponse(client: AzureOpenAI, messages: ChatCompletionMessageParam[]) {
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

export default getResponse;
