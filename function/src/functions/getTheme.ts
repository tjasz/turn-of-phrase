import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import BadRequestError from "../errors/BadRequestError";
import * as df from "durable-functions";

export const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5173,https://tjasz.github.io",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
};

export async function getTheme(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Status endpoint: /api/getTheme/status/{instanceId}
    const statusMatch = request.url.match(/\/status\/(.+)$/);
    if (statusMatch) {
        const instanceId = statusMatch[1];
        const client = df.getClient(context);
        const status = await client.getStatus(instanceId);
        if (!status) {
            return {
                status: 404,
                headers: corsHeaders,
                body: `No orchestration found for instanceId: ${instanceId}`,
            };
        }
        return {
            status: 200,
            headers: corsHeaders,
            body: JSON.stringify(status),
        };
    }

    // Start orchestration
    try {
        var requestObject = await getRequestObject(request);
        const client = df.getClient(context);
        const instanceId = await client.startNew("getThemeOrchestrator", { input: requestObject });
        return {
            status: 202,
            headers: corsHeaders,
            body: JSON.stringify({ instanceId, statusQueryGetUri: `/api/getTheme/status/${instanceId}` }),
        };
    } catch (error) {
        if (error instanceof BadRequestError) {
            return {
                status: 400,
                headers: corsHeaders,
                body: `${error.message}`,
            };
        }
        return {
            status: 500,
            headers: corsHeaders,
            body: `Internal server error: ${error.message}`,
        };
    }
}

export async function getRequestObject(request: HttpRequest): Promise<GetThemeRequest | null> {
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
    route: 'getTheme/{*status}',
    handler: getTheme,
    extraInputs: [df.input.durableClient()]
});
