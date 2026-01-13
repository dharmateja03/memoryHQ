'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface SymbolMatchingProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { symbolCount: 4, matchRatio: 0.5 },
  2: { symbolCount: 5, matchRatio: 0.5 },
  3: { symbolCount: 5, matchRatio: 0.5 },
  4: { symbolCount: 6, matchRatio: 0.5 },
  5: { symbolCount: 6, matchRatio: 0.5 },
  6: { symbolCount: 7, matchRatio: 0.5 },
  7: { symbolCount: 7, matchRatio: 0.4 },
  8: { symbolCount: 8, matchRatio: 0.4 },
  9: { symbolCount: 8, matchRatio: 0.4 },
  10: { symbolCount: 9, matchRatio: 0.4 },
};

const SYMBOLS = ['◆', '★', '●', '■', '▲', '♦', '♠', '♣', '♥', '✦', '○', '□', '△', '◇'];

interface Trial {
  leftSymbol: string;
  rightSymbol: string;
  isMatch: boolean;
}

const gameConfig = {
  id: 'symbol-matching',
  name: 'Symbol Matching',
  description: 'Quickly determine if two symbols match.',
  instructions: 'Two symbols will appear. Press MATCH if they are the same, NO MATCH if different. Be fast and accurate!',
  domain: 'speed',
};

export function SymbolMatching({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: SymbolMatchingProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 40;

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
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastRT, setLastRT] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const availableSymbols = SYMBOLS.slice(0, config.symbolCount);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateTrial = useCallback((): Trial => {
    const isMatch = Math.random() < config.matchRatio;
    const leftSymbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];

    let rightSymbol: string;
    if (isMatch) {
      rightSymbol = leftSymbol;
    } else {
      do {
        rightSymbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
      } while (rightSymbol === leftSymbol);
    }

    return { leftSymbol, rightSymbol, isMatch };
  }, [availableSymbols, config.matchRatio]);

  const startTrial = useCallback(() => {
    const newTrial = generateTrial();
    setTrial(newTrial);
    setSelectedAnswer(null);
    setShowFeedback(false);
    reactionTime.start();
  }, [generateTrial, reactionTime]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && !trial) {
      startTrial();
    }
  }, [gameState.status, gameState.currentRound, trial, startTrial]);

  const handleResponse = (isMatch: boolean) => {
    if (showFeedback || !trial) return;

    const rt = reactionTime.stop();
    const isCorrect = isMatch === trial.isMatch;

    setSelectedAnswer(isMatch);
    setLastRT(rt);
    setShowFeedback(true);
    recordResponse(isCorrect, rt);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setTrial(null);
      }
    }, 600);
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing' || showFeedback) return;

      if (e.key === 'm' || e.key === 'M' || e.key === 'ArrowUp') {
        handleResponse(true);
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowDown') {
        handleResponse(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, showFeedback, trial]);

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
        {/* Reaction Time Display */}
        {showFeedback && lastRT && (
          <div className="mb-4">
            <span className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold',
              selectedAnswer === trial?.isMatch ? 'bg-success-500/20 text-success-400' : 'bg-error-500/20 text-error-400'
            )}>
              {lastRT}ms - {selectedAnswer === trial?.isMatch ? 'Correct!' : 'Wrong!'}
            </span>
          </div>
        )}

        {/* Symbol Display */}
        <div className="flex items-center gap-8 mb-8">
          {trial && (
            <>
              <motion.div
                key={`left-${gameState.currentRound}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'w-28 h-28 bg-navy-700 rounded-2xl flex items-center justify-center border-2',
                  showFeedback && trial.isMatch && 'border-success-500',
                  showFeedback && !trial.isMatch && 'border-navy-600',
                  !showFeedback && 'border-navy-600'
                )}
              >
                <span className="text-6xl text-speed">{trial.leftSymbol}</span>
              </motion.div>

              <div className="text-2xl text-gray-600">=?</div>

              <motion.div
                key={`right-${gameState.currentRound}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'w-28 h-28 bg-navy-700 rounded-2xl flex items-center justify-center border-2',
                  showFeedback && trial.isMatch && 'border-success-500',
                  showFeedback && !trial.isMatch && 'border-navy-600',
                  !showFeedback && 'border-navy-600'
                )}
              >
                <span className="text-6xl text-speed">{trial.rightSymbol}</span>
              </motion.div>
            </>
          )}
        </div>

        {/* Response Buttons */}
        <div className="flex gap-4">
          <motion.button
            onClick={() => handleResponse(true)}
            disabled={showFeedback}
            className={cn(
              'px-8 py-4 rounded-xl font-bold transition-all border-2',
              showFeedback && selectedAnswer === true && trial?.isMatch && 'bg-success-500/20 border-success-500 text-success-400',
              showFeedback && selectedAnswer === true && !trial?.isMatch && 'bg-error-500/20 border-error-500 text-error-400',
              showFeedback && selectedAnswer !== true && trial?.isMatch && 'bg-success-500/20 border-success-500 text-success-400 opacity-50',
              !showFeedback && 'bg-navy-700 border-navy-600 text-white hover:border-success-500/50'
            )}
            whileHover={!showFeedback ? { scale: 1.05 } : undefined}
            whileTap={!showFeedback ? { scale: 0.95 } : undefined}
          >
            Match (M)
          </motion.button>

          <motion.button
            onClick={() => handleResponse(false)}
            disabled={showFeedback}
            className={cn(
              'px-8 py-4 rounded-xl font-bold transition-all border-2',
              showFeedback && selectedAnswer === false && !trial?.isMatch && 'bg-success-500/20 border-success-500 text-success-400',
              showFeedback && selectedAnswer === false && trial?.isMatch && 'bg-error-500/20 border-error-500 text-error-400',
              showFeedback && selectedAnswer !== false && !trial?.isMatch && 'bg-success-500/20 border-success-500 text-success-400 opacity-50',
              !showFeedback && 'bg-navy-700 border-navy-600 text-white hover:border-error-500/50'
            )}
            whileHover={!showFeedback ? { scale: 1.05 } : undefined}
            whileTap={!showFeedback ? { scale: 0.95 } : undefined}
          >
            No Match (N)
          </motion.button>
        </div>

        {/* Keyboard hint */}
        <div className="mt-6 text-xs text-gray-600">
          Press M for Match, N for No Match
        </div>
      </div>
    </GameWrapper>
  );
}
