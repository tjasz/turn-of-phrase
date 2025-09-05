
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
    "var(--team-red)",
    "var(--team-green)",
    "var(--team-purple)",
    "var(--team-yellow)",
    "var(--team-blue)",
  ];

  // allow 2 rem for each team and for the axis and top label
  const height = 2 * (scores.length + 2);

  return (
    <div className="scoreboard" style={{ width: "100%", height: `${height}rem` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" domain={[0, Math.max(pointsToWin, ...scores) + 5]} stroke="var(--text)" />
          <YAxis type="category" dataKey="name" stroke="var(--text)" />
          <Bar dataKey="score" name="Score">
            <LabelList dataKey="score" position="right" />
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
          <ReferenceLine x={pointsToWin} stroke="var(--text)" label={{ value: "W", position: "top", fill: "var(--text)" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Scoreboard;
