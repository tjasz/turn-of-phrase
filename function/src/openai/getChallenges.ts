import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources";
import finalOutputGuidance from "./finalOutputGuidance";
import validateChallenges from "./validateChallenges";

export function getChallengePrompt(mainPhrase: string): ChatCompletionMessageParam {
  return {
    role: "user",
    content: `Generate a Phrase Challenge for the main phrase: "${mainPhrase}".
The challenge should include the main phrase and 4 related phrases each 1-2 words long
that are thematically connected to the main phrase and that a person might use to describe the main phrase.
Output only a JSON object with the following properties:
{
  "Main": "<main_phrase>",
  "Related": ["<related_phrase_1>", "<related_phrase_2>", "<related_phrase_3>", "<related_phrase_4>"]
}
  
Example: For the main phrase of "Elephant", the output may be...
{
  "Main": "Elephant",
  "Related": ["Trunk", "Tusks", "Safari", "Africa"]
}

DO:
- Ensure that the output is valid JSON.
- Ensure that the challenge has a Main string property that is a noun phrase of 1-2 words.
- Ensure that the challenge has a Related array property that contains exactly 4 strings, each 1-2 words long.
- Ensure that each Related phrase is unique within its challenge.
- Ensure that each Related phrase is not a subset of the Main phrase.
- Ensure that each Related phrase does not contain articles or short prepositions.

Include only the JSON as output.
Do not include additional text, even to explain or apologize for mistakes.`
  };
}

export function getChallengesPrompt(partialChallenges: Challenge[]): ChatCompletionMessageParam {
  return {
    role: "user",
    content: `Complete this set of partial challenges.
The main phrase is provided, but one or more of the related phrases are missing.
For each challenge, generate any missing related phrases so that each challenge has exactly 4 related phrases.

${finalOutputGuidance}

Here are the partial challenges to complete:
${JSON.stringify(partialChallenges, null, 2)}`,
  };
}

export async function getChallenges(
  mainPhrases: string[],
  messages: ChatCompletionMessageParam[],
  getResponse: (messages: ChatCompletionMessageParam[]) => Promise<ChatCompletionMessage>
): Promise<[Challenge[], ChallengeErrors[]]> {
  const promptForChallenges = getChallengesPrompt(mainPhrases.map(mp => ({ Main: mp, Related: [] })));
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

  return validateChallenges(challengeResponseParsed);
}

export default getChallenges;