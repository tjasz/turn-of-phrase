import { AzureOpenAI } from "openai";

export async function getAiTheme(input: string, apiKey: string): Promise<Challenge[]> {
  // You will need to set these environment variables or edit the following values
  const endpoint = "https://top-ai.openai.azure.com/";
  const apiVersion = "2025-01-01-preview";
  const deployment = "gpt-4.1-mini"; // This must match your deployment name

  const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment, dangerouslyAllowBrowser: true });

  const result = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You are an AI model designed to help create new sets of challenges in the word game \"Turn of Phrase\". A set consists of 100 Phrase Challenges.\n\nOn each phrase challenge is written a 1-3 word improper or proper noun phrase such as \"refrigerator\", \"ice ax\", or \"Lion King\". Gerund phrases such as \"cutting the cheese\" could also be included.\n\nEach phrase challenge also includes 4 additional related 1-2 word phrases (these can be any part of speech). A challenge where the main phrase is \"George Washington\" might include \"First\", \"President\", \"United States\", and \"Founding Father\". Small, common words such as \"the\" or \"of\" will not be included.\n\nUser input should be considered to be a description of a theme. Generate a new set of Phrase Challenges for that theme. Output a JSON document that is a list of objects where each object contains a string property \"Main\" and a list of strings property \"Related\"." },
      { role: "user", content: input },
    ],
    model: deployment,
    max_tokens: 13107,
    temperature: 0.7,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: null
  });

  if (result.choices[0].message.content) {
    console.log("AI Theme:", JSON.parse(result.choices[0].message.content));
  } else {
    throw new Error("Failed to parse AI theme");
  }

  return JSON.parse(result.choices[0].message.content);
}