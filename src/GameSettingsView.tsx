import type React from "react";
import { useState } from "react";
import ThemeSelector from "./ThemeSelector";
import validateChallenges from "./validateChallenges";

const TURN_TIME_OPTIONS = [10, 20, 30, 40, 50, 60];

interface GameSettingsProps {
  currentSettings: GameSettings;
  onConfirm: (settings: GameSettings) => void;
}

export const GameSettingsView: React.FC<GameSettingsProps> = ({ currentSettings, onConfirm }) => {
  const [numberOfTeams, setNumberOfTeams] = useState(currentSettings.numberOfTeams);
  const [numberOfPlayersByTeam, setNumberOfPlayersByTeam] = useState(currentSettings.numberOfPlayersByTeam);
  const [turnTimeSeconds, setTurnTimeSeconds] = useState(currentSettings.turnTimeSeconds);
  const [pointsToWin, setPointsToWin] = useState(currentSettings.pointsToWin);
  const [skipPenalty, setSkipPenalty] = useState(currentSettings.skipPenalty);
  const [challenges, setChallenges] = useState<Challenge[]>(currentSettings.theme?.Challenges ?? []);

  return (
    <div className="setup">
      <ThemeSelector onSelectChallenges={challenges => {
        setChallenges(challenges);
        const challengeErrors = validateChallenges(challenges);
        if (challengeErrors[1].length > 0) {
          console.warn(`Selected challenges have invalid entries:`, challengeErrors);
        }
      }} />
      <div>
        <label>Number of Teams: </label>
        <input type="number" min={2} max={5} value={numberOfTeams} onChange={e => {
          const val = Math.max(2, Math.min(5, Number(e.target.value)));
          setNumberOfTeams(val);
          setNumberOfPlayersByTeam(Array(val).fill(2));
        }} />
      </div>
      <div>
        {Array(numberOfTeams).fill(0).map((_, i) => (
          <div key={i}>
            <label>Players in Team {i + 1}: </label>
            <input type="number" min={2} max={12} value={numberOfPlayersByTeam[i] || 2} onChange={e => {
              const val = Math.max(2, Math.min(12, Number(e.target.value)));
              setNumberOfPlayersByTeam(prev => {
                const arr = [...prev];
                arr[i] = val;
                return arr;
              });
            }} />
          </div>
        ))}
      </div>
      <div>
        <label>Turn Time (seconds): </label>
        <select value={turnTimeSeconds} onChange={e => setTurnTimeSeconds(Number(e.target.value))}>
          {TURN_TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label>Points to Win: </label>
        <input type="number" min={5} max={50} value={pointsToWin} onChange={e => setPointsToWin(Number(e.target.value))} />
      </div>
      <div>
        <label>Penalty for Skip/Violation: </label>
        <select value={skipPenalty} onChange={e => setSkipPenalty(Number(e.target.value))}>
          <option value={0}>0</option>
          <option value={-0.25}>-0.25</option>
          <option value={-0.5}>-0.5</option>
          <option value={-1}>-1</option>
          <option value={-2}>-2</option>
        </select>
      </div>
      <button className="start-btn" onClick={() => onConfirm({
        numberOfTeams,
        numberOfPlayersByTeam,
        turnTimeSeconds,
        pointsToWin,
        skipPenalty,
        theme: { Title: "Custom", Description: "Custom set of challenges", Challenges: challenges }
      })} disabled={challenges.length === 0}>Start Game</button>
    </div>
  );
}

export default GameSettingsView;