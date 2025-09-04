import React from "react";
import Counter from "./Counter";

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const percentLeft = (timeLeft / totalTime) * 100;
  return (
    <div className="timer" style={{
      background: `linear-gradient(to right, #888 ${percentLeft}%, transparent ${percentLeft}% 100%)`
    }}>
      <span>
        Time Left: <Counter value={Math.ceil(timeLeft / 1000)} width={2} />s
      </span>
    </div>
  );
}

export default Timer;
