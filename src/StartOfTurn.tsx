import React from 'react';

interface StartOfTurnProps {
  onConfirm: () => void;
}

const StartOfTurn: React.FC<StartOfTurnProps> = ({ onConfirm }) => {
  return (
    <div className="start-of-turn">
      <button onClick={onConfirm}>Start Turn</button>
    </div>
  );
};

export default StartOfTurn;
