import { useState, useEffect } from 'react';
import './App.css';

// Theme data (General Knowledge)
type Challenge = {
  Main: string;
  Related: string[];
};

const generalTheme: {
  Title: string;
  Description: string;
  Challenges: Challenge[];
} = {
  Title: "General Knowledge",
  Description: "Common everyday things that many people know.",
  Challenges: [
    { Main: "Refrigerator", Related: ["Cold", "Kitchen", "Food", "Appliance"] },
    { Main: "Umbrella", Related: ["Rain", "Cover", "Weather", "Handle"] },
    { Main: "Bicycle", Related: ["Wheels", "Pedal", "Ride", "Helmet"] },
    { Main: "Toothbrush", Related: ["Teeth", "Brush", "Bathroom", "Clean"] },
    { Main: "Television", Related: ["Screen", "Remote", "Watch", "Channel"] },
    { Main: "Pencil", Related: ["Write", "Eraser", "Lead", "Paper"] },
    { Main: "Backpack", Related: ["Bag", "Strap", "School", "Carry"] },
    { Main: "Sunflower", Related: ["Yellow", "Tall", "Seed", "Bloom"] },
    { Main: "Passport", Related: ["Travel", "Document", "Country", "Stamp"] },
    { Main: "Chocolate", Related: ["Sweet", "Candy", "Cocoa", "Bar"] },
    // ... (add more challenges as needed)
  ]
};

const TURN_TIME_OPTIONS = [10, 20, 30, 40, 50, 60];

function shuffle<T>(array: T[]): T[] {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function App() {
  // Game setup states
  const [numTeams, setNumTeams] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState([2, 2]);
  const [turnTime, setTurnTime] = useState(60);
  const [pointsToWin, setPointsToWin] = useState(15);
  const [penalty, setPenalty] = useState(-1);
  const [gameStarted, setGameStarted] = useState(false);

  // Game states
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
  const [timer, setTimer] = useState(turnTime);
  const [timerActive, setTimerActive] = useState(false);
  const [score, setScore] = useState(Array(numTeams).fill(0));
  const [turnTeam, setTurnTeam] = useState(0);
  const [turnPlayer, setTurnPlayer] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Start game
  const startGame = () => {
    setChallenges(shuffle(generalTheme.Challenges));
    setCurrentChallengeIdx(0);
    setScore(Array(numTeams).fill(0));
    setTurnTeam(0);
    setTurnPlayer(0);
    setGameStarted(true);
    setShowResults(false);
    setTimer(turnTime);
    setTimerActive(false);
    setCorrectCount(0);
    setSkippedCount(0);
  };

  // Timer effect
  useEffect(() => {
    if (!timerActive) return;
    if (timer === 0) {
      setTimerActive(false);
      setShowResults(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  // Handle challenge actions
  const handleCorrect = () => {
    setCorrectCount((c) => c + 1);
    setCurrentChallengeIdx((idx) => idx + 1);
  };
  const handleSkip = () => {
    setSkippedCount((s) => s + 1);
    setCurrentChallengeIdx((idx) => idx + 1);
  };

  // End turn and update score
  const endTurn = () => {
    setScore((prev) => {
      const newScore = [...prev];
      newScore[turnTeam] += correctCount + penalty * skippedCount;
      return newScore;
    });
    // Next team/player
    setTurnTeam((team) => (team + 1) % numTeams);
    setTurnPlayer((player) => (player + 1) % playersPerTeam[turnTeam]);
    setCurrentChallengeIdx((idx) => idx);
    setTimer(turnTime);
    setTimerActive(false);
    setCorrectCount(0);
    setSkippedCount(0);
    setShowResults(false);
  };

  // Check for winner
  const winnerIdx = score.findIndex((s) => s >= pointsToWin);

  // UI
  if (!gameStarted) {
    return (
      <div className="setup">
        <h1>Turn of Phrase</h1>
        <h2>General Knowledge Theme</h2>
        <p>{generalTheme.Description}</p>
        <div>
          <label>Number of Teams: </label>
          <input type="number" min={2} max={4} value={numTeams} onChange={e => {
            const val = Math.max(2, Math.min(4, Number(e.target.value)));
            setNumTeams(val);
            setPlayersPerTeam(Array(val).fill(2));
          }} />
        </div>
        <div>
          {Array(numTeams).map((_, i) => (
            <div key={i}>
              <label>Players in Team {i + 1}: </label>
              <input type="number" min={1} max={8} value={playersPerTeam[i] || 2} onChange={e => {
                const val = Math.max(1, Math.min(8, Number(e.target.value)));
                setPlayersPerTeam(prev => {
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
          <select value={turnTime} onChange={e => setTurnTime(Number(e.target.value))}>
            {TURN_TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label>Points to Win: </label>
          <input type="number" min={5} max={50} value={pointsToWin} onChange={e => setPointsToWin(Number(e.target.value))} />
        </div>
        <div>
          <label>Penalty for Skip/Violation: </label>
          <select value={penalty} onChange={e => setPenalty(Number(e.target.value))}>
            <option value={-0.25}>-0.25</option>
            <option value={-0.5}>-0.5</option>
            <option value={-1}>-1</option>
            <option value={-2}>-2</option>
          </select>
        </div>
        <button className="start-btn" onClick={startGame}>Start Game</button>
      </div>
    );
  }

  if (winnerIdx !== -1) {
    return (
      <div className="winner">
        <h1>Team {winnerIdx + 1} Wins!</h1>
        <p>Score: {score[winnerIdx]}</p>
        <button onClick={() => setGameStarted(false)}>Play Again</button>
      </div>
    );
  }

  // Gameplay UI
  const challenge: Challenge | undefined = challenges[currentChallengeIdx];
  return (
    <div className="gameplay">
      <h2>Team {turnTeam + 1} - Player {turnPlayer + 1}'s Turn</h2>
      <div className="scoreboard">
        {score.map((s, i) => (
          <span key={i}>Team {i + 1}: {s} &nbsp;</span>
        ))}
      </div>
      <div className="timer">
        <span>Time Left: {timer}s</span>
        {!timerActive && !showResults && (
          <button onClick={() => setTimerActive(true)}>Start Turn</button>
        )}
      </div>
      {timerActive && challenge && (
        <div className="challenge">
          <h3>{challenge.Main}</h3>
          <ul>
            {challenge.Related.map((r: string, i: number) => <li key={i}>{r}</li>)}
          </ul>
          <div className="actions">
            <button className="correct" onClick={handleCorrect}>✔️ Correct</button>
            <button className="skip" onClick={handleSkip}>❌ Skip</button>
          </div>
        </div>
      )}
      {showResults && (
        <div className="results">
          <h3>Turn Over!</h3>
          <p>Correct: {correctCount}</p>
          <p>Skipped/Violated: {skippedCount}</p>
          <button onClick={endTurn}>Confirm & Next Turn</button>
        </div>
      )}
    </div>
  );
}

export default App;
