'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface FlankerTaskProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { flankerCount: 2, congruentRatio: 0.7, displayTime: 3000 },
  2: { flankerCount: 2, congruentRatio: 0.6, displayTime: 2800 },
  3: { flankerCount: 2, congruentRatio: 0.5, displayTime: 2500 },
  4: { flankerCount: 3, congruentRatio: 0.5, displayTime: 2500 },
  5: { flankerCount: 3, congruentRatio: 0.5, displayTime: 2200 },
  6: { flankerCount: 3, congruentRatio: 0.4, displayTime: 2000 },
  7: { flankerCount: 4, congruentRatio: 0.4, displayTime: 1800 },
  8: { flankerCount: 4, congruentRatio: 0.3, displayTime: 1600 },
  9: { flankerCount: 4, congruentRatio: 0.3, displayTime: 1400 },
  10: { flankerCount: 5, congruentRatio: 0.3, displayTime: 1200 },
};

type Direction = 'left' | 'right';

interface Trial {
  target: Direction;
  flankers: Direction;
  isCongruent: boolean;
}

const gameConfig = {
  id: 'flanker-task',
  name: 'Flanker Task',
  description: 'Focus on the center arrow and ignore the flanking arrows.',
  instructions: 'Identify the direction of the CENTER arrow. The surrounding arrows may point the same way (congruent) or opposite (incongruent). Focus on the middle!',
  domain: 'attention',
};

export function FlankerTask({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: FlankerTaskProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 30;

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

  const [trial, setTrial] = useState<Trial | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateTrial = useCallback((): Trial => {
    const target: Direction = Math.random() < 0.5 ? 'left' : 'right';
    const isCongruent = Math.random() < config.congruentRatio;
    const flankers: Direction = isCongruent ? target : (target === 'left' ? 'right' : 'left');

    return { target, flankers, isCongruent };
  }, [config.congruentRatio]);

  const startTrial = useCallback(() => {
    const newTrial = generateTrial();
    setTrial(newTrial);
    setSelectedDirection(null);
    setShowFeedback(false);
    reactionTime.start();
  }, [generateTrial, reactionTime]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && !trial) {
      startTrial();
    }
  }, [gameState.status, gameState.currentRound, trial, startTrial]);

  const handleResponse = (direction: Direction) => {
    if (showFeedback || !trial) return;

    const rt = reactionTime.stop();
    const isCorrect = direction === trial.target;

    setSelectedDirection(direction);
    setShowFeedback(true);
    recordResponse(isCorrect, rt);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setTrial(null);
      }
    }, 800);
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing' || showFeedback) return;

      if (e.key === 'ArrowLeft') {
        handleResponse('left');
      } else if (e.key === 'ArrowRight') {
        handleResponse('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.status, showFeedback]);

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    startTrial();
  };
  const handleRestart = () => {
    resetGame();
    setTrial(null);
    showInstructions();
  };

  const Arrow = ({ direction, isTarget, size = 'md' }: { direction: Direction; isTarget?: boolean; size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-5xl' };
    return (
      <span className={cn(
        sizes[size],
        'font-bold transition-colors',
        isTarget ? 'text-attention' : 'text-gray-500'
      )}>
        {direction === 'left' ? '←' : '→'}
      </span>
    );
  };

  const renderStimulus = () => {
    if (!trial) return null;

    const arrows = [];

    // Left flankers
    for (let i = 0; i < config.flankerCount; i++) {
      arrows.push(
        <Arrow key={`l${i}`} direction={trial.flankers} size="md" />
      );
    }

    // Target (center)
    arrows.push(
      <Arrow key="target" direction={trial.target} isTarget size="lg" />
    );

    // Right flankers
    for (let i = 0; i < config.flankerCount; i++) {
      arrows.push(
        <Arrow key={`r${i}`} direction={trial.flankers} size="md" />
      );
    }

    return arrows;
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
        {/* Instructions */}
        <div className="mb-8 text-center">
          <span className="text-gray-400 text-sm">
            Which way is the <span className="text-attention font-bold">CENTER</span> arrow pointing?
          </span>
        </div>

        {/* Stimulus Display */}
        <div className={cn(
          'flex items-center gap-1 p-6 bg-navy-700 rounded-2xl border-2 mb-8',
          showFeedback && selectedDirection === trial?.target && 'border-success-500 bg-success-500/10',
          showFeedback && selectedDirection !== trial?.target && 'border-error-500 bg-error-500/10',
          !showFeedback && 'border-navy-600'
        )}>
          {renderStimulus()}
        </div>

        {/* Trial Type Indicator */}
        {trial && (
          <div className="mb-6 text-xs text-gray-600">
            {trial.isCongruent ? 'Congruent' : 'Incongruent'} trial
          </div>
        )}

        {/* Response Buttons */}
        <div className="flex gap-4">
          <motion.button
            onClick={() => handleResponse('left')}
            disabled={showFeedback}
            className={cn(
              'w-24 h-20 rounded-xl flex items-center justify-center text-4xl font-bold transition-all border-2',
              showFeedback && selectedDirection === 'left' && trial?.target === 'left' && 'bg-success-500/20 border-success-500 text-success-400',
              showFeedback && selectedDirection === 'left' && trial?.target !== 'left' && 'bg-error-500/20 border-error-500 text-error-400',
              showFeedback && selectedDirection !== 'left' && trial?.target === 'left' && 'bg-success-500/20 border-success-500 text-success-400',
              !showFeedback && 'bg-navy-700 border-navy-600 text-white hover:border-electric-500/50'
            )}
            whileHover={!showFeedback ? { scale: 1.05 } : undefined}
            whileTap={!showFeedback ? { scale: 0.95 } : undefined}
          >
            ←
          </motion.button>

          <motion.button
            onClick={() => handleResponse('right')}
            disabled={showFeedback}
            className={cn(
              'w-24 h-20 rounded-xl flex items-center justify-center text-4xl font-bold transition-all border-2',
              showFeedback && selectedDirection === 'right' && trial?.target === 'right' && 'bg-success-500/20 border-success-500 text-success-400',
              showFeedback && selectedDirection === 'right' && trial?.target !== 'right' && 'bg-error-500/20 border-error-500 text-error-400',
              showFeedback && selectedDirection !== 'right' && trial?.target === 'right' && 'bg-success-500/20 border-success-500 text-success-400',
              !showFeedback && 'bg-navy-700 border-navy-600 text-white hover:border-electric-500/50'
            )}
            whileHover={!showFeedback ? { scale: 1.05 } : undefined}
            whileTap={!showFeedback ? { scale: 0.95 } : undefined}
          >
            →
          </motion.button>
        </div>

        {/* Keyboard hint */}
        <div className="mt-6 text-xs text-gray-600">
          Use ← → arrow keys or click buttons
        </div>
      </div>
    </GameWrapper>
  );
}
