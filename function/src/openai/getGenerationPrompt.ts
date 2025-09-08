import { ChatCompletionMessageParam } from "openai/resources";

export function getGenerationPrompt(title: string, description: string): ChatCompletionMessageParam {
  return {
    role: "user",
    content:
      `We are generating a new set of Phrase Challenges for theme described below.
Title: ${title}
Description: ${description}`
  };
}

export default getGenerationPrompt;
