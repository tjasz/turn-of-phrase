type GetThemeRequest = {
  Title: string;
  Description: string;
}

type Challenge = {
  Main: string;
  Related: string[];
};

type ChallengeErrors = {
  index: number,
  message: string
};