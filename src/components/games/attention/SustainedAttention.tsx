'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface SustainedAttentionProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { targetFrequency: 0.2, displayTime: 1500, interTrialInterval: 500 },
  2: { targetFrequency: 0.2, displayTime: 1300, interTrialInterval: 400 },
  3: { targetFrequency: 0.15, displayTime: 1200, interTrialInterval: 400 },
  4: { targetFrequency: 0.15, displayTime: 1100, interTrialInterval: 350 },
  5: { targetFrequency: 0.12, displayTime: 1000, interTrialInterval: 350 },
  6: { targetFrequency: 0.12, displayTime: 900, interTrialInterval: 300 },
  7: { targetFrequency: 0.1, displayTime: 850, interTrialInterval: 300 },
  8: { targetFrequency: 0.1, displayTime: 800, interTrialInterval: 250 },
  9: { targetFrequency: 0.08, displayTime: 750, interTrialInterval: 250 },
  10: { targetFrequency: 0.08, displayTime: 700, interTrialInterval: 200 },
};

const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const TARGET = '3'; // Respond when you see 3

const gameConfig = {
  id: 'sustained-attention',
  name: 'Sustained Attention',
  description: 'Maintain focus and respond only to target numbers.',
  instructions: 'Watch the numbers appear. Press SPACE or tap only when you see the number 3. Ignore all other numbers. Stay focused!',
  domain: 'attention',
};

export function SustainedAttention({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: SustainedAttentionProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 50;

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

  const [currentNumber, setCurrentNumber] = useState<string | null>(null);
  const [isTarget, setIsTarget] = useState(false);
  const [responded, setResponded] = useState(false);
  const [feedback, setFeedback] = useState<'hit' | 'miss' | 'false-alarm' | null>(null);
  const [stats, setStats] = useState({ hits: 0, misses: 0, falseAlarms: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const showNextNumber = useCallback(() => {
    if (gameState.currentRound > totalRounds) {
      completeGame();
      return;
    }

    const isTargetTrial = Math.random() < config.targetFrequency;
    const number = isTargetTrial ? TARGET : NUMBERS.filter(n => n !== TARGET)[Math.floor(Math.random() * (NUMBERS.length - 1))];

    setCurrentNumber(number);
    setIsTarget(isTargetTrial);
    setResponded(false);
    setFeedback(null);
    reactionTime.start();

    timerRef.current = setTimeout(() => {
      // Time's up for this trial
      if (isTargetTrial && !responded) {
        setFeedback('miss');
        setStats(s => ({ ...s, misses: s.misses + 1 }));
        recordResponse(false, config.displayTime);
      } else if (!isTargetTrial) {
        recordResponse(true, 0); // Correct rejection
      }

      setTimeout(() => {
        if (gameState.currentRound >= totalRounds) {
          completeGame();
        } else {
          nextRound();
          setCurrentNumber(null);
        }
      }, config.interTrialInterval);
    }, config.displayTime);
  }, [gameState.currentRound, totalRounds, config, responded, reactionTime, recordResponse, completeGame, nextRound]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && currentNumber === null) {
      showNextNumber();
    }
  }, [gameState.status, gameState.currentRound, currentNumber, showNextNumber]);

  const handleResponse = useCallback(() => {
    if (responded || gameState.status !== 'playing' || !currentNumber) return;

    setResponded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    const rt = reactionTime.stop();

    if (isTarget) {
      setFeedback('hit');
      setStats(s => ({ ...s, hits: s.hits + 1 }));
      recordResponse(true, rt);
    } else {
      setFeedback('false-alarm');
      setStats(s => ({ ...s, falseAlarms: s.falseAlarms + 1 }));
      recordResponse(false, rt);
    }

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setCurrentNumber(null);
      }
    }, config.interTrialInterval);
  }, [responded, gameState.status, gameState.currentRound, totalRounds, currentNumber, isTarget, reactionTime, recordResponse, completeGame, nextRound, config.interTrialInterval]);

  // Keyboard handler
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
    };
  }, []);

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    setStats({ hits: 0, misses: 0, falseAlarms: 0 });
    showNextNumber();
  };
  const handleRestart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    resetGame();
    setCurrentNumber(null);
    setStats({ hits: 0, misses: 0, falseAlarms: 0 });
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
        <div className="mb-8 text-center">
          <span className="text-gray-400 text-sm">Press SPACE or tap when you see:</span>
          <div className="text-5xl font-bold text-attention mt-2">{TARGET}</div>
        </div>

        {/* Number Display */}
        <motion.div
          className={cn(
            'w-48 h-48 rounded-3xl flex items-center justify-center border-4 transition-colors cursor-pointer',
            feedback === 'hit' && 'bg-success-500/20 border-success-500',
            feedback === 'miss' && 'bg-error-500/20 border-error-500',
            feedback === 'false-alarm' && 'bg-warning-500/20 border-warning-500',
            !feedback && 'bg-navy-700 border-navy-600'
          )}
          onClick={handleResponse}
          whileTap={{ scale: 0.95 }}
        >
          {currentNumber && (
            <motion.span
              key={currentNumber + gameState.currentRound}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'text-8xl font-bold',
                currentNumber === TARGET ? 'text-attention' : 'text-white'
              )}
            >
              {currentNumber}
            </motion.span>
          )}
        </motion.div>

        {/* Feedback */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-6 text-lg font-medium',
              feedback === 'hit' && 'text-success-400',
              feedback === 'miss' && 'text-error-400',
              feedback === 'false-alarm' && 'text-warning-400'
            )}
          >
            {feedback === 'hit' && 'Hit!'}
            {feedback === 'miss' && 'Missed target!'}
            {feedback === 'false-alarm' && 'False alarm!'}
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
            <div className="text-warning-400 font-bold text-lg">{stats.falseAlarms}</div>
            <div className="text-gray-500">False Alarms</div>
          </div>
        </div>
      </div>
    </GameWrapper>
  );
}
