import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { AzureOpenAI } from "openai";
import BadRequestError from "../errors/BadRequestError";

export async function getTheme(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        var requestObject = await getRequestObject(request);

        // You will need to set these environment variables or edit the following values
        const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] || "https://top-ai.openai.azure.com/";
        const apiVersion = "2025-01-01-preview";
        const deployment = "gpt-4.1-mini"; // This must match your deployment name

        // Initialize the DefaultAzureCredential
        const credential = new DefaultAzureCredential();
        const scope = "https://cognitiveservices.azure.com/.default";
        const azureADTokenProvider = getBearerTokenProvider(credential, scope);

        // Initialize the AzureOpenAI client with Entra ID (Azure AD) authentication
        const client = new AzureOpenAI({ endpoint, azureADTokenProvider, apiVersion, deployment });

        const result = await client.chat.completions.create({
            messages: [
                { role: "system", content: "You are an AI assistant that helps people find information." },
                { role: "user", content: `What is the theme for ${requestObject.Title}?` }
            ],
            model: deployment,
            max_tokens: 13107,
            temperature: 0.7,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop: null
        });

        return { body: JSON.stringify(result.choices[0].message.content, null, 2) };
    } catch (error) {
        if (error instanceof BadRequestError) {
            return { status: 400, body: `${error.message}` };
        }
        return { status: 500, body: `Internal server error: ${error.message}` };
    }
};

async function getRequestObject(request: HttpRequest): Promise<GetThemeRequest | null> {
    try {
        var requestText = await request.text();
        var requestJson = JSON.parse(requestText || '{}');
    } catch (error) {
        throw new BadRequestError(`Failed to parse request body: ${error}`);
    }

    if (typeof requestJson !== 'object' || requestJson === null) {
        throw new BadRequestError('Request body must be an object');
    }

    if (!requestJson.Title) {
        throw new BadRequestError('Missing field "Title" in request body');
    }

    if (typeof requestJson.Title !== 'string') {
        throw new BadRequestError('Field "Title" must be a string');
    }

    if (requestJson.Title === '') {
        throw new BadRequestError('Field "Title" must not be empty');
    }

    if (!requestJson.Description) {
        throw new BadRequestError('Missing field "Description" in request body');
    }

    if (typeof requestJson.Description !== 'string') {
        throw new BadRequestError('Field "Description" must be a string');
    }

    if (requestJson.Description === '') {
        throw new BadRequestError('Field "Description" must not be empty');
    }

    return requestJson as GetThemeRequest;
}

app.http('getTheme', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: getTheme
});
