import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { AzureOpenAI } from "openai";
import BadRequestError from "../errors/BadRequestError";
import { getAiTheme } from "../openai";

export async function getTheme(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        var requestObject = await getRequestObject(request);

        var theme = await getAiTheme(requestObject.Title, requestObject.Description);

        return { body: JSON.stringify(theme) };
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
