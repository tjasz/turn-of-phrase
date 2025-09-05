import { AzureOpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";

const finalOutputGuidance = `Output a JSON document that is a list of objects where each object contains a string property "Main" and a list of strings property "Related".
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
    - Ensure that each challenge has a Main string property that is a noun phrase of 1-2 words.
    - Ensure that each challenge has a Related array property that contains exactly 4 strings, each 1-2 words long.
    - Ensure that each Related phrase is unique within its challenge.
    - Ensure that each Related phrase is not a subset of the Main phrase.
    - Ensure that each Related phrase does not contain articles or short prepositions.

    Include only the JSON as output.
    Do not include additional text, even to explain or apologize for mistakes.`;

type ChallengeErrors = { index: number, message: string };

export async function getAiTheme(title: string, description: string, apiKey: string): Promise<Challenge[]> {
  // You will need to set these environment variables or edit the following values
  const endpoint = "https://top-ai.openai.azure.com/";
  const apiVersion = "2025-01-01-preview";
  const deployment = "gpt-4.1-mini"; // This must match your deployment name

  const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment, dangerouslyAllowBrowser: true });

  const getResponse = async (messages: ChatCompletionMessageParam[]) => {
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
    return result.choices[0].message.content!;
  }

  const systemPrompt: ChatCompletionMessageParam = {
    role: "system",
    content: `You are an AI model designed to help create new sets of challenges in the word game "Turn of Phrase".
    In "Turn of Phrase", players attempt to describe a short noun phrase to their teammates without using the phrase itself,
    any part of the phrase, or any part of related phrases included in the challenge.

    A set consists of at least 100 Phrase Challenges, which fit a certain theme of the set.
    Each phrase challenge includes a 1-2 word common or proper noun phrase such as "refrigerator", "ice ax", or "Lion King".
    Gerund phrases such as "sightseeing" could also be included.

    Example: for a theme of "Food", phrase challenges could include "Pizza", "Sushi", "Burger", and "Pasta".

    Each phrase challenge also includes 4 additional related 1-2 word phrases (these can be any part of speech).
    These should be selected to make it difficult to describe the main phrase without using them.

    Example: for a challenge where the main phrase is "George Washington",
    the related phrases might include "First President", "United States", "Founding Father", and "American Revolution".
    Small, common words should not be included in related phrases.
    This includes the articles "a" and "the" and small prepositions such as "in", "on", "at", or "of".
    `
  };
  const promptForSubThemes: ChatCompletionMessageParam = {
    role: "user",
    content: `We are generating a new set of Phrase Challenges for theme described below.
    Title: ${title}
    Description: ${description}

    First, list 5-10 sub-themes that fall under the broad theme "${title}".
    Output only a JSON array of strings.
    `
  };
  let messages = [systemPrompt, promptForSubThemes];

  // first get sub-themes for the described theme
  var subThemeResponse = await getResponse(messages);
  var subThemeResponseParsed = JSON.parse(subThemeResponse);
  if (Array.isArray(subThemeResponseParsed) && subThemeResponseParsed.length >= 5 && subThemeResponseParsed.every((s: any) => typeof s === "string")) {
    var subThemes = subThemeResponseParsed as string[];

    // now get a list of main phrases based on the sub-themes
    messages.push({
      // @ts-expect-error: "assistant" is not a valid role in the SDK, but is in the API
      role: "assistant",
      content: subThemeResponse,
    });
    messages.push({
      role: "user",
      content: `For each of these ${subThemes.length} sub-themes,
      list 20-30 noun phrases of 1-2 words each that would be good main phrases on a Phrase Challenge.
      
      Combine the results into a single array. Output only a JSON array of strings.`,
    });
    var mainPhraseResponse = await getResponse(messages);
    var mainPhraseResponseParsed = JSON.parse(mainPhraseResponse);
    if (Array.isArray(mainPhraseResponseParsed) && mainPhraseResponseParsed.every((s: any) => typeof s === "string")) {
      var mainPhrases = new Set(mainPhraseResponseParsed as string[]);

      // now generate challenges
      messages.push({
        // @ts-expect-error: "assistant" is not a valid role in the SDK, but is in the API
        role: "assistant",
        content: JSON.stringify(Array.from(mainPhrases))
      });
      messages.push({
        role: "user",
        content: `For each of these ${mainPhrases.size} main phrases,
        generate a Phrase Challenge with the following properties:
        {
          "Main": "<main_phrase>",
          "Related": ["<related_phrase_1>", "<related_phrase_2>", "<related_phrase_3>", "<related_phrase_4>"]
        }

        ${finalOutputGuidance}
        `
      });

      // now try a few loops of generating the full list of Challenges and validating
      let challenges: Challenge[] | null = null;
      const maxRetries = 3;
      for (let tryCount = 0; tryCount < maxRetries; ++tryCount) {
        const response = await getResponse(messages);

        // push the assistant response onto the messages for context in future requests
        // @ts-expect-error: "assistant" is not a valid role in the SDK, but is in the API
        messages.push({ role: "assistant", content: response });

        // if response cannot be parsed as JSON, include the original response for context, reprompt, and continue
        try {
          challenges = JSON.parse(response);
          console.log(challenges);
        } catch (error) {
          messages.push({
            role: "user",
            content: "The assistant response was not valid JSON. Please try again."
          });
          continue;
        }

        // check if there are at least 100 challenges
        if (challenges!.length < 100) {
          messages.push({
            role: "user",
            content: `The assistant only generated ${challenges!.length} challenges. Generate at least 100 challenges. Please try again.`
          });
          continue;
        }

        // validate every challenge according to the guidelines
        const challengeErrors = validateChallenges(challenges!);
        if (challengeErrors.length > 0) {
          messages.push({
            role: "user",
            content: `Some of the challenges generated were not valid. The following challenges had errors:
        ${challengeErrors.map(e => `Challenge ${e.index + 1}: ${e.message}`).join("\n")}
        Please try again.
        `
          });
          continue;
        }

        return challenges!;
      }

      // we tried our best, even though there were still some errors
      if (challenges) {
        return challenges;
      }
    }
  }

  throw new Error("Failed to generate AI theme");
}

