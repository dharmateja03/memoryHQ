'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface ChangeDetectionProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { itemCount: 3, displayTime: 2000, changeChance: 0.5 },
  2: { itemCount: 4, displayTime: 1800, changeChance: 0.5 },
  3: { itemCount: 4, displayTime: 1500, changeChance: 0.5 },
  4: { itemCount: 5, displayTime: 1500, changeChance: 0.5 },
  5: { itemCount: 5, displayTime: 1200, changeChance: 0.5 },
  6: { itemCount: 6, displayTime: 1200, changeChance: 0.5 },
  7: { itemCount: 6, displayTime: 1000, changeChance: 0.5 },
  8: { itemCount: 7, displayTime: 1000, changeChance: 0.5 },
  9: { itemCount: 8, displayTime: 800, changeChance: 0.5 },
  10: { itemCount: 8, displayTime: 600, changeChance: 0.5 },
};

const COLORS = [
  '#EF4444', // red
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

interface Item {
  id: number;
  x: number;
  y: number;
  color: string;
}

const gameConfig = {
  id: 'change-detection',
  name: 'Change Detection',
  description: 'Detect if any color changed between presentations.',
  instructions: 'Study the colored squares, then after a brief blank, determine if any square changed color. Quick decisions test your visual working memory!',
  domain: 'attention',
};

export function ChangeDetection({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: ChangeDetectionProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 24;

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

  const [originalItems, setOriginalItems] = useState<Item[]>([]);
  const [displayItems, setDisplayItems] = useState<Item[]>([]);
  const [hasChange, setHasChange] = useState(false);
  const [changedItemId, setChangedItemId] = useState<number | null>(null);
  const [phase, setPhase] = useState<'study' | 'blank' | 'test' | 'feedback'>('study');
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const itemIdRef = useRef(0);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generatePositions = useCallback((count: number): { x: number; y: number }[] => {
    const gridSize = Math.ceil(Math.sqrt(count * 2));
    const cellSize = 100 / gridSize;

    const availableCells: { x: number; y: number }[] = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        availableCells.push({
          x: cellSize * i + cellSize * 0.2 + Math.random() * cellSize * 0.6,
          y: cellSize * j + cellSize * 0.2 + Math.random() * cellSize * 0.6
        });
      }
    }

    const shuffled = availableCells.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  const generateTrial = useCallback(() => {
    const positions = generatePositions(config.itemCount);
    const usedColors = new Set<string>();
    const items: Item[] = positions.map(pos => {
      let color: string;
      do {
        color = COLORS[Math.floor(Math.random() * COLORS.length)];
      } while (usedColors.has(color) && usedColors.size < COLORS.length);
      usedColors.add(color);

      return {
        id: ++itemIdRef.current,
        x: pos.x,
        y: pos.y,
        color
      };
    });

    const willChange = Math.random() < config.changeChance;
    let testItems = [...items];
    let changedId: number | null = null;

    if (willChange) {
      const changeIndex = Math.floor(Math.random() * items.length);
      const currentColor = items[changeIndex].color;
      const availableColors = COLORS.filter(c => c !== currentColor && !items.some(i => i.color === c));
      const newColor = availableColors.length > 0
        ? availableColors[Math.floor(Math.random() * availableColors.length)]
        : COLORS.filter(c => c !== currentColor)[Math.floor(Math.random() * (COLORS.length - 1))];

      testItems = items.map((item, i) =>
        i === changeIndex ? { ...item, color: newColor } : item
      );
      changedId = items[changeIndex].id;
    }

    setOriginalItems(items);
    setDisplayItems(items);
    setHasChange(willChange);
    setChangedItemId(changedId);
    setSelectedAnswer(null);
    setPhase('study');

    // Transition through phases
    setTimeout(() => {
      setPhase('blank');
      setTimeout(() => {
        setDisplayItems(testItems);
        setPhase('test');
        reactionTime.start();
      }, 500);
    }, config.displayTime);
  }, [config.itemCount, config.changeChance, config.displayTime, generatePositions, reactionTime]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && originalItems.length === 0) {
      generateTrial();
    }
  }, [gameState.status, gameState.currentRound, originalItems.length, generateTrial]);

  const handleResponse = (detected: boolean) => {
    if (phase !== 'test') return;

    const rt = reactionTime.stop();
    const isCorrect = detected === hasChange;

    setSelectedAnswer(detected);
    setPhase('feedback');
    recordResponse(isCorrect, rt);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setOriginalItems([]);
      }
    }, 1500);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    generateTrial();
  };
  const handleRestart = () => {
    resetGame();
    setOriginalItems([]);
    setDisplayItems([]);
    setPhase('study');
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
        {/* Phase Indicator */}
        <div className="mb-4">
          <span className={cn(
            'px-4 py-2 rounded-xl text-sm font-bold',
            phase === 'study' && 'bg-attention/20 text-attention',
            phase === 'blank' && 'bg-gray-500/20 text-gray-400',
            phase === 'test' && 'bg-electric-500/20 text-electric-400',
            phase === 'feedback' && 'bg-success-500/20 text-success-400'
          )}>
            {phase === 'study' && 'Memorize'}
            {phase === 'blank' && '...'}
            {phase === 'test' && 'Same or Different?'}
            {phase === 'feedback' && (selectedAnswer === hasChange ? 'Correct!' : 'Incorrect')}
          </span>
        </div>

        {/* Display Area */}
        <div className="relative w-72 h-72 bg-navy-700 rounded-2xl border-2 border-navy-600 mb-6 overflow-hidden">
          {phase !== 'blank' && displayItems.map((item) => {
            const isChanged = phase === 'feedback' && item.id === changedItemId;
            const originalItem = originalItems.find(o => o.id === item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  'absolute w-10 h-10 rounded-lg',
                  isChanged && 'ring-4 ring-white'
                )}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: item.color
                }}
              >
                {phase === 'feedback' && isChanged && originalItem && (
                  <div
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: originalItem.color }}
                  />
                )}
              </motion.div>
            );
          })}

          {phase === 'blank' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-600 text-4xl">+</span>
            </div>
          )}
        </div>

        {/* Response Buttons */}
        {phase === 'test' && (
          <div className="flex gap-4">
            <motion.button
              onClick={() => handleResponse(false)}
              className="px-8 py-4 bg-navy-700 rounded-xl font-bold text-white border-2 border-navy-600 hover:border-success-500/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Same
            </motion.button>
            <motion.button
              onClick={() => handleResponse(true)}
              className="px-8 py-4 bg-navy-700 rounded-xl font-bold text-white border-2 border-navy-600 hover:border-error-500/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Different
            </motion.button>
          </div>
        )}

        {/* Feedback */}
        {phase === 'feedback' && (
          <div className="text-center">
            <div className={cn(
              'text-lg font-medium mb-2',
              selectedAnswer === hasChange ? 'text-success-400' : 'text-error-400'
            )}>
              {selectedAnswer === hasChange ? 'Correct!' : 'Incorrect'}
            </div>
            <div className="text-sm text-gray-500">
              {hasChange ? 'There was a change' : 'No change occurred'}
            </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
