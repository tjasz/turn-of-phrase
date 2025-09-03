
import React, { useState } from "react";
import GameBody from "./GameBody";

interface ChallengeSummary {
  main: string;
  succeeded: boolean;
}

interface EndOfTurnProps {
  challenges: ChallengeSummary[];
  onConfirm: (correctCount: number, skippedCount: number) => void;
}

const EndOfTurn: React.FC<EndOfTurnProps> = ({ challenges, onConfirm }) => {
  const [results, setResults] = useState<ChallengeSummary[]>(challenges);

  const handleToggle = (idx: number) => {
    setResults(prev =>
      prev.map((c, i) =>
        i === idx ? { ...c, succeeded: !c.succeeded } : c
      )
    );
  };

  const correctCount = results.filter(c => c.succeeded).length;
  const skippedCount = results.length - correctCount;

  return (
    <GameBody
      actions={[
        { label: 'Confirm & End Turn', action: () => onConfirm(correctCount, skippedCount) }
      ]}
    >
      <h2>End of Turn</h2>
      <ul>
        {results.map((challenge, idx) => (
          <li key={idx}>
            <label>
              <input
                type="checkbox"
                checked={challenge.succeeded}
                onChange={() => handleToggle(idx)}
              />
              {challenge.main}
            </label>
          </li>
        ))}
      </ul>
      <p>Correct: {correctCount}</p>
      <p>Skipped: {skippedCount}</p>
    </GameBody>
  );
};

export default EndOfTurn;
