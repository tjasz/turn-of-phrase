import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources";
import finalOutputGuidance from "./finalOutputGuidance";
import validateChallenges from "./validateChallenges";

export async function getChallenges(
  mainPhrases: string[],
  messages: ChatCompletionMessageParam[],
  getResponse: (messages: ChatCompletionMessageParam[]) => Promise<ChatCompletionMessage>
): Promise<Challenge[]> {
  const promptForChallenges: ChatCompletionMessageParam = {
    role: "user",
    content: `For each of these ${mainPhrases.length} main phrases,
      generate a Phrase Challenge with the following properties:
      {
        "Main": "<main_phrase>",
        "Related": ["<related_phrase_1>", "<related_phrase_2>", "<related_phrase_3>", "<related_phrase_4>"]
      }

      ${finalOutputGuidance}
      `,
  };
  messages.push(promptForChallenges);

  var challengeResponse = await getResponse(messages);
  messages.push(challengeResponse);

  var challengeResponseParsed = JSON.parse(challengeResponse.content!);
  if (!Array.isArray(challengeResponseParsed)) {
    throw new Error(`The returned string is not a valid JSON array: ${challengeResponse.content}`);
  }

  const nonObjectElements = challengeResponseParsed.filter((s: any) => typeof s !== "object");
  if (nonObjectElements.length > 0) {
    throw new Error(`The returned array contains non-object elements: ${JSON.stringify(nonObjectElements)}`);
  }

  if (challengeResponseParsed.length < 100) {
    throw new Error(`The returned array does not contain at least 100 unique challenges: ${challengeResponse.content}`);
  }

  const challengeErrors = validateChallenges(challengeResponseParsed);
  if (challengeErrors.length > 0) {
    throw new Error(`The following challenges are invalid: ${JSON.stringify(challengeErrors)}`);
  }

  return challengeResponseParsed;
}

export default getChallenges;