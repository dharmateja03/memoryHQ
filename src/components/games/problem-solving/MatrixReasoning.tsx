'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface MatrixReasoningProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { gridSize: 2, patterns: 1, optionCount: 3 },
  2: { gridSize: 2, patterns: 1, optionCount: 4 },
  3: { gridSize: 2, patterns: 2, optionCount: 4 },
  4: { gridSize: 3, patterns: 1, optionCount: 4 },
  5: { gridSize: 3, patterns: 2, optionCount: 4 },
  6: { gridSize: 3, patterns: 2, optionCount: 5 },
  7: { gridSize: 3, patterns: 3, optionCount: 5 },
  8: { gridSize: 3, patterns: 3, optionCount: 6 },
  9: { gridSize: 3, patterns: 4, optionCount: 6 },
  10: { gridSize: 3, patterns: 4, optionCount: 6 },
};

const SHAPES = ['●', '■', '▲', '◆', '★', '♦'];
const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

interface Cell {
  shape: string;
  color: string;
  rotation: number;
  size: number;
}

const gameConfig = {
  id: 'matrix-reasoning',
  name: 'Matrix Reasoning',
  description: 'Find the pattern and complete the matrix.',
  instructions: 'Look at the pattern in the matrix. Find the missing piece that completes the pattern. Consider shape, color, and position patterns.',
  domain: 'problem_solving',
};

export function MatrixReasoning({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: MatrixReasoningProps) {
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

  const [matrix, setMatrix] = useState<(Cell | null)[][]>([]);
  const [options, setOptions] = useState<Cell[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateMatrix = useCallback(() => {
    const size = config.gridSize;
    const newMatrix: Cell[][] = [];

    // Simple pattern: same shape per row, color varies by column
    const rowShapes = SHAPES.slice(0, size).sort(() => Math.random() - 0.5);
    const colColors = COLORS.slice(0, size).sort(() => Math.random() - 0.5);

    for (let row = 0; row < size; row++) {
      newMatrix[row] = [];
      for (let col = 0; col < size; col++) {
        newMatrix[row][col] = {
          shape: rowShapes[row],
          color: colColors[col],
          rotation: 0,
          size: 1
        };
      }
    }

    // Store the correct answer (last cell)
    const correctCell = { ...newMatrix[size - 1][size - 1] };

    // Generate options
    const newOptions: Cell[] = [correctCell];

    // Add incorrect options
    while (newOptions.length < config.optionCount) {
      const wrongCell: Cell = {
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: 0,
        size: 1
      };

      // Make sure it's different from correct answer
      if (wrongCell.shape !== correctCell.shape || wrongCell.color !== correctCell.color) {
        newOptions.push(wrongCell);
      }
    }

    // Shuffle options
    const shuffled = newOptions.sort(() => Math.random() - 0.5);
    const correctIdx = shuffled.findIndex(
      o => o.shape === correctCell.shape && o.color === correctCell.color
    );

    // Set the last cell as missing
    const matrixWithMissing = newMatrix.map((row, ri) =>
      row.map((cell, ci) => (ri === size - 1 && ci === size - 1 ? null : cell))
    );

    setMatrix(matrixWithMissing);
    setOptions(shuffled);
    setCorrectIndex(correctIdx);
    setSelectedOption(null);
    setShowFeedback(false);
  }, [config.gridSize, config.optionCount]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && matrix.length === 0) {
      generateMatrix();
    }
  }, [gameState.status, gameState.currentRound, matrix.length, generateMatrix]);

  const handleOptionSelect = (index: number) => {
    if (showFeedback) return;

    setSelectedOption(index);
    setShowFeedback(true);

    const isCorrect = index === correctIndex;
    recordResponse(isCorrect, 0);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setMatrix([]);
      }
    }, 1500);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    generateMatrix();
  };
  const handleRestart = () => {
    resetGame();
    setMatrix([]);
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
        {/* Matrix */}
        <div
          className="grid gap-2 mb-8 p-4 bg-navy-700 rounded-xl"
          style={{ gridTemplateColumns: `repeat(${config.gridSize}, 1fr)` }}
        >
          {matrix.flat().map((cell, index) => (
            <div
              key={index}
              className={cn(
                'w-16 h-16 rounded-lg flex items-center justify-center border-2',
                cell ? 'bg-navy-800 border-navy-600' : 'bg-navy-600/50 border-dashed border-electric-500'
              )}
            >
              {cell ? (
                <span className="text-3xl" style={{ color: cell.color }}>
                  {cell.shape}
                </span>
              ) : (
                <span className="text-2xl text-electric-500/50">?</span>
              )}
            </div>
          ))}
        </div>

        {/* Options */}
        <div className="flex gap-3 flex-wrap justify-center">
          {options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = showFeedback && index === correctIndex;
            const isWrong = showFeedback && isSelected && index !== correctIndex;

            return (
              <motion.button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showFeedback}
                className={cn(
                  'w-16 h-16 rounded-lg flex items-center justify-center border-2 transition-all',
                  isCorrect && 'bg-success-500/20 border-success-500',
                  isWrong && 'bg-error-500/20 border-error-500',
                  !showFeedback && 'bg-navy-700 border-navy-600 hover:border-electric-500/50',
                  isSelected && !showFeedback && 'border-electric-500'
                )}
                whileHover={!showFeedback ? { scale: 1.05 } : undefined}
                whileTap={!showFeedback ? { scale: 0.95 } : undefined}
              >
                <span className="text-3xl" style={{ color: option.color }}>
                  {option.shape}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-6 text-lg font-medium',
              selectedOption === correctIndex ? 'text-success-400' : 'text-error-400'
            )}
          >
            {selectedOption === correctIndex ? 'Correct!' : 'Incorrect - study the pattern!'}
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
