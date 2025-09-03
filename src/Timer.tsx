import React from "react";

interface TimerProps {
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => (
  <div className="timer">
    <span>Time Left: <pre className="counter">{timeLeft.toString().padStart(2, ' ')}</pre>s</span>
  </div>
);

export default Timer;
