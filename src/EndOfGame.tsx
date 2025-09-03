import React from 'react';

interface EndOfGameProps {
  winnerIdx: number;
  onConfirm: () => void;
}

const EndOfGame: React.FC<EndOfGameProps> = ({ winnerIdx, onConfirm }) => {
  return (
    <div className="endOfGame">
      <h1>Team {winnerIdx + 1} Wins!</h1>
      <button onClick={onConfirm}>Play Again</button>
    </div>
  );
};

export default EndOfGame;
