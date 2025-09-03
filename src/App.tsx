import { useState, useEffect } from 'react';
import Scoreboard from './Scoreboard';
import Timer from './Timer';
import Challenge from './Challenge';
import EndOfTurn from './EndOfTurn';
import './App.css';
import StartOfTurn from './StartOfTurn';

// Theme data (General Knowledge)
type Challenge = {
  Main: string;
  Related: string[];
};

type Theme = {
  Title: string;
  Description: string;
  Challenges: Challenge[];
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

  // Theme selection and loading
  // Dynamically get theme files using import.meta.glob
  const themeModules = import.meta.glob('/public/themes/*.json');
  const themeFiles = Object.keys(themeModules).map(path => path.split('/').pop()!);
  const [selectedThemeFile, setSelectedThemeFile] = useState<string>(themeFiles[0] || '');
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  // Game states
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
  const [timer, setTimer] = useState(turnTime);
  const [timerActive, setTimerActive] = useState(false);
  const [score, setScore] = useState(Array(numTeams).fill(0));
  const [turnTeam, setTurnTeam] = useState(0);
  const [turnPlayer, setTurnPlayer] = useState(Array(numTeams).fill(0));
  // Track challenge results for the current turn
  const [turnChallenges, setTurnChallenges] = useState<{ main: string; succeeded: boolean }[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Load theme when selectedThemeFile changes
  useEffect(() => {
    setLoadingTheme(true);
    setTheme(null);
    setThemeError(null);
    fetch(`${import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL}/themes/${selectedThemeFile}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load theme');
        return res.json();
      })
      .then((data: Theme) => {
        setTheme(data);
        setLoadingTheme(false);
      })
      .catch(err => {
        setThemeError(err.message);
        setLoadingTheme(false);
      });
  }, [selectedThemeFile]);

  // Start game
  const startGame = () => {
    if (!theme) return;
    setChallenges(shuffle(theme.Challenges));
    setCurrentChallengeIdx(0);
    setScore(Array(numTeams).fill(0));
    setTurnTeam(0);
    setTurnPlayer(Array(numTeams).fill(0));
    setGameStarted(true);
    setShowResults(false);
    setTimer(turnTime);
    setTimerActive(false);
    setTurnChallenges([]);
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
    // Mark current challenge as succeeded
    const challenge = challenges[currentChallengeIdx];
    setTurnChallenges(prev => [...prev, { main: challenge.Main, succeeded: true }]);
    setCurrentChallengeIdx((idx) => idx + 1);
  };
  const handleSkip = () => {
    // Mark current challenge as skipped
    const challenge = challenges[currentChallengeIdx];
    setTurnChallenges(prev => [...prev, { main: challenge.Main, succeeded: false }]);
    setCurrentChallengeIdx((idx) => idx + 1);
  };

  // End turn and update score
  const endTurn = (correctCount: number, skippedCount: number) => {
    setScore((prev) => {
      const newScore = [...prev];
      newScore[turnTeam] += correctCount + penalty * skippedCount;
      return newScore;
    });
    // Next team/player
    setTurnTeam((team) => (team + 1) % numTeams);
    setTurnPlayer((player) => player.map((p, i) => i === turnTeam ? (p + 1) % playersPerTeam[turnTeam] : p));
    setCurrentChallengeIdx((idx) => idx + 1);
    setTimer(turnTime);
    setTimerActive(false);
    setTurnChallenges([]);
    setShowResults(false);
  };

  // Check for winner
  const winnerIdx = score.some(s => s >= pointsToWin) && (turnTeam === 0)
    ? score.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)
    : -1;

  // UI
  if (loadingTheme) {
    return <div className="setup"><h1>Loading theme...</h1></div>;
  }
  if (themeError) {
    return <div className="setup"><h1>Error loading theme</h1><p>{themeError}</p></div>;
  }
  if (!theme) {
    return <div className="setup"><h1>No theme loaded</h1></div>;
  }
  if (!gameStarted) {
    return (
      <div className="setup">
        <h1>Turn of Phrase</h1>
        <div>
          <label>Theme: </label>
          <select value={selectedThemeFile} onChange={e => setSelectedThemeFile(e.target.value)}>
            {themeFiles.map(file => (
              <option key={file} value={file}>{file.replace('.json', '').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
        </div>
        {theme && (
          <>
            <h2>{theme.Title}</h2>
            <p>{theme.Description}</p>
          </>
        )}
        <div>
          <label>Number of Teams: </label>
          <input type="number" min={2} max={5} value={numTeams} onChange={e => {
            const val = Math.max(2, Math.min(5, Number(e.target.value)));
            setNumTeams(val);
            setPlayersPerTeam(Array(val).fill(2));
          }} />
        </div>
        <div>
          {Array(numTeams).fill(0).map((_, i) => (
            <div key={i}>
              <label>Players in Team {i + 1}: </label>
              <input type="number" min={2} max={12} value={playersPerTeam[i] || 2} onChange={e => {
                const val = Math.max(2, Math.min(12, Number(e.target.value)));
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
        <button className="start-btn" onClick={startGame} disabled={!theme}>Start Game</button>
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
  // Exclude the last challenge (timed out) from review
  const reviewedChallenges = turnChallenges;
  return (
    <div className="gameplay">
      <h2>Team {turnTeam + 1} - Player {turnPlayer[turnTeam] + 1}'s Turn</h2>
      {score.some(s => s >= pointsToWin) && (
        <div className="final-round">
          <h2>Final Round!</h2>
        </div>
      )}
      <Scoreboard scores={score} />
      <Timer timeLeft={timer} />
      {timerActive && challenge && (
        <Challenge
          main={challenge.Main}
          related={challenge.Related}
          onSkip={handleSkip}
          onCorrect={handleCorrect}
        />
      )}
      {showResults && (
        <EndOfTurn
          challenges={reviewedChallenges}
          onConfirm={endTurn}
        />
      )}
      <div className="actions">
        {!timerActive && !showResults && (
          <StartOfTurn onConfirm={() => setTimerActive(true)} />
        )}
      </div>
    </div>
  );
}

export default App;
