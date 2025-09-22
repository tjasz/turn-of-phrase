import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, getRequestObject } from "./getTheme";
import { getOpenAiClient, getResponse, systemPrompt } from "../openai";
import getGenerationPrompt from "../openai/getGenerationPrompt";
import { ChatCompletionMessageParam } from "openai/resources";

function getPromptForDescription(title: string, description?: string): ChatCompletionMessageParam {
  let content = `Provide a concise description for the theme titled "${title}".
The description should be brief (one sentence) while highlighting the key aspects of the theme.
Do not include any introductory phrases like "The theme is" or "This theme".
Do not highlight that it is a theme or a set of challenges.
Output only the description without any additional commentary or formatting.`;

  if (description && description.trim().length > 0) {
    content += `\n\nHere is a draft description: "${description}". You can enhance, refine, or replace it as needed.`;
  }

  return {
    role: "user",
    content,
  };
}

export async function getDescriptionFunction(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  var requestObject = await getRequestObject(request);

  const client = getOpenAiClient();
  const generationPrompt = getGenerationPrompt(requestObject.Title, requestObject.Description);
  const descriptionPrompt = getPromptForDescription(requestObject.Title, requestObject.Description);
  const descriptionResponse = await getResponse(client, [systemPrompt, generationPrompt, descriptionPrompt]);

  return {
    status: 200,
    headers: corsHeaders,
    body: JSON.stringify(descriptionResponse.content),
  };
}

app.http('getDescription', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'getDescription/',
  handler: getDescriptionFunction,
});