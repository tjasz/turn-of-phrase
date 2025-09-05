import { AzureOpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import systemPrompt from "./systemPrompt";
import finalOutputGuidance from "./finalOutputGuidance";
import validateChallenges from "./validateChallenges";

async function getAiTheme(title: string, description: string, apiKey: string): Promise<Challenge[]> {
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

export { validateChallenges, getAiTheme };
