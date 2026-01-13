'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface SpatialReasoningProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { gridSize: 3, shapeComplexity: 1, rotations: [0, 90] },
  2: { gridSize: 3, shapeComplexity: 1, rotations: [0, 90, 180] },
  3: { gridSize: 3, shapeComplexity: 2, rotations: [0, 90, 180, 270] },
  4: { gridSize: 4, shapeComplexity: 2, rotations: [0, 90, 180, 270] },
  5: { gridSize: 4, shapeComplexity: 2, rotations: [0, 90, 180, 270] },
  6: { gridSize: 4, shapeComplexity: 3, rotations: [0, 90, 180, 270] },
  7: { gridSize: 5, shapeComplexity: 3, rotations: [0, 90, 180, 270] },
  8: { gridSize: 5, shapeComplexity: 3, rotations: [0, 90, 180, 270] },
  9: { gridSize: 5, shapeComplexity: 4, rotations: [0, 90, 180, 270] },
  10: { gridSize: 6, shapeComplexity: 4, rotations: [0, 90, 180, 270] },
};

interface Shape {
  cells: boolean[][];
  rotation: number;
}

const gameConfig = {
  id: 'spatial-reasoning',
  name: 'Spatial Reasoning',
  description: 'Identify rotated versions of shapes.',
  instructions: 'Look at the reference shape on the left. Find which option shows the same shape rotated. Shapes may be rotated but never flipped!',
  domain: 'problem_solving',
};

export function SpatialReasoning({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: SpatialReasoningProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 12;

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

  const [referenceShape, setReferenceShape] = useState<boolean[][]>([]);
  const [options, setOptions] = useState<Shape[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateShape = useCallback((size: number, complexity: number): boolean[][] => {
    const grid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
    const cellCount = Math.min(complexity + 3, size * size - 2);

    // Start from center
    let x = Math.floor(size / 2);
    let y = Math.floor(size / 2);
    grid[y][x] = true;
    let count = 1;

    while (count < cellCount) {
      const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
      ].filter(d => {
        const nx = x + d.dx;
        const ny = y + d.dy;
        return nx >= 0 && nx < size && ny >= 0 && ny < size;
      });

      const dir = directions[Math.floor(Math.random() * directions.length)];
      x += dir.dx;
      y += dir.dy;

      if (!grid[y][x]) {
        grid[y][x] = true;
        count++;
      }
    }

    return grid;
  }, []);

  const rotateShape = useCallback((shape: boolean[][], degrees: number): boolean[][] => {
    const size = shape.length;
    const rotations = (degrees / 90) % 4;
    let result = shape.map(row => [...row]);

    for (let r = 0; r < rotations; r++) {
      const newResult: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          newResult[x][size - 1 - y] = result[y][x];
        }
      }
      result = newResult;
    }

    return result;
  }, []);

  const flipShape = useCallback((shape: boolean[][]): boolean[][] => {
    return shape.map(row => [...row].reverse());
  }, []);

  const shapesEqual = useCallback((a: boolean[][], b: boolean[][]): boolean => {
    if (a.length !== b.length) return false;
    for (let y = 0; y < a.length; y++) {
      for (let x = 0; x < a[y].length; x++) {
        if (a[y][x] !== b[y][x]) return false;
      }
    }
    return true;
  }, []);

  const generatePuzzle = useCallback(() => {
    const baseShape = generateShape(config.gridSize, config.shapeComplexity);
    setReferenceShape(baseShape);

    // Generate correct answer (rotated version)
    const correctRotation = config.rotations[Math.floor(Math.random() * config.rotations.length)];
    const correctShape = rotateShape(baseShape, correctRotation);

    // Generate wrong options
    const allOptions: Shape[] = [{ cells: correctShape, rotation: correctRotation }];

    // Add flipped versions as wrong answers
    const flipped = flipShape(baseShape);
    for (const rot of config.rotations) {
      if (allOptions.length >= 4) break;
      const rotatedFlipped = rotateShape(flipped, rot);
      if (!allOptions.some(o => shapesEqual(o.cells, rotatedFlipped))) {
        allOptions.push({ cells: rotatedFlipped, rotation: rot });
      }
    }

    // Add random shapes if needed
    while (allOptions.length < 4) {
      const randomShape = generateShape(config.gridSize, config.shapeComplexity);
      const rotatedRandom = rotateShape(randomShape, config.rotations[Math.floor(Math.random() * config.rotations.length)]);
      if (!allOptions.some(o => shapesEqual(o.cells, rotatedRandom))) {
        allOptions.push({ cells: rotatedRandom, rotation: 0 });
      }
    }

    const shuffled = allOptions.sort(() => Math.random() - 0.5);
    const correctIdx = shuffled.findIndex(o => shapesEqual(o.cells, correctShape));

    setOptions(shuffled);
    setCorrectIndex(correctIdx);
    setSelectedOption(null);
    setShowFeedback(false);
  }, [config.gridSize, config.shapeComplexity, config.rotations, generateShape, rotateShape, flipShape, shapesEqual]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && referenceShape.length === 0) {
      generatePuzzle();
    }
  }, [gameState.status, gameState.currentRound, referenceShape.length, generatePuzzle]);

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
        setReferenceShape([]);
      }
    }, 1500);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    generatePuzzle();
  };
  const handleRestart = () => {
    resetGame();
    setReferenceShape([]);
    showInstructions();
  };

  const renderGrid = (shape: boolean[][], size: number = 8) => (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${shape.length}, 1fr)` }}
    >
      {shape.flat().map((filled, i) => (
        <div
          key={i}
          className={cn(
            'rounded-sm',
            filled ? 'bg-problem' : 'bg-navy-700'
          )}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );

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
        {/* Reference Shape */}
        {referenceShape.length > 0 && (
          <>
            <div className="mb-6 text-center">
              <span className="text-sm text-gray-400 mb-2 block">Reference Shape</span>
              <div className="bg-navy-700 p-4 rounded-xl border-2 border-problem inline-block">
                {renderGrid(referenceShape, 12)}
              </div>
            </div>

            <div className="text-sm text-gray-400 mb-4">Which is the same shape rotated?</div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
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
                      'p-4 rounded-xl border-2 transition-all',
                      isCorrect && 'bg-success-500/20 border-success-500',
                      isWrong && 'bg-error-500/20 border-error-500',
                      !showFeedback && 'bg-navy-700 border-navy-600 hover:border-electric-500/50',
                      isSelected && !showFeedback && 'border-electric-500'
                    )}
                    whileHover={!showFeedback ? { scale: 1.05 } : undefined}
                    whileTap={!showFeedback ? { scale: 0.95 } : undefined}
                  >
                    {renderGrid(option.cells, 10)}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

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
            {selectedOption === correctIndex ? 'Correct!' : 'Incorrect - look for rotation, not flip!'}
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
