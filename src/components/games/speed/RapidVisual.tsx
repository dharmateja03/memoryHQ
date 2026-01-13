'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface RapidVisualProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { targetRatio: 0.3, displayTime: 200, interTrialInterval: 800 },
  2: { targetRatio: 0.3, displayTime: 180, interTrialInterval: 700 },
  3: { targetRatio: 0.25, displayTime: 160, interTrialInterval: 650 },
  4: { targetRatio: 0.25, displayTime: 140, interTrialInterval: 600 },
  5: { targetRatio: 0.2, displayTime: 120, interTrialInterval: 550 },
  6: { targetRatio: 0.2, displayTime: 100, interTrialInterval: 500 },
  7: { targetRatio: 0.2, displayTime: 80, interTrialInterval: 450 },
  8: { targetRatio: 0.15, displayTime: 70, interTrialInterval: 400 },
  9: { targetRatio: 0.15, displayTime: 60, interTrialInterval: 350 },
  10: { targetRatio: 0.15, displayTime: 50, interTrialInterval: 300 },
};

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');
const TARGET = 'X';

const gameConfig = {
  id: 'rapid-visual',
  name: 'Rapid Visual Processing',
  description: 'Detect targets in a rapid stream of letters.',
  instructions: 'Watch the rapidly flashing letters. Press SPACE or tap whenever you see the letter X. React as fast as you can!',
  domain: 'speed',
};

export function RapidVisual({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: RapidVisualProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 60;

  const {
    state: gameState,
    showInstructions,
    startCountdown,
    startGame,
    pauseGame,
    resumeGame,
    completeGame,
    nextRound,
    recordResponse,
    resetGame,
    setDifficulty,
  } = useGameState(totalRounds, difficulty);

  const reactionTime = useReactionTime();

  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [isTarget, setIsTarget] = useState(false);
  const [responded, setResponded] = useState(false);
  const [feedback, setFeedback] = useState<'hit' | 'miss' | 'false' | null>(null);
  const [stats, setStats] = useState({ hits: 0, misses: 0, falseAlarms: 0, avgRT: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const displayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const showNextLetter = useCallback(() => {
    if (gameState.currentRound > totalRounds) {
      completeGame();
      return;
    }

    const isTargetTrial = Math.random() < config.targetRatio;
    const letter = isTargetTrial ? TARGET : LETTERS[Math.floor(Math.random() * LETTERS.length)];

    setCurrentLetter(letter);
    setIsTarget(isTargetTrial);
    setResponded(false);
    setFeedback(null);
    reactionTime.start();

    // Hide letter after display time
    displayTimerRef.current = setTimeout(() => {
      setCurrentLetter(null);
    }, config.displayTime);

    // Check for miss after response window
    timerRef.current = setTimeout(() => {
      if (isTargetTrial && !responded) {
        setFeedback('miss');
        setStats(s => ({ ...s, misses: s.misses + 1 }));
        recordResponse(false, config.displayTime + config.interTrialInterval);
      } else if (!isTargetTrial) {
        recordResponse(true, 0);
      }

      nextRound();
    }, config.displayTime + config.interTrialInterval);
  }, [gameState.currentRound, totalRounds, config, responded, reactionTime, recordResponse, completeGame, nextRound]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && currentLetter === null && !feedback) {
      const delay = setTimeout(() => {
        showNextLetter();
      }, 100);
      return () => clearTimeout(delay);
    }
  }, [gameState.status, gameState.currentRound, currentLetter, feedback, showNextLetter]);

  const handleResponse = useCallback(() => {
    if (responded || gameState.status !== 'playing') return;

    setResponded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    const rt = reactionTime.stop();

    if (isTarget) {
      setFeedback('hit');
      setReactionTimes(prev => [...prev, rt]);
      setStats(s => ({
        ...s,
        hits: s.hits + 1,
        avgRT: Math.round([...reactionTimes, rt].reduce((a, b) => a + b, 0) / ([...reactionTimes, rt].length))
      }));
      recordResponse(true, rt);
    } else {
      setFeedback('false');
      setStats(s => ({ ...s, falseAlarms: s.falseAlarms + 1 }));
      recordResponse(false, rt);
    }

    setTimeout(() => {
      setFeedback(null);
      nextRound();
    }, 200);
  }, [responded, gameState.status, isTarget, reactionTime, reactionTimes, recordResponse, nextRound]);

  // Keyboard/touch handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState.status === 'playing') {
        e.preventDefault();
        handleResponse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResponse, gameState.status]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
    };
  }, []);

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    setStats({ hits: 0, misses: 0, falseAlarms: 0, avgRT: 0 });
    setReactionTimes([]);
    showNextLetter();
  };
  const handleRestart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
    resetGame();
    setCurrentLetter(null);
    setStats({ hits: 0, misses: 0, falseAlarms: 0, avgRT: 0 });
    setReactionTimes([]);
    showInstructions();
  };

  return (
    <GameWrapper
      gameState={gameState}
      gameConfig={gameConfig}
      onStart={handleStart}
      onPause={pauseGame}
      onResume={resumeGame}
      onRestart={handleRestart}
      onExit={() => onExit?.()}
      onCountdownComplete={handleCountdownComplete}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
    >
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        {/* Target Reminder */}
        <div className="mb-6 text-center">
          <span className="text-gray-400 text-sm">Press SPACE when you see:</span>
          <div className="text-4xl font-bold text-speed mt-1">{TARGET}</div>
        </div>

        {/* Letter Display */}
        <motion.div
          className={cn(
            'w-40 h-40 rounded-3xl flex items-center justify-center border-4 transition-colors cursor-pointer',
            feedback === 'hit' && 'bg-success-500/20 border-success-500',
            feedback === 'miss' && 'bg-error-500/20 border-error-500',
            feedback === 'false' && 'bg-warning-500/20 border-warning-500',
            !feedback && 'bg-navy-700 border-navy-600'
          )}
          onClick={handleResponse}
          whileTap={{ scale: 0.95 }}
        >
          {currentLetter && (
            <motion.span
              key={currentLetter + gameState.currentRound}
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'text-8xl font-bold',
                currentLetter === TARGET ? 'text-speed' : 'text-white'
              )}
            >
              {currentLetter}
            </motion.span>
          )}
        </motion.div>

        {/* Feedback */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-4 text-sm font-medium',
              feedback === 'hit' && 'text-success-400',
              feedback === 'miss' && 'text-error-400',
              feedback === 'false' && 'text-warning-400'
            )}
          >
            {feedback === 'hit' && 'Hit!'}
            {feedback === 'miss' && 'Missed!'}
            {feedback === 'false' && 'False alarm!'}
          </motion.div>
        )}

        {/* Stats */}
        <div className="mt-8 flex gap-6 text-sm">
          <div className="text-center">
            <div className="text-success-400 font-bold text-lg">{stats.hits}</div>
            <div className="text-gray-500">Hits</div>
          </div>
          <div className="text-center">
            <div className="text-error-400 font-bold text-lg">{stats.misses}</div>
            <div className="text-gray-500">Misses</div>
          </div>
          <div className="text-center">
            <div className="text-speed font-bold text-lg">{stats.avgRT || '-'}</div>
            <div className="text-gray-500">Avg RT</div>
          </div>
        </div>
      </div>
    </GameWrapper>
  );
}
