import defaultTheme from "./defaultTheme";

export const defaultGameSettings: GameSettings = {
  numberOfTeams: 2,
  numberOfPlayersByTeam: [2, 2],
  turnTimeSeconds: 60,
  pointsToWin: 15,
  skipPenalty: -1,
  theme: defaultTheme,
};