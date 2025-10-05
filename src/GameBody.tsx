import { Button } from "@mui/material";
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
  return (
    <div className="gameBodyContainer">
      <div className="mainGameBody">
        <div className="innerGameBody">
          <h3>{title}</h3>
          {children}
        </div>
      </div>
      <div className="actions">
        {actions.map((a, idx) => (
          <Button
            key={idx}
            onClick={a.action}
            style={{ width: `${buttonWidth}%` }}
            variant="contained"
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default GameBody;
