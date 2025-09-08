import * as df from "durable-functions";

const orchestrator = df.app.orchestration("getThemeOrchestrator", function* (context) {
  const input = context.df.getInput();
  console.log("Orchestrator input:", input);
  const subThemes = yield context.df.callActivity("getSubThemesActivity", input);
  return subThemes;
});

export default orchestrator;
