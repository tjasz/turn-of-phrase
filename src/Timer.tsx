import React from "react";

interface TimerProps {
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => (
  <div className="timer">
    <span style={{ color: timeLeft === 0 ? 'red' : undefined }}>
      Time Left: <span className="counter">{timeLeft.toString().padStart(2, ' ')}</span>s
    </span>
  </div>
);

export default Timer;
