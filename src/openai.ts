import { AzureOpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";

export async function getAiTheme(title: string, description: string, apiKey: string): Promise<Challenge[]> {
  // You will need to set these environment variables or edit the following values
  const endpoint = "https://top-ai.openai.azure.com/";
  const apiVersion = "2025-01-01-preview";
  const deployment = "gpt-4.1-mini"; // This must match your deployment name

  const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment, dangerouslyAllowBrowser: true });

  const systemPrompt: ChatCompletionMessageParam = {
    role: "system",
    content: `You are an AI model designed to help create new sets of challenges in the word game "Turn of Phrase".
    In "Turn of Phrase", players attempt to describe a short noun phrase to their teammates without using the phrase itself,
    any part of the phrase, or any part of related phrases included in the challenge.

    A set consists of 100 Phrase Challenges, which fit a certain theme of the set.
    Each phrase challenge includes a 1-2 word common or proper noun phrase such as "refrigerator", "ice ax", or "Lion King".
    Gerund phrases such as "sightseeing" could also be included.

    Example: for a theme of "Food", phrase challenges could include "Pizza", "Sushi", "Burger", and "Pasta".

    Each phrase challenge also includes 4 additional related 1-2 word phrases (these can be any part of speech).
    These should be selected to make it difficult to describe the main phrase without using them.

    Example: for a challenge where the main phrase is "George Washington",
    the related phrases might include "First President", "United States", "Founding Father", and "American Revolution".
    Small, common words should not be included in related phrases.
    This includes the articles "a" and "the" and small prepositions such as "in", "on", "at", or "of".

    User messages should be considered to be a description of a theme.
    Generate a new set of 100 Phrase Challenges for that theme.

    Output a JSON document that is a list of objects where each object contains a string property "Main" and a list of strings property "Related".
    Example: For the theme of "Animals", the output may start with the following phrase challenges...
    [
      {
        "Main": "Lion",
        "Related": ["Big Cat", "Jungle", "Pride", "Roar"]
      },
      {
        "Main": "Elephant",
        "Related": ["Trunk", "Tusks", "Safari", "Africa"]
      },
      {
        "Main": "Eagle",
        "Related": ["Bird", "American", "Bald", "Freedom"]
      },
      {
        "Main": "Dolphin",
        "Related": ["Intelligent", "Ocean", "Mammal", "Playful"]
      },
      ...
    ]

    DO:
    - Ensure that the output is valid JSON.
    - Generate a new set of at least 100 Phrase Challenges for that theme.
    - Ensure that each challenge has a Main string property that is a noun phrase of 1-2 words.
    - Ensure that each main phrase is unique within the set.
    - Ensure that each challenge has a Related array property that contains exactly 4 strings, each 1-2 words long.
    - Ensure that each Related phrase is unique within its challenge.
    - Ensure that each Related phrase is not a subset of the Main phrase.
    - Ensure that each Related phrase does not contain articles or short prepositions.

    Include only the JSON as output.
    Do not include additional text, even to explain or apologize for mistakes.
    `
  };
  const userPrompt: ChatCompletionMessageParam = {
    role: "user",
    content: `Generate a set of at least 100 challenges for the following theme.
    Title: ${title}\n\nDescription: ${description}
    `
  };
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