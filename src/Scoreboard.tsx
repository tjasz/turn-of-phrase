import React from "react";

interface ScoreboardProps {
  scores: number[];
}

const Scoreboard: React.FC<ScoreboardProps> = ({ scores }) => {
  return (
    <div className="scoreboard">
      {scores.map((score, idx) => (
        <span key={idx}>Team {idx + 1}: <span className="counter">{score.toString().padStart(2, ' ')}</span> &nbsp;</span>
      ))}
    </div>
  );
};

export default Scoreboard;
