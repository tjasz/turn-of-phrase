import React from 'react';
import GameBody from './GameBody';

export type ChallengeProps = {
  main: string;
  related: string[];
  onSkip: () => void;
  onCorrect: () => void;
};

const Challenge: React.FC<ChallengeProps> = ({ main, related, onSkip, onCorrect }) => (
  <GameBody
    actions={[
      { label: '❌ Skip', action: onSkip },
      { label: '✔️ Correct', action: onCorrect },
    ]}
  >
    <h3>{main}</h3>
    <ul>
      {related.map((r, i) => <li key={i}>{r}</li>)}
    </ul>
  </GameBody>
);

export default Challenge;
