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
  Editing?: boolean;
}

type ThemeRequest = {
  OperationId: string;
  Title: string;
  Description: string;
  SubThemes: string[];
  MainPhrases: string[];
  Challenges: Challenge[];
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