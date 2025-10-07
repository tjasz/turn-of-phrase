type Theme = {
  Title: string;
  Description: string;
  Challenges: Challenge[];
};

type Challenge = {
  Main: string;
  Related: string[];
};

type ChallengeResult = {
  main: string;
  succeeded: boolean;
}

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

type GameState = {
  timer: number; // in milliseconds
  score: number[];
  turnTeam: number;
  turnPlayer: number[];
  turnChallenges: ChallengeResult[];
  currentChallengeIdx: number;
};