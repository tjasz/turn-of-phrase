import * as df from "durable-functions";

const orchestrator = df.app.orchestration("getThemeOrchestrator", function* (context) {
  const input = context.df.getInput();
  const theme = yield context.df.callActivity("generateThemeActivity", input);
  return theme;
});

export default orchestrator;
