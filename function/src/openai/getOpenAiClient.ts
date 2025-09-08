import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { AzureOpenAI } from "openai";
import { apiVersion, deployment, endpoint, scope } from "./constants";

export function getOpenAiClient() {
  const credential = new DefaultAzureCredential();
  const azureADTokenProvider = getBearerTokenProvider(credential, scope);

  // Initialize the AzureOpenAI client with Entra ID (Azure AD) authentication
  const client = new AzureOpenAI({ endpoint, azureADTokenProvider, apiVersion, deployment });

  return client;
}

export default getOpenAiClient;
