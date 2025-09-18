import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, getRequestObject } from "./getTheme";
import { getOpenAiClient, getResponse, systemPrompt } from "../openai";
import { getPromptForSubThemes } from "../openai/getSubThemes";
import getGenerationPrompt from "../openai/getGenerationPrompt";

export async function getSubThemesFunction(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  var requestObject = await getRequestObject(request);

  const client = getOpenAiClient();
  const generationPrompt = getGenerationPrompt(requestObject.Title, requestObject.Description);
  const subThemePrompt = getPromptForSubThemes(requestObject.Title, requestObject.Description);
  const subThemesResponse = await getResponse(client, [systemPrompt, generationPrompt, subThemePrompt]);
  const subThemes = subThemesResponse.content.split(";").map(s => s.trim()).filter(s => s.length > 0);

  return {
    status: 200,
    headers: corsHeaders,
    body: JSON.stringify(subThemes),
  };
}

app.http('getSubThemes', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'getSubThemes/',
  handler: getSubThemesFunction,
});