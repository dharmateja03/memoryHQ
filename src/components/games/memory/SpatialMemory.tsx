'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface SpatialMemoryProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { gridSize: 3, itemCount: 3, displayTime: 2000 },
  2: { gridSize: 3, itemCount: 4, displayTime: 2000 },
  3: { gridSize: 4, itemCount: 4, displayTime: 1800 },
  4: { gridSize: 4, itemCount: 5, displayTime: 1800 },
  5: { gridSize: 4, itemCount: 6, displayTime: 1500 },
  6: { gridSize: 5, itemCount: 6, displayTime: 1500 },
  7: { gridSize: 5, itemCount: 7, displayTime: 1200 },
  8: { gridSize: 5, itemCount: 8, displayTime: 1200 },
  9: { gridSize: 6, itemCount: 9, displayTime: 1000 },
  10: { gridSize: 6, itemCount: 10, displayTime: 800 },
};

const SYMBOLS = ['★', '●', '▲', '■', '◆', '♦', '♠', '♣', '♥', '⬟'];

const gameConfig = {
  id: 'spatial-memory',
  name: 'Spatial Memory',
  description: 'Remember the positions of symbols on a grid.',
  instructions: 'Memorize where each symbol appears on the grid. Then place them back in their correct positions!',
  domain: 'memory',
};

