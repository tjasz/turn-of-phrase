import React from 'react';

export type ChallengeProps = {
  main: string;
  related: string[];
  onSkip: () => void;
  onCorrect: () => void;
};

const Challenge: React.FC<ChallengeProps> = ({ main, related, onSkip, onCorrect }) => (
  <div className="challenge">
    <h3>{main}</h3>
    <ul>
      {related.map((r, i) => <li key={i}>{r}</li>)}
    </ul>
    <div className="actions">
      <button className="skip" onClick={onSkip}>❌ Skip</button>
      <button className="correct" onClick={onCorrect}>✔️ Correct</button>
    </div>
  </div>
);

export default Challenge;
