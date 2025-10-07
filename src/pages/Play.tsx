import { useState, useEffect } from 'react';
import { useLocalStorage } from "react-use";
import { useNavigate } from 'react-router-dom';

import shuffle from '../shuffle';
import Timer from '../Timer';
import Challenge from '../Challenge';
import EndOfTurn from '../EndOfTurn';
import '../App.css';
import StartOfTurn from '../StartOfTurn';
import EndOfGame from '../EndOfGame';
import GameSettingsView from '../GameSettingsView';
import defaultTheme from '../defaultTheme';
import { defaultGameSettings } from '../defaultGameSettings';

function getWinner(scores: number[]): number {
  if (scores.length === 0) {
    return -1;
  }

  let maxI: number[] = [];
  let max: number | undefined = undefined;
  for (let i = 0; i < scores.length; i++) {
    if (max === undefined || scores[i] > max) {
      max = scores[i];
      maxI = [i];
    } else if (scores[i] === max) {
      maxI.push(i);
    }
  }
  // if there is a tie, there is no winner
  if (maxI.length > 1) {
    return -1;
  }

  return maxI[0];
}

function Play() {
  // Game states
  const [gameSettings] = useLocalStorage<GameSettings>('turn-of-phrase/settings', defaultGameSettings);

  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
  const [timer, setTimer] = useState((gameSettings!.turnTimeSeconds) * 1000);
  const [timerActive, setTimerActive] = useState(false);
  const [score, setScore] = useState(Array(gameSettings!.numberOfTeams).fill(0));
  const [turnTeam, setTurnTeam] = useState(0);
  const [turnPlayer, setTurnPlayer] = useState(Array(gameSettings!.numberOfTeams).fill(0));
  // Track challenge results for the current turn
  const [turnChallenges, setTurnChallenges] = useState<{ main: string; succeeded: boolean }[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!timerActive) return;
    if (timer === 0) {
      setTimerActive(false);
      setShowResults(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => t > 0 ? t - 100 : 0);
    }, 100);
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  // Handle challenge actions
  const handleCorrect = () => {
    // Mark current challenge as succeeded
    const challenge = challenges[currentChallengeIdx % challenges.length];
    setTurnChallenges(prev => [...prev, { main: challenge.Main, succeeded: true }]);
    setCurrentChallengeIdx((idx) => idx + 1);
  };
  const handleSkip = () => {
    // Mark current challenge as skipped
    const challenge = challenges[currentChallengeIdx % challenges.length];
    setTurnChallenges(prev => [...prev, { main: challenge.Main, succeeded: false }]);
    setCurrentChallengeIdx((idx) => idx + 1);
  };

  // End turn and update score
  const endTurn = (correctCount: number, skippedCount: number) => {
    setScore((prev) => {
      const newScore = [...prev];
      newScore[turnTeam] += correctCount + (gameSettings!.skipPenalty ?? -1) * skippedCount;
      return newScore;
    });
    // Next team/player
    setTurnTeam((team) => (team + 1) % gameSettings!.numberOfTeams);
    setTurnPlayer((player) => player.map((p, i) => i === turnTeam ? (p + 1) % gameSettings!.numberOfPlayersByTeam[turnTeam] : p));
    setCurrentChallengeIdx((idx) => idx + 1);
    setTimer(gameSettings!.turnTimeSeconds * 1000);
    setTimerActive(false);
    setTurnChallenges([]);
    setShowResults(false);
  };

  // Check for winner
  const winnerIdx = score.some(s => s >= gameSettings!.pointsToWin) && (turnTeam === 0)
    ? getWinner(score)
    : -1;

  // Gameplay UI
  const challenge: Challenge | undefined = challenges[currentChallengeIdx % challenges.length];
  // Include the last challenge (timed out) in review, as not marked correct
  const reviewedChallenges = [...turnChallenges, { main: challenge?.Main ?? '', succeeded: false }];
  return <>
    <div className="gameplay">
      <h2>Team {turnTeam + 1} - Player {turnPlayer[turnTeam] + 1}'s Turn</h2>
      <Timer timeLeft={timer} totalTime={gameSettings!!.turnTimeSeconds * 1000} />
      {winnerIdx !== -1 && (
        <EndOfGame
          winnerIdx={winnerIdx}
          scores={score}
          pointsToWin={gameSettings!.pointsToWin}
          onConfirm={() => navigate("/")}
        />
      )}
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
      {!timerActive && !showResults && winnerIdx === -1 && (
        <StartOfTurn
          scores={score}
          pointsToWin={gameSettings!.pointsToWin}
          isFinalRound={score.some(s => s >= gameSettings!.pointsToWin)}
          onConfirm={() => setTimerActive(true)}
        />
      )}
    </div>
  </>
}

export default Play;