export function SpatialMemory({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: SpatialMemoryProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 8;

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

  const [targetPositions, setTargetPositions] = useState<Map<number, string>>(new Map());
  const [phase, setPhase] = useState<'study' | 'place' | 'feedback'>('study');
  const [placedSymbols, setPlacedSymbols] = useState<Map<number, string>>(new Map());
  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null);
  const [remainingSymbols, setRemainingSymbols] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateRound = useCallback(() => {
    const gridTotal = config.gridSize * config.gridSize;
    const positions = new Map<number, string>();
    const usedPositions = new Set<number>();
    const symbols = SYMBOLS.slice(0, config.itemCount);

    symbols.forEach(symbol => {
      let pos: number;
      do {
        pos = Math.floor(Math.random() * gridTotal);
      } while (usedPositions.has(pos));
      usedPositions.add(pos);
      positions.set(pos, symbol);
    });

    setTargetPositions(positions);
    setPlacedSymbols(new Map());
    setRemainingSymbols([...symbols]);
    setCurrentSymbol(symbols[0]);
    setPhase('study');

    setTimeout(() => {
      setPhase('place');
    }, config.displayTime);
  }, [config.gridSize, config.itemCount, config.displayTime]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && targetPositions.size === 0) {
      generateRound();
    }
  }, [gameState.status, gameState.currentRound, targetPositions.size, generateRound]);

  const handleCellClick = (index: number) => {
    if (phase !== 'place' || !currentSymbol) return;

    // If cell already has a symbol, remove it
    if (placedSymbols.has(index)) {
      const removedSymbol = placedSymbols.get(index)!;
      const newPlaced = new Map(placedSymbols);
      newPlaced.delete(index);
      setPlacedSymbols(newPlaced);
      setRemainingSymbols([...remainingSymbols, removedSymbol]);
      if (!currentSymbol) setCurrentSymbol(removedSymbol);
      return;
    }

    // Place current symbol
    const newPlaced = new Map(placedSymbols);
    newPlaced.set(index, currentSymbol);
    setPlacedSymbols(newPlaced);

    const newRemaining = remainingSymbols.filter(s => s !== currentSymbol);
    setRemainingSymbols(newRemaining);
    setCurrentSymbol(newRemaining[0] || null);
  };

  const handleSubmit = () => {
    if (phase !== 'place') return;
    setPhase('feedback');

    let correct = 0;
    targetPositions.forEach((symbol, pos) => {
      if (placedSymbols.get(pos) === symbol) correct++;
    });

    const accuracy = correct / targetPositions.size;
    recordResponse(accuracy >= 0.8, 0);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setTargetPositions(new Map());
      }
    }, 2000);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    generateRound();
  };
  const handleRestart = () => {
    resetGame();
    setTargetPositions(new Map());
    setPlacedSymbols(new Map());
    setPhase('study');
    showInstructions();
  };

  const getCellContent = (index: number) => {
    if (phase === 'study') {
      return targetPositions.get(index) || null;
    }
    if (phase === 'place') {
      return placedSymbols.get(index) || null;
    }
    // Feedback phase
    const placed = placedSymbols.get(index);
    const target = targetPositions.get(index);
    return { placed, target };
  };

  const getCellStatus = (index: number) => {
    if (phase !== 'feedback') return null;
    const placed = placedSymbols.get(index);
    const target = targetPositions.get(index);

    if (target && placed === target) return 'correct';
    if (target && placed !== target) return 'missed';
    if (placed && !target) return 'incorrect';
    return null;
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
        {/* Phase Indicator */}
        <div className="mb-6">
          <span className={cn(
            'px-4 py-2 rounded-xl text-sm font-bold',
            phase === 'study' && 'bg-memory/20 text-memory',
            phase === 'place' && 'bg-electric-500/20 text-electric-400',
            phase === 'feedback' && 'bg-success-500/20 text-success-400'
          )}>
            {phase === 'study' && 'Memorize positions'}
            {phase === 'place' && 'Place the symbols'}
            {phase === 'feedback' && 'Results'}
          </span>
        </div>

        {/* Grid */}
        <div
          className="grid gap-2 mb-6"
          style={{
            gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
            width: `${config.gridSize * 60}px`
          }}
        >
          {Array.from({ length: config.gridSize * config.gridSize }).map((_, index) => {
            const content = getCellContent(index);
            const status = getCellStatus(index);

            return (
              <motion.button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={phase !== 'place'}
                className={cn(
                  'w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold transition-all border-2',
                  phase === 'study' && 'bg-navy-700 border-navy-600',
                  phase === 'place' && 'bg-navy-700 border-navy-600 hover:border-electric-500/50 cursor-pointer',
                  status === 'correct' && 'bg-success-500/20 border-success-500',
                  status === 'missed' && 'bg-warning-500/20 border-warning-500',
                  status === 'incorrect' && 'bg-error-500/20 border-error-500'
                )}
                whileHover={phase === 'place' ? { scale: 1.05 } : undefined}
                whileTap={phase === 'place' ? { scale: 0.95 } : undefined}
              >
                {phase === 'study' && content && (
                  <span className="text-memory">{content as string}</span>
                )}
                {phase === 'place' && content && (
                  <span className="text-electric-400">{content as string}</span>
                )}
                {phase === 'feedback' && content && typeof content === 'object' && (
                  <div className="relative">
                    {content.placed && (
                      <span className={status === 'correct' ? 'text-success-400' : 'text-error-400'}>
                        {content.placed}
                      </span>
                    )}
                    {status === 'missed' && content.target && (
                      <span className="text-warning-400">{content.target}</span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Symbol Palette */}
        {phase === 'place' && (
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2 text-center">
              Current: <span className="text-electric-400 text-xl">{currentSymbol || 'All placed!'}</span>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {remainingSymbols.map((symbol) => (
                <motion.button
                  key={symbol}
                  onClick={() => setCurrentSymbol(symbol)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-lg border-2',
                    currentSymbol === symbol
                      ? 'bg-electric-500/20 border-electric-500 text-electric-400'
                      : 'bg-navy-700 border-navy-600 text-gray-400'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {symbol}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {phase === 'place' && remainingSymbols.length === 0 && (
          <motion.button
            onClick={handleSubmit}
            className="px-8 py-3 bg-electric-500 text-white rounded-xl font-bold hover:bg-electric-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Check Answers
          </motion.button>
        )}

        {/* Feedback Stats */}
        {phase === 'feedback' && (
          <div className="text-center">
            <div className="text-lg font-medium text-white mb-2">
              {Array.from(targetPositions).filter(([pos, sym]) => placedSymbols.get(pos) === sym).length} / {targetPositions.size} correct
            </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
