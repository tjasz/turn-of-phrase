
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  LabelList,
  Cell
} from "recharts";

interface ScoreboardProps {
  scores: number[];
  pointsToWin: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ scores, pointsToWin }) => {
  // Prepare data for recharts
  const data = scores.map((score, idx) => ({
    name: `Team ${idx + 1}`,
    score
  }));

  const colors = [
    "#c88",
    "#8c8",
    "#cc8",
    "#8cc",
    "#c8c",
  ];

  return (
    <div className="scoreboard" style={{ width: "100%", height: `${4 * scores.length}rem` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" domain={[0, Math.max(pointsToWin, ...scores) + 5]} stroke="black" />
          <YAxis type="category" dataKey="name" stroke="black" />
          <Bar dataKey="score" fill="#8884d8" name="Score">
            <LabelList dataKey="score" position="right" />
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
          <ReferenceLine x={pointsToWin} stroke="black" label={{ value: "W", position: "top", fill: "black" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Scoreboard;
