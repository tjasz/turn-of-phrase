import React from "react";
import type { ReactNode } from "react";

export interface GameAction {
  label: string;
  action: () => void;
}

interface GameBodyProps {
  title: string;
  actions: GameAction[];
  children?: ReactNode;
}

const GameBody: React.FC<GameBodyProps> = ({ title, actions, children }) => {
  const buttonWidth = 100 / actions.length;
  const backgroundRotation = (title.charCodeAt(1) - 109);
  return (
    <div className="gameBodyContainer">
      <div className="mainGameBody">
        <div className="innerGameBody">
          <h3>{title}</h3>
          {children}
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Turn of Phrase Logo"
            style={{ transform: `translate(-50%, -50%) rotate(${backgroundRotation}deg)` }}
          />
        </div>
      </div>
      <div className="actions">
        {actions.map((a, idx) => (
          <button key={idx} onClick={a.action} style={{ width: `${buttonWidth}%` }}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameBody;
