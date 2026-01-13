'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface VisualSearchProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { gridSize: 4, distractorTypes: 1, targetPresent: 0.7 },
  2: { gridSize: 5, distractorTypes: 1, targetPresent: 0.7 },
  3: { gridSize: 5, distractorTypes: 2, targetPresent: 0.6 },
  4: { gridSize: 6, distractorTypes: 2, targetPresent: 0.6 },
  5: { gridSize: 6, distractorTypes: 3, targetPresent: 0.6 },
  6: { gridSize: 7, distractorTypes: 3, targetPresent: 0.5 },
  7: { gridSize: 7, distractorTypes: 4, targetPresent: 0.5 },
  8: { gridSize: 8, distractorTypes: 4, targetPresent: 0.5 },
  9: { gridSize: 8, distractorTypes: 5, targetPresent: 0.5 },
  10: { gridSize: 9, distractorTypes: 5, targetPresent: 0.5 },
};

const TARGET = { shape: 'T', color: '#3B82F6' };
const DISTRACTORS = [
  { shape: 'L', color: '#3B82F6' },
  { shape: 'T', color: '#EF4444' },
  { shape: 'L', color: '#EF4444' },
  { shape: '+', color: '#3B82F6' },
  { shape: '+', color: '#EF4444' },
];

interface GridItem {
  shape: string;
  color: string;
  rotation: number;
  isTarget: boolean;
}

const gameConfig = {
  id: 'visual-search',
  name: 'Visual Search',
  description: 'Find the target among distractors as quickly as possible.',
  instructions: 'Find the BLUE T among the other shapes. Tap it when you find it, or press "Not Present" if there is no blue T.',
  domain: 'attention',
};

export function VisualSearch({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: VisualSearchProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 20;

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

  const [grid, setGrid] = useState<GridItem[]>([]);
  const [targetPresent, setTargetPresent] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateGrid = useCallback(() => {
    const totalCells = config.gridSize * config.gridSize;
    const hasTarget = Math.random() < config.targetPresent;
    const items: GridItem[] = [];

    const availableDistractors = DISTRACTORS.slice(0, config.distractorTypes);

    for (let i = 0; i < totalCells; i++) {
      const distractor = availableDistractors[Math.floor(Math.random() * availableDistractors.length)];
      items.push({
        shape: distractor.shape,
        color: distractor.color,
        rotation: Math.floor(Math.random() * 4) * 90,
        isTarget: false
      });
    }

    if (hasTarget) {
      const targetIndex = Math.floor(Math.random() * totalCells);
      items[targetIndex] = {
        shape: TARGET.shape,
        color: TARGET.color,
        rotation: 0,
        isTarget: true
      };
    }

    setGrid(items);
    setTargetPresent(hasTarget);
    setShowFeedback(false);
    reactionTime.start();
  }, [config.gridSize, config.targetPresent, config.distractorTypes, reactionTime]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && grid.length === 0) {
      generateGrid();
    }
  }, [gameState.status, gameState.currentRound, grid.length, generateGrid]);

  const handleResponse = (clickedTarget: boolean) => {
    if (showFeedback) return;

    const rt = reactionTime.stop();
    const isCorrect = clickedTarget === targetPresent;

    setWasCorrect(isCorrect);
    setShowFeedback(true);
    recordResponse(isCorrect, rt);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setGrid([]);
      }
    }, 800);
  };

  const handleCellClick = (item: GridItem) => {
    if (showFeedback) return;
    if (item.isTarget) {
      handleResponse(true);
    }
  };

  const handleNotPresent = () => {
    handleResponse(false);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    generateGrid();
  };
  const handleRestart = () => {
    resetGame();
    setGrid([]);
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
        {/* Target Reference */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-gray-400 text-sm">Find:</span>
          <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center border-2 border-attention">
            <span className="text-2xl font-bold" style={{ color: TARGET.color }}>T</span>
          </div>
          <span className="text-gray-500 text-sm">(Blue T)</span>
        </div>

        {/* Grid */}
        <div
          className="grid gap-1 mb-6"
          style={{
            gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
            width: `${Math.min(config.gridSize * 45, 400)}px`
          }}
        >
          {grid.map((item, index) => (
            <motion.button
              key={index}
              onClick={() => handleCellClick(item)}
              disabled={showFeedback}
              className={cn(
                'aspect-square rounded-md flex items-center justify-center transition-all',
                'bg-navy-700 hover:bg-navy-600',
                showFeedback && item.isTarget && 'ring-2 ring-success-500 bg-success-500/20'
              )}
              whileHover={!showFeedback ? { scale: 1.1 } : undefined}
              whileTap={!showFeedback ? { scale: 0.95 } : undefined}
            >
              <span
                className="text-xl font-bold"
                style={{
                  color: item.color,
                  transform: `rotate(${item.rotation}deg)`
                }}
              >
                {item.shape}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Not Present Button */}
        <motion.button
          onClick={handleNotPresent}
          disabled={showFeedback}
          className={cn(
            'px-8 py-3 rounded-xl font-bold transition-all',
            showFeedback
              ? 'bg-navy-700 text-gray-600 cursor-not-allowed'
              : 'bg-error-500/20 text-error-400 border-2 border-error-500 hover:bg-error-500/30'
          )}
          whileHover={!showFeedback ? { scale: 1.05 } : undefined}
          whileTap={!showFeedback ? { scale: 0.95 } : undefined}
        >
          Not Present
        </motion.button>

        {/* Feedback */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-6 text-lg font-medium',
              wasCorrect ? 'text-success-400' : 'text-error-400'
            )}
          >
            {wasCorrect ? 'Correct!' : targetPresent ? 'Target was present!' : 'Correct - no target!'}
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
