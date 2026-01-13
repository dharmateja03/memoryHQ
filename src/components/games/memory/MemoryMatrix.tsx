'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface MemoryMatrixProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  1: { gridSize: 3, sequenceLength: 3, highlightDuration: 1000 },
  2: { gridSize: 3, sequenceLength: 4, highlightDuration: 1000 },
  3: { gridSize: 4, sequenceLength: 4, highlightDuration: 900 },
  4: { gridSize: 4, sequenceLength: 5, highlightDuration: 900 },
  5: { gridSize: 4, sequenceLength: 6, highlightDuration: 800 },
  6: { gridSize: 5, sequenceLength: 6, highlightDuration: 800 },
  7: { gridSize: 5, sequenceLength: 7, highlightDuration: 700 },
  8: { gridSize: 5, sequenceLength: 8, highlightDuration: 600 },
  9: { gridSize: 6, sequenceLength: 8, highlightDuration: 500 },
  10: { gridSize: 6, sequenceLength: 10, highlightDuration: 400 },
};

const gameConfig = {
  id: 'memory-matrix',
  name: 'Memory Matrix',
  description: 'Remember and reproduce sequences of highlighted squares.',
  instructions: 'Watch the squares light up in sequence, then tap them in the same order. The sequence gets longer as you progress!',
  domain: 'memory',
};

export function MemoryMatrix({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: MemoryMatrixProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 10;

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

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [lastTapCorrect, setLastTapCorrect] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize game
  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  // Generate new sequence for round
  const generateSequence = useCallback(() => {
    const length = config.sequenceLength + Math.floor((gameState.currentRound - 1) / 3);
    const totalCells = config.gridSize * config.gridSize;
    const newSequence: number[] = [];

    for (let i = 0; i < Math.min(length, totalCells); i++) {
      let cell;
      do {
        cell = Math.floor(Math.random() * totalCells);
      } while (newSequence.includes(cell));
      newSequence.push(cell);
    }

    return newSequence;
  }, [config.gridSize, config.sequenceLength, gameState.currentRound]);

  // Show sequence to player
  const showSequence = useCallback(async (seq: number[]) => {
    setIsShowingSequence(true);
    setIsPlayerTurn(false);

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setActiveCell(seq[i]);
      await new Promise(resolve => setTimeout(resolve, config.highlightDuration));
      setActiveCell(null);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setIsShowingSequence(false);
    setIsPlayerTurn(true);
  }, [config.highlightDuration]);

  // Start new round
  const startNewRound = useCallback(() => {
    const newSequence = generateSequence();
    setSequence(newSequence);
    setPlayerSequence([]);
    setLastTapCorrect(null);
    showSequence(newSequence);
  }, [generateSequence, showSequence]);

  // Handle game start
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound === 1 && sequence.length === 0) {
      startNewRound();
    }
  }, [gameState.status, gameState.currentRound, sequence.length, startNewRound]);

  // Handle cell tap
  const handleCellTap = useCallback((cellIndex: number) => {
    if (!isPlayerTurn || isShowingSequence) return;

    const expectedCell = sequence[playerSequence.length];
    const isCorrect = cellIndex === expectedCell;

    setLastTapCorrect(isCorrect);
    setActiveCell(cellIndex);

    setTimeout(() => {
      setActiveCell(null);
      setLastTapCorrect(null);
    }, 200);

    if (isCorrect) {
      const newPlayerSequence = [...playerSequence, cellIndex];
      setPlayerSequence(newPlayerSequence);

      // Check if sequence complete
      if (newPlayerSequence.length === sequence.length) {
        recordResponse(true);
        setIsPlayerTurn(false);

        setTimeout(() => {
          if (gameState.currentRound >= totalRounds) {
            completeGame();
          } else {
            nextRound();
            startNewRound();
          }
        }, 500);
      }
    } else {
      recordResponse(false);
      setIsPlayerTurn(false);

      // Show correct sequence briefly then continue
      setTimeout(() => {
        if (gameState.currentRound >= totalRounds) {
          completeGame();
        } else {
          nextRound();
          startNewRound();
        }
      }, 1000);
    }
  }, [isPlayerTurn, isShowingSequence, sequence, playerSequence, recordResponse, gameState.currentRound, totalRounds, completeGame, nextRound, startNewRound]);

  // Handle game controls
  const handleStart = () => {
    startCountdown();
  };

  const handleCountdownComplete = () => {
    startGame();
  };

  const handleRestart = () => {
    resetGame();
    setSequence([]);
    setPlayerSequence([]);
    setActiveCell(null);
    setIsShowingSequence(false);
    setIsPlayerTurn(false);
    showInstructions();
  };

  const handleExit = () => {
    onExit?.();
  };

  // Grid cells
  const renderGrid = () => {
    const cells = [];
    const totalCells = config.gridSize * config.gridSize;

    for (let i = 0; i < totalCells; i++) {
      const isActive = activeCell === i;
      const isInPlayerSequence = playerSequence.includes(i);

      cells.push(
        <motion.button
          key={i}
          onClick={() => handleCellTap(i)}
          disabled={!isPlayerTurn || isShowingSequence}
          className={cn(
            'aspect-square rounded-xl transition-all duration-200',
            'border-2 border-navy-600',
            isActive && lastTapCorrect === null && 'bg-electric-500 border-electric-400 shadow-lg shadow-electric-500/50',
            isActive && lastTapCorrect === true && 'bg-success-500 border-success-400 shadow-lg shadow-success-500/50',
            isActive && lastTapCorrect === false && 'bg-error-500 border-error-400 shadow-lg shadow-error-500/50',
            !isActive && isInPlayerSequence && 'bg-electric-500/30 border-electric-500/50',
            !isActive && !isInPlayerSequence && 'bg-navy-700 hover:bg-navy-600',
            isPlayerTurn && !isActive && 'cursor-pointer hover:border-electric-500/50',
            !isPlayerTurn && 'cursor-default'
          )}
          whileHover={isPlayerTurn && !isActive ? { scale: 1.02 } : undefined}
          whileTap={isPlayerTurn && !isActive ? { scale: 0.98 } : undefined}
        />
      );
    }

    return cells;
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
        {/* Status */}
        <AnimatePresence>
          {isShowingSequence && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 text-center"
            >
              <p className="text-lg text-electric-400 font-medium">Watch the sequence...</p>
              <p className="text-sm text-gray-500">{sequence.length} squares to remember</p>
            </motion.div>
          )}

          {isPlayerTurn && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 text-center"
            >
              <p className="text-lg text-success-400 font-medium">Your turn!</p>
              <p className="text-sm text-gray-500">
                {playerSequence.length}/{sequence.length} squares tapped
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div
          className="game-grid w-full max-w-md mx-auto"
          style={{
            gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
          }}
        >
          {renderGrid()}
        </div>

        {/* Sequence progress indicator */}
        {isPlayerTurn && (
          <div className="mt-6 flex items-center gap-2">
            {sequence.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'w-3 h-3 rounded-full',
                  index < playerSequence.length
                    ? 'bg-electric-500'
                    : 'bg-navy-600'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
