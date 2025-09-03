import React from "react";
import type { ReactNode } from "react";

export interface GameAction {
  label: string;
  action: () => void;
}

interface GameBodyProps {
  actions: GameAction[];
  children?: ReactNode;
}

const GameBody: React.FC<GameBodyProps> = ({ actions, children }) => {
  return (
    <div className="gameBodyContainer">
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
