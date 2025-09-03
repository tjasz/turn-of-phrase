import React from "react";
import Counter from "./Counter";

interface TimerProps {
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => (
  <div className="timer">
    <span style={{ color: timeLeft === 0 ? 'red' : undefined }}>
      Time Left: <Counter value={timeLeft} width={2} />s
    </span>
  </div>
);

export default Timer;
