type Theme = {
  Title: string;
  Description: string;
  Challenges: Challenge[];
};

type Challenge = {
  Main: string;
  Related: string[];
};

type ChallengeErrors = {
  index: number,
  message: string
};

type GameSettings = {
  numberOfTeams: number;
  numberOfPlayersByTeam: number[];
  turnTimeSeconds: number;
  pointsToWin: number;
  skipPenalty: number;
  theme: Theme;
};