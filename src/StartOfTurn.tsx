import React from 'react';
import GameBody from './GameBody';
import Scoreboard from './Scoreboard';

interface StartOfTurnProps {
  scores: number[];
  pointsToWin: number;
  onConfirm: () => void;
}

const StartOfTurn: React.FC<StartOfTurnProps> = ({ scores, pointsToWin, onConfirm }) => {
  return (
    <GameBody
      title="Start of Turn"
      actions={[
        { label: 'Start Turn', action: onConfirm },
      ]}
    >
      <Scoreboard scores={scores} pointsToWin={pointsToWin} />
    </GameBody>
  );
};

export default StartOfTurn;
