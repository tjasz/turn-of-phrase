import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources";

export function getMainPhrasePrompt(mainTheme: string, subThemes: string[] | string, targetCount: number): ChatCompletionMessageParam {
  const subThemesArray = Array.isArray(subThemes) ? subThemes : [subThemes];
  if (subThemesArray.length === 0) {
    throw new Error("subThemes array is empty");
  }
  if (subThemesArray.length === 1) {
    return {
      role: "user",
      content: `For the sub-theme "${subThemesArray[0]}" as it relates to the broader theme ${mainTheme},
list ${targetCount} or more phrases that would be good main phrases on a Phrase Challenge.
- Each phrase should be a noun, noun phrase, or gerund.
- Each phrase should be 1-2 words in length.
- Each phrase should be no more than 30 characters in length.
- Each phrase should be something that people familiar with ${mainTheme} would know.
Output only a semi-colon separated sequence of strings.`,
    }
  }
  return {
    role: "user",
    content: `For each of these ${subThemesArray.length} sub-themes: "${subThemesArray.join('", "')}"
as they relate to the broader theme ${mainTheme},
list ${targetCount} or more phrases that would be good main phrases on a Phrase Challenge.
- Each phrase should be a noun, noun phrase, or gerund.
- Each phrase should be 1-2 words in length.
- Each phrase should be no more than 30 characters in length.
- Each phrase should be something that people familiar with ${mainTheme} would know.
Combine the results into a single sequence. Output only a semi-colon separated sequence of strings.`,
  };
}

export function getReplaceMainPhrasesPrompt(mainTheme: string, invalidPhrases: string[]): ChatCompletionMessageParam {
  return {
    role: "user",
    content: `The following main phrases are too long: "${invalidPhrases.join('", "')}"
For each phrase, consider whether it can be shortened to be 1-2 words in length while still being clear and specific.
For example, "Machine Learning Algorithms" could be shortened to "Machine Learning".
Or "Seattle Art Museum" could be shortened to "Art Museum" if the theme is "Seattle" or "Washington State".
If a phrase cannot be reasonably shortened, then
generate an additional phrase that would be a good main phrase on a Phrase Challenge.
- Each phrase should be a noun, noun phrase, or gerund.
- Each phrase should be 1-2 words in length.
- Each phrase should be no more than 30 characters in length.
- Each phrase should be something that people familiar with ${mainTheme} would know.

Output the edited phrases and additional phrases as a single semi-colon separated sequence of strings.
Output only a semi-colon separated sequence of strings.`,
  };
}

export async function getMainPhrases(
  mainTheme: string,
  subThemes: string[],
  targetCount: number,
  messages: ChatCompletionMessageParam[],
  getResponse: (messages: ChatCompletionMessageParam[]) => Promise<ChatCompletionMessage>
): Promise<string[]> {
  const promptForMainPhrases = getMainPhrasePrompt(mainTheme, subThemes, targetCount);
  messages.push(promptForMainPhrases);

  var mainPhraseResponse = await getResponse(messages);
  messages.push(mainPhraseResponse);

  var mainPhraseResponseParsed = JSON.parse(mainPhraseResponse.content!);
  if (!Array.isArray(mainPhraseResponseParsed)) {
    throw new Error(`The returned string is not a valid JSON array: ${mainPhraseResponse.content}`);
  }

  const nonStringElements = mainPhraseResponseParsed.filter((s: any) => typeof s !== "string");
  if (nonStringElements.length > 0) {
    throw new Error(`The returned array contains non-string elements: ${JSON.stringify(nonStringElements)}`);
  }

  // silently remove duplicates, letting the agent think it did not send them
  const mainPhrases = Array.from(new Set(mainPhraseResponseParsed));
  messages[messages.length - 1].content = JSON.stringify(mainPhrases);

  if (mainPhrases.length < 100) {
    throw new Error(`The returned array does not contain at least 100 unique main phrases: ${mainPhraseResponse.content}`);
  }

  // softly enforce 2-word limit guidance, with hard limit at 4 words
  const tooLongPhrases = mainPhrases.filter((phrase) => phrase.split(" ").length > 4);
  if (tooLongPhrases.length > 0) {
    throw new Error(`The following main phrases, which should be 1-2 words in length, are too long: ${JSON.stringify(tooLongPhrases)}`);
  }

  return mainPhrases;
}

export default getMainPhrases;