import React from 'react';
import GameBody from './GameBody';

interface EndOfGameProps {
  winnerIdx: number;
  onConfirm: () => void;
}

const EndOfGame: React.FC<EndOfGameProps> = ({ winnerIdx, onConfirm }) => {
  return (
    <GameBody
      title={`Team ${winnerIdx + 1} Wins!`}
      actions={[
        { label: 'Play Again', action: onConfirm },
      ]}
    />
  );
};

export default EndOfGame;
