import React from 'react';
import GameBody from './GameBody';

interface EndOfGameProps {
  winnerIdx: number;
  onConfirm: () => void;
}

const EndOfGame: React.FC<EndOfGameProps> = ({ winnerIdx, onConfirm }) => {
  return (
    <GameBody
      actions={[
        { label: 'Play Again', action: onConfirm },
      ]}
    >
      <h1>Team {winnerIdx + 1} Wins!</h1>
    </GameBody>
  );
};

export default EndOfGame;
