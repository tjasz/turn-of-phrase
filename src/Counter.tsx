import React from "react";

interface CounterProps {
  value: number;
  width?: number;
}

const Counter: React.FC<CounterProps> = ({ value, width = 2 }) => {
  const display = value.toString().padStart(width, ' ');
  return <span className="counter">{display}</span>;
};

export default Counter;
