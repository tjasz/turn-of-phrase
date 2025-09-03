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
  return (
    <div className="gameBodyContainer">
      <h3>{title}</h3>
      <div className="mainGameBody">
        {children}
      </div>
      <div className="actions">
        {actions.map((a, idx) => (
          <button key={idx} onClick={a.action}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameBody;
