'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface TowerOfHanoiProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { diskCount: 3, optimalMoves: 7 },
  2: { diskCount: 3, optimalMoves: 7 },
  3: { diskCount: 4, optimalMoves: 15 },
  4: { diskCount: 4, optimalMoves: 15 },
  5: { diskCount: 4, optimalMoves: 15 },
  6: { diskCount: 5, optimalMoves: 31 },
  7: { diskCount: 5, optimalMoves: 31 },
  8: { diskCount: 5, optimalMoves: 31 },
  9: { diskCount: 6, optimalMoves: 63 },
  10: { diskCount: 6, optimalMoves: 63 },
};

const DISK_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6'
];

const gameConfig = {
  id: 'tower-of-hanoi',
  name: 'Tower of Hanoi',
  description: 'Move all disks to the rightmost peg.',
  instructions: 'Move all disks from the left peg to the right peg. You can only move one disk at a time, and a larger disk cannot be placed on a smaller one.',
  domain: 'problem_solving',
};

export function TowerOfHanoi({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: TowerOfHanoiProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 3;

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

  const [pegs, setPegs] = useState<number[][]>([[], [], []]);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const initializePegs = useCallback(() => {
    const disks = Array.from({ length: config.diskCount }, (_, i) => config.diskCount - i);
    setPegs([disks, [], []]);
    setSelectedPeg(null);
    setMoveCount(0);
    setIsComplete(false);
  }, [config.diskCount]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && pegs[0].length === 0 && pegs[1].length === 0 && pegs[2].length === 0) {
      initializePegs();
    }
  }, [gameState.status, gameState.currentRound, pegs, initializePegs]);

  // Check for completion
  useEffect(() => {
    if (pegs[2].length === config.diskCount && !isComplete) {
      setIsComplete(true);
      const efficiency = Math.min(1, config.optimalMoves / moveCount);
      recordResponse(efficiency >= 0.5, 0);

      setTimeout(() => {
        if (gameState.currentRound >= totalRounds) {
          completeGame();
        } else {
          nextRound();
          setPegs([[], [], []]);
        }
      }, 2000);
    }
  }, [pegs, config.diskCount, config.optimalMoves, moveCount, isComplete, recordResponse, gameState.currentRound, totalRounds, completeGame, nextRound]);

  const handlePegClick = (pegIndex: number) => {
    if (isComplete || gameState.status !== 'playing') return;

    if (selectedPeg === null) {
      // Select this peg if it has disks
      if (pegs[pegIndex].length > 0) {
        setSelectedPeg(pegIndex);
      }
    } else {
      // Try to move disk to this peg
      if (pegIndex === selectedPeg) {
        setSelectedPeg(null);
        return;
      }

      const sourcePeg = pegs[selectedPeg];
      const targetPeg = pegs[pegIndex];
      const movingDisk = sourcePeg[sourcePeg.length - 1];
      const topDisk = targetPeg[targetPeg.length - 1];

      // Check if move is valid
      if (topDisk === undefined || movingDisk < topDisk) {
        // Valid move
        const newPegs = pegs.map(p => [...p]);
        newPegs[selectedPeg] = sourcePeg.slice(0, -1);
        newPegs[pegIndex] = [...targetPeg, movingDisk];
        setPegs(newPegs);
        setMoveCount(moveCount + 1);
      }

      setSelectedPeg(null);
    }
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    initializePegs();
  };
  const handleRestart = () => {
    resetGame();
    setPegs([[], [], []]);
    showInstructions();
  };

  const getDiskWidth = (size: number) => {
    const minWidth = 30;
    const maxWidth = 120;
    const step = (maxWidth - minWidth) / config.diskCount;
    return minWidth + size * step;
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
        {/* Move Counter */}
        <div className="mb-6 flex gap-6 text-sm">
          <div className="text-center">
            <div className="text-white font-bold text-lg">{moveCount}</div>
            <div className="text-gray-500">Moves</div>
          </div>
          <div className="text-center">
            <div className="text-electric-400 font-bold text-lg">{config.optimalMoves}</div>
            <div className="text-gray-500">Optimal</div>
          </div>
        </div>

        {/* Pegs */}
        <div className="flex gap-4 mb-6">
          {pegs.map((peg, pegIndex) => {
            const isSelected = selectedPeg === pegIndex;
            const topDisk = peg[peg.length - 1];
            const canMoveTo = selectedPeg !== null &&
              selectedPeg !== pegIndex &&
              (topDisk === undefined || pegs[selectedPeg][pegs[selectedPeg].length - 1] < topDisk);

            return (
              <motion.div
                key={pegIndex}
                onClick={() => handlePegClick(pegIndex)}
                className={cn(
                  'relative w-36 h-48 cursor-pointer rounded-lg transition-all',
                  isSelected && 'ring-2 ring-electric-500',
                  canMoveTo && 'ring-2 ring-success-500/50'
                )}
                whileHover={{ scale: 1.02 }}
              >
                {/* Peg pole */}
                <div className="absolute left-1/2 bottom-4 w-2 h-36 bg-navy-500 rounded-full transform -translate-x-1/2" />

                {/* Base */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-navy-600 rounded-lg" />

                {/* Disks */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center">
                  {peg.map((disk, diskIndex) => (
                    <motion.div
                      key={disk}
                      layoutId={`disk-${disk}`}
                      className="h-6 rounded-md"
                      style={{
                        width: getDiskWidth(disk),
                        backgroundColor: DISK_COLORS[disk - 1],
                        marginBottom: diskIndex === 0 ? 0 : -2
                      }}
                      initial={false}
                      animate={{
                        y: diskIndex === peg.length - 1 && isSelected ? -10 : 0
                      }}
                    />
                  ))}
                </div>

                {/* Peg label */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                  {pegIndex === 0 ? 'Start' : pegIndex === 2 ? 'Goal' : ''}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Instructions */}
        {!isComplete && (
          <div className="text-sm text-gray-500 text-center">
            {selectedPeg === null
              ? 'Click a peg to select a disk'
              : 'Click another peg to move the disk'}
          </div>
        )}

        {/* Completion message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-success-400 mb-2">Complete!</div>
            <div className="text-sm text-gray-400">
              {moveCount} moves (optimal: {config.optimalMoves})
            </div>
            <div className={cn(
              'text-sm mt-1',
              moveCount <= config.optimalMoves * 1.5 ? 'text-success-400' : 'text-warning-400'
            )}>
              {moveCount <= config.optimalMoves
                ? 'Perfect!'
                : moveCount <= config.optimalMoves * 1.5
                  ? 'Good job!'
                  : 'Keep practicing!'}
            </div>
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
