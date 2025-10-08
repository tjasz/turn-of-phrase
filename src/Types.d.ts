type Theme = {
  Id: string;
  Title: string;
  Description: string;
  Challenges: Challenge[];
};

type ThemeMetadata = {
  Id: string;
  Title: string;
  Description: string;
  ChallengesCount: number;
}

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
};

type GameState = {
  timer: number; // in milliseconds
  score: number[];
  turnTeam: number;
  turnPlayer: number[];
  turnChallenges: ChallengeResult[];
  currentChallengeIdx: number;
};