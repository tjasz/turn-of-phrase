import { AzureOpenAI } from "openai";
import type { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";

export async function getAiTheme(title: string, description: string, apiKey: string): Promise<Challenge[]> {
  // You will need to set these environment variables or edit the following values
  const endpoint = "https://top-ai.openai.azure.com/";
  const apiVersion = "2025-01-01-preview";
  const deployment = "gpt-4.1-mini"; // This must match your deployment name

  const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment, dangerouslyAllowBrowser: true });

  const systemPrompt: ChatCompletionMessageParam = { role: "system", content: "You are an AI model designed to help create new sets of challenges in the word game \"Turn of Phrase\". A set consists of 100 Phrase Challenges.\n\nOn each phrase challenge is written a 1-2 word improper or proper noun phrase such as \"refrigerator\", \"ice ax\", or \"Lion King\". Gerund phrases such as \"sightseeing\" could also be included.\n\nEach phrase challenge also includes 4 additional related 1-2 word phrases (these can be any part of speech). A challenge where the main phrase is \"George Washington\" might include \"First\", \"President\", \"United States\", and \"Founding Father\". Small, common words such as \"the\" or \"of\" will not be included.\n\nUser input should be considered to be a description of a theme. Generate a new set of Phrase Challenges for that theme. Output a JSON document that is a list of objects where each object contains a string property \"Main\" and a list of strings property \"Related\"." };
  const userPrompt: ChatCompletionMessageParam = { role: "user", content: `Title: ${title}\n\nDescription: ${description}` };
  let messages = [systemPrompt, userPrompt];

  let challenges: Challenge[] | null = null;
  const maxRetries = 3;
  for (let tryCount = 0; tryCount < maxRetries; ++tryCount) {
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

    // if response is empty, re-prompt and continue
    if (!result.choices[0].message.content) {
      messages.push({ role: "user", content: "The assistant did not generate a valid response. Please try again. Include only the JSON as output. Do not apologize or explain your error." });
      continue;
    }

    // push the assistant response onto the messages for context in future requests
    // @ts-expect-error: "assistant" is not a valid role in the SDK, but is in the API
    messages.push({ role: "assistant", content: result.choices[0].message.content });

    // if response cannot be parsed as JSON, include the original response for context, reprompt, and continue
    try {
      challenges = JSON.parse(result.choices[0].message.content);
      console.log(challenges);
    } catch (error) {
      messages.push({ role: "user", content: "The assistant did not generate a valid JSON response. Please try again. Include only the JSON as output. Do not apologize or explain your error." });
      continue;
    }

    // check if there are at least 100 challenges
    if (challenges!.length < 100) {
      messages.push({ role: "user", content: "The assistant did not generate enough challenges. Please generate 100 challenges. Include only the JSON as output. Do not apologize or explain your error." });
      continue;
    }

    // ensure each challenge has a main phrase
    let hasChallengeError = false;
    for (let i = 0; i < challenges!.length; ++i) {
      const challenge = challenges![i];
      if (!challenge.Main || typeof challenge.Main !== "string") {
        messages.push({ role: "user", content: `The assistant did not generate valid challenges. Each Challenge should have a string property named "Main", but the ${i + 1}th Challenge did not. Try again. Include only the JSON as output. Do not apologize or explain your error.` });
        hasChallengeError = true;
        break;
      }
      if (challenge.Main.split(" ").length > 2) {
        messages.push({ role: "user", content: `The assistant did not generate valid challenges. The main phrase ${challenge.Main} is more than 2 words long. Try again. Include only the JSON as output. Do not apologize or explain your error.` });
        break;
      }
      if (!challenge.Related || !Array.isArray(challenge.Related) || challenge.Related.length !== 4 || typeof challenge.Related[0] !== "string" || challenge.Related.some(c => c.split(" ").length > 2)) {
        messages.push({ role: "user", content: `The assistant did not generate valid challenges. Each Challenge should have a property named "Related" that is an array of exactly 4 strings, each 1-2 words long. Try again. Include only the JSON as output. Do not apologize or explain your error.` });
        hasChallengeError = true;
        break;
      }
    }
    if (hasChallengeError) {
      continue;
    }

    return challenges!;
  }

  // we tried our best, even though there were still some errors
  if (challenges) {
    return challenges;
  }

  throw new Error("Failed to generate AI theme");
}