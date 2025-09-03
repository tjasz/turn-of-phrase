import React from "react";

interface ScoreboardProps {
  scores: number[];
}

const Scoreboard: React.FC<ScoreboardProps> = ({ scores }) => {
  return (
    <div className="scoreboard">
      {scores.map((score, idx) => (
        <span key={idx}>Team {idx + 1}: {score} &nbsp;</span>
      ))}
    </div>
  );
};

export default Scoreboard;
