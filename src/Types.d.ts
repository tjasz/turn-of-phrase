type Theme = {
  Title: string;
  Description: string;
  Challenges: Challenge[];
};

type Challenge = {
  Main: string;
  Related: string[];
};