import React from "react";
import Counter from "./Counter";

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const percentLeft = Math.floor((timeLeft / totalTime) * 100);
  return (
    <div className="timer" style={{
      background: `linear-gradient(to right, var(--accent) ${percentLeft}%, transparent ${percentLeft}% 100%)`,
      color: percentLeft < 50 ? 'var(--text)' : 'var(--accent-text)',
      textShadow: `${percentLeft < 50 ? '#0000' : 'var(--shadowColor)'} 0 0 4px`,
    }}>
      <span>Time Left: <Counter value={Math.ceil(timeLeft / 1000)} width={2} />s</span>
    </div>
  );
}

export default Timer;
