'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface SimpleReactionProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  1: { minWait: 1000, maxWait: 3000, targetSize: 120, targetDuration: 5000 },
  2: { minWait: 1000, maxWait: 3000, targetSize: 100, targetDuration: 4000 },
  3: { minWait: 800, maxWait: 3500, targetSize: 100, targetDuration: 3500 },
  4: { minWait: 800, maxWait: 4000, targetSize: 80, targetDuration: 3000 },
  5: { minWait: 500, maxWait: 4000, targetSize: 80, targetDuration: 2500 },
  6: { minWait: 500, maxWait: 4500, targetSize: 60, targetDuration: 2000 },
  7: { minWait: 500, maxWait: 5000, targetSize: 60, targetDuration: 1500 },
  8: { minWait: 300, maxWait: 5000, targetSize: 50, targetDuration: 1200 },
  9: { minWait: 300, maxWait: 5000, targetSize: 40, targetDuration: 1000 },
  10: { minWait: 200, maxWait: 5000, targetSize: 30, targetDuration: 800 },
};

const gameConfig = {
  id: 'simple-reaction',
  name: 'Simple Reaction',
  description: 'Test your raw reaction speed.',
  instructions: 'Wait for the green circle to appear, then tap it as fast as possible. Be careful not to tap too early!',
  domain: 'speed',
};

type TrialState = 'waiting' | 'ready' | 'target' | 'early' | 'success' | 'miss';

export function SimpleReaction({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: SimpleReactionProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 15;

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [trialState, setTrialState] = useState<TrialState>('waiting');
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize game
  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Start new trial
  const startTrial = useCallback(() => {
    setTrialState('ready');
    setLastReactionTime(null);

    // Random delay before showing target
    const delay = config.minWait + Math.random() * (config.maxWait - config.minWait);

    timeoutRef.current = setTimeout(() => {
      setTrialState('target');
      reactionTime.start();

      // Auto-miss if no response
      timeoutRef.current = setTimeout(() => {
        if (trialState === 'target') {
          setTrialState('miss');
          recordResponse(false);
          setTimeout(() => {
            if (gameState.currentRound >= totalRounds) {
              completeGame();
            } else {
              nextRound();
              startTrial();
            }
          }, 1000);
        }
      }, config.targetDuration);
    }, delay);
  }, [config.minWait, config.maxWait, config.targetDuration, reactionTime, trialState, recordResponse, gameState.currentRound, totalRounds, completeGame, nextRound]);

  // Start trial when game begins
  useEffect(() => {
    if (gameState.status === 'playing' && trialState === 'waiting') {
      startTrial();
    }
  }, [gameState.status, trialState, startTrial]);

  // Handle tap
  const handleTap = useCallback(() => {
    if (gameState.status !== 'playing') return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (trialState === 'ready') {
      // Tapped too early
      setTrialState('early');
      recordResponse(false);

      setTimeout(() => {
        if (gameState.currentRound >= totalRounds) {
          completeGame();
        } else {
          nextRound();
          startTrial();
        }
      }, 1500);
    } else if (trialState === 'target') {
      // Success!
      const rt = reactionTime.stop();
      setLastReactionTime(rt);
      setTrialState('success');
      recordResponse(true, rt);

      setTimeout(() => {
        if (gameState.currentRound >= totalRounds) {
          completeGame();
        } else {
          nextRound();
          startTrial();
        }
      }, 1000);
    }
  }, [gameState.status, gameState.currentRound, totalRounds, trialState, reactionTime, recordResponse, completeGame, nextRound, startTrial]);

  // Handle game controls
  const handleStart = () => {
    startCountdown();
  };

  const handleCountdownComplete = () => {
    startGame();
    setTrialState('waiting');
  };

  const handleRestart = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    resetGame();
    setTrialState('waiting');
    setLastReactionTime(null);
    showInstructions();
  };

  const handleExit = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onExit?.();
  };

  const getStateMessage = () => {
    switch (trialState) {
      case 'waiting':
        return 'Get ready...';
      case 'ready':
        return 'Wait for green...';
      case 'target':
        return 'TAP NOW!';
      case 'early':
        return 'Too early! Wait for green.';
      case 'success':
        return `${lastReactionTime}ms - Great!`;
      case 'miss':
        return 'Too slow! Try faster.';
      default:
        return '';
    }
  };

  const getStateColor = () => {
    switch (trialState) {
      case 'ready':
        return 'text-warning-400';
      case 'target':
        return 'text-success-400';
      case 'early':
      case 'miss':
        return 'text-error-400';
      case 'success':
        return 'text-electric-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <GameWrapper
      gameState={gameState}
      gameConfig={gameConfig}
      onStart={handleStart}
      onPause={pauseGame}
      onResume={resumeGame}
      onRestart={handleRestart}
      onExit={handleExit}
      onCountdownComplete={handleCountdownComplete}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
    >
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        {/* Message */}
        <motion.p
          key={trialState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn('text-xl font-medium mb-8', getStateColor())}
        >
          {getStateMessage()}
        </motion.p>

        {/* Target Area */}
        <motion.div
          onClick={handleTap}
          className={cn(
            'relative cursor-pointer rounded-full transition-colors duration-100',
            'flex items-center justify-center',
            trialState === 'waiting' && 'bg-navy-700',
            trialState === 'ready' && 'bg-warning-500/20 border-2 border-warning-500/50',
            trialState === 'target' && 'bg-success-500 shadow-lg shadow-success-500/50',
            trialState === 'early' && 'bg-error-500/20 border-2 border-error-500/50',
            trialState === 'success' && 'bg-electric-500 shadow-lg shadow-electric-500/50',
            trialState === 'miss' && 'bg-error-500/20 border-2 border-error-500/50',
          )}
          style={{
            width: config.targetSize * 2,
            height: config.targetSize * 2,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence>
            {trialState === 'target' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 rounded-full bg-success-500"
                style={{ width: config.targetSize * 2, height: config.targetSize * 2 }}
              />
            )}
          </AnimatePresence>

          {/* Inner circle for visual feedback */}
          <div
            className={cn(
              'rounded-full transition-colors',
              trialState === 'waiting' && 'bg-navy-600',
              trialState === 'ready' && 'bg-warning-500/30',
              trialState === 'target' && 'bg-success-400',
              trialState === 'success' && 'bg-electric-400',
            )}
            style={{
              width: config.targetSize,
              height: config.targetSize,
            }}
          />
        </motion.div>

        {/* Stats */}
        <div className="mt-12 flex items-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {lastReactionTime ? `${lastReactionTime}ms` : '-'}
            </div>
            <div className="text-xs text-gray-500">Last Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {gameState.reactionTimes.length > 0
                ? `${Math.round(gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length)}ms`
                : '-'}
            </div>
            <div className="text-xs text-gray-500">Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {gameState.reactionTimes.length > 0
                ? `${Math.min(...gameState.reactionTimes)}ms`
                : '-'}
            </div>
            <div className="text-xs text-gray-500">Best</div>
          </div>
        </div>
      </div>
    </GameWrapper>
  );
}
