import React from 'react';
import GameBody from './GameBody';
import Scoreboard from './Scoreboard';

interface StartOfTurnProps {
  scores: number[];
  pointsToWin: number;
  isFinalRound: boolean;
  onConfirm: () => void;
}

const StartOfTurn: React.FC<StartOfTurnProps> = ({ scores, pointsToWin, isFinalRound, onConfirm }) => {
  return (
    <GameBody
      title={isFinalRound ? "Final Round!" : "Start of Turn"}
      actions={[
        { label: 'Start Turn', action: onConfirm },
      ]}
    >
      <Scoreboard scores={scores} pointsToWin={pointsToWin} />
    </GameBody>
  );
};

export default StartOfTurn;
