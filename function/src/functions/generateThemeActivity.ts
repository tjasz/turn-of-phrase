import { getAiTheme } from "../openai";

export async function generateThemeActivity(input: { Title: string; Description: string }) {
  const theme = await getAiTheme(input.Title, input.Description);
  return theme;
}
