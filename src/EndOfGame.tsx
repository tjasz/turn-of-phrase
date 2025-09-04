import React from 'react';
import GameBody from './GameBody';
import Scoreboard from './Scoreboard';

interface EndOfGameProps {
  winnerIdx: number;
  scores: number[];
  pointsToWin: number;
  onConfirm: () => void;
}

const EndOfGame: React.FC<EndOfGameProps> = ({ winnerIdx, scores, pointsToWin, onConfirm }) => {
  return (
    <GameBody
      title={`Team ${winnerIdx + 1} Wins!`}
      actions={[
        { label: 'Play Again', action: onConfirm },
      ]}
    >
      <Scoreboard scores={scores} pointsToWin={pointsToWin} />
    </GameBody>
  );
};

export default EndOfGame;
