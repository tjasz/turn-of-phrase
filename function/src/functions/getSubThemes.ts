import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, getRequestObject } from "./getTheme";
import { getOpenAiClient, getResponse, systemPrompt } from "../openai";
import { getPromptForSubThemes } from "../openai/getSubThemes";

export async function getSubThemesFunction(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  var requestObject = await getRequestObject(request);

  const client = getOpenAiClient();
  const subThemePrompt = getPromptForSubThemes(requestObject.Title, requestObject.Description);
  const subThemes = await getResponse(client, [systemPrompt, subThemePrompt]);

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