export function validateChallenges(challenges: Challenge[]): ChallengeErrors[] {
  const challengeErrors: ChallengeErrors[] = [];
  const mainPhrasesSeen = new Set<string>();
  for (let i = 0; i < challenges!.length; ++i) {
    const challenge = challenges![i];
    // validate the main phrase
    if (!challenge.Main) {
      challengeErrors.push({ index: i, message: 'The "Main" property is missing.' });
    }
    if (typeof challenge.Main !== "string") {
      challengeErrors.push({ index: i, message: `The "Main" property is not a string, but is ${typeof challenge.Main}.` });
    }
    if (challenge.Main.split(" ").length > 2) {
      challengeErrors.push({ index: i, message: `The "Main" property "${challenge.Main}" is more than 2 words long.` });
    }
    if (mainPhrasesSeen.has(challenge.Main)) {
      challengeErrors.push({ index: i, message: `The "Main" property must be unique, but "${challenge.Main}" is duplicated.` });
    } else {
      mainPhrasesSeen.add(challenge.Main);
    }
    // validate the related phrases
    if (!challenge.Related) {
      challengeErrors.push({ index: i, message: 'The "Related" property is missing.' });
    }
    if (!Array.isArray(challenge.Related)) {
      challengeErrors.push({ index: i, message: `The "Related" property is not an array, but is ${typeof challenge.Related}.` });
    }
    if (challenge.Related.length !== 4) {
      challengeErrors.push({ index: i, message: `The "Related" property must be an array of exactly 4 strings, but has ${challenge.Related.length}.` });
    }
    if (challenge.Related.some(c => typeof c !== "string")) {
      challengeErrors.push({ index: i, message: `The "Related" property must be an array of strings, but one or more elements are not strings.` });
    }
    const overlongRelatedPhrases = challenge.Related.filter(c => c.split(" ").length > 2);
    if (overlongRelatedPhrases.length > 0) {
      challengeErrors.push({ index: i, message: `The "Related" property must be an array of strings, each 1-2 words long, but the following are too long: ${overlongRelatedPhrases.join(", ")}.` });
    }
  }
  return challengeErrors;
}