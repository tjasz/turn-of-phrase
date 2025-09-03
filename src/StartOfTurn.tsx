import React from 'react';
import GameBody from './GameBody';

interface StartOfTurnProps {
  onConfirm: () => void;
}

const StartOfTurn: React.FC<StartOfTurnProps> = ({ onConfirm }) => {
  return (
    <GameBody
      title="Start of Turn"
      actions={[
        { label: 'Start Turn', action: onConfirm },
      ]}
    />
  );
};

export default StartOfTurn;
