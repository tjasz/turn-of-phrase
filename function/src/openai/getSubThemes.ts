import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources";

export function getPromptForSubThemes(title: string, description: string): ChatCompletionMessageParam {
  return {
    role: "user",
    content:
      `We are generating a new set of Phrase Challenges for theme described below.
Title: ${title}
Description: ${description}

First, list 5 or more sub-themes that fall under the broad theme "${title}".
Output only a JSON array of strings.`
  };
}

export async function getSubThemes(
  title: string,
  description: string,
  messages: ChatCompletionMessageParam[],
  getResponse: (messages: ChatCompletionMessageParam[]) => Promise<ChatCompletionMessage>
): Promise<string[]> {
  const promptForSubThemes = getPromptForSubThemes(title, description);
  messages.push(promptForSubThemes);

  var subThemeResponse = await getResponse(messages);
  messages.push(subThemeResponse);

  var subThemeResponseParsed = JSON.parse(subThemeResponse.content!);
  if (!Array.isArray(subThemeResponseParsed)) {
    throw new Error(`The returned string is not a valid JSON array: ${subThemeResponse.content}`);
  }

  if (subThemeResponseParsed.length < 5) {
    throw new Error(`The returned array does not contain at least 5 sub-themes: ${subThemeResponse.content}`);
  }

  const nonStringElements = subThemeResponseParsed.filter((s: any) => typeof s !== "string");
  if (nonStringElements.length > 0) {
    throw new Error(`The returned array contains non-string elements: ${JSON.stringify(nonStringElements)}`);
  }

  return subThemeResponseParsed;
}

export default getSubThemes;