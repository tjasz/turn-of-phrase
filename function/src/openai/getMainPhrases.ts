import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources";

export function getMainPhrasePrompt(subThemes: string[]): ChatCompletionMessageParam {
  return {
    role: "user",
    content: `For each of these ${subThemes.length} sub-themes,
list 20-30 noun phrases of 1-2 words each that would be good main phrases on a Phrase Challenge.
Combine the results into a single array. Output only a JSON array of strings.`,
  };
}

export async function getMainPhrases(
  subThemes: string[],
  messages: ChatCompletionMessageParam[],
  getResponse: (messages: ChatCompletionMessageParam[]) => Promise<ChatCompletionMessage>
): Promise<string[]> {
  const promptForMainPhrases = getMainPhrasePrompt(subThemes);
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