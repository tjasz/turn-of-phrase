type GetThemeRequest = {
  Title: string;
  Description?: string;
  SubThemes?: string[];
  MainPhrases?: string[];
  Challenges?: Challenge[];
}

type Challenge = {
  Main: string;
  Related: string[];
};

type ChallengeErrors = {
  index: number,
  message: string
};