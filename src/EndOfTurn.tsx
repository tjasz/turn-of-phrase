import React from "react";

interface EndOfTurnProps {
  correctCount: number;
  skippedCount: number;
  endTurn: () => void;
}

const EndOfTurn: React.FC<EndOfTurnProps> = ({ correctCount, skippedCount, endTurn }) => {
  return (
    <div className="results">
      <h2>End of Turn</h2>
      <p>Correct: {correctCount}</p>
      <p>Skipped: {skippedCount}</p>
      <button onClick={endTurn}>End Turn</button>
    </div>
  );
};

export default EndOfTurn;
