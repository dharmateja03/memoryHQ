'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface VisualPairsProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { pairCount: 3, displayTime: 4000, optionCount: 3 },
  2: { pairCount: 4, displayTime: 4000, optionCount: 3 },
  3: { pairCount: 4, displayTime: 3500, optionCount: 4 },
  4: { pairCount: 5, displayTime: 3500, optionCount: 4 },
  5: { pairCount: 5, displayTime: 3000, optionCount: 4 },
  6: { pairCount: 6, displayTime: 3000, optionCount: 5 },
  7: { pairCount: 6, displayTime: 2500, optionCount: 5 },
  8: { pairCount: 7, displayTime: 2500, optionCount: 5 },
  9: { pairCount: 8, displayTime: 2000, optionCount: 6 },
  10: { pairCount: 8, displayTime: 1500, optionCount: 6 },
};

const EMOJIS = [
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑',
  '🌸', '🌺', '🌻', '🌹', '🌷', '💐', '🌵', '🌲',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '⭐', '🌙', '☀️', '⚡', '🔥', '💧', '❄️', '🌈',
  '🎈', '🎁', '🎀', '🎨', '🎭', '🎪', '🎢', '🎡'
];

const COLORS = [
  { name: 'red', bg: 'bg-red-500', border: 'border-red-400' },
  { name: 'blue', bg: 'bg-blue-500', border: 'border-blue-400' },
  { name: 'green', bg: 'bg-green-500', border: 'border-green-400' },
  { name: 'yellow', bg: 'bg-yellow-500', border: 'border-yellow-400' },
  { name: 'purple', bg: 'bg-purple-500', border: 'border-purple-400' },
  { name: 'pink', bg: 'bg-pink-500', border: 'border-pink-400' },
  { name: 'orange', bg: 'bg-orange-500', border: 'border-orange-400' },
  { name: 'teal', bg: 'bg-teal-500', border: 'border-teal-400' },
];

interface Pair {
  emoji: string;
  color: typeof COLORS[0];
}

const gameConfig = {
  id: 'visual-pairs',
  name: 'Visual Pairs',
  description: 'Remember which symbols go with which colors.',
  instructions: 'Study the emoji-color pairs carefully. Then for each emoji, select the color it was paired with!',
  domain: 'memory',
};

export function VisualPairs({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: VisualPairsProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 6;

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

  const [pairs, setPairs] = useState<Pair[]>([]);
  const [phase, setPhase] = useState<'study' | 'test' | 'feedback'>('study');
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [colorOptions, setColorOptions] = useState<typeof COLORS>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateRound = useCallback(() => {
    const shuffledEmojis = [...EMOJIS].sort(() => Math.random() - 0.5);
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);

    const newPairs: Pair[] = [];
    for (let i = 0; i < config.pairCount; i++) {
      newPairs.push({
        emoji: shuffledEmojis[i],
        color: shuffledColors[i % shuffledColors.length]
      });
    }

    setPairs(newPairs);
    setCurrentTestIndex(0);
    setRoundCorrect(0);
    setSelectedColor(null);
    setPhase('study');

    setTimeout(() => {
      setPhase('test');
      generateOptions(newPairs[0], newPairs);
    }, config.displayTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.pairCount, config.displayTime]);

  const generateOptions = useCallback((currentPair: Pair, _allPairs: Pair[]) => {
    const correctColor = currentPair.color;
    const otherColors = COLORS.filter(c => c.name !== correctColor.name);
    const shuffledOther = otherColors.sort(() => Math.random() - 0.5);
    const options = [correctColor, ...shuffledOther.slice(0, config.optionCount - 1)];
    setColorOptions(options.sort(() => Math.random() - 0.5));
  }, [config.optionCount]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && pairs.length === 0) {
      generateRound();
    }
  }, [gameState.status, gameState.currentRound, pairs.length, generateRound]);

  const handleColorSelect = (color: typeof COLORS[0]) => {
    if (phase !== 'test' || selectedColor) return;

    setSelectedColor(color.name);
    const currentPair = pairs[currentTestIndex];
    const isCorrect = color.name === currentPair.color.name;

    if (isCorrect) {
      setRoundCorrect(roundCorrect + 1);
    }

    setPhase('feedback');

    setTimeout(() => {
      if (currentTestIndex < pairs.length - 1) {
        setCurrentTestIndex(currentTestIndex + 1);
        setSelectedColor(null);
        setPhase('test');
        generateOptions(pairs[currentTestIndex + 1], pairs);
      } else {
        // Round complete
        const finalCorrect = isCorrect ? roundCorrect + 1 : roundCorrect;
        const accuracy = finalCorrect / pairs.length;
        recordResponse(accuracy >= 0.7, 0);

        setTimeout(() => {
          if (gameState.currentRound >= totalRounds) {
            completeGame();
          } else {
            nextRound();
            setPairs([]);
          }
        }, 1000);
      }
    }, 1000);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    generateRound();
  };
  const handleRestart = () => {
    resetGame();
    setPairs([]);
    setPhase('study');
    showInstructions();
  };

  const currentPair = pairs[currentTestIndex];

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
            (phase === 'test' || phase === 'feedback') && 'bg-electric-500/20 text-electric-400'
          )}>
            {phase === 'study' && 'Memorize the pairs'}
            {phase === 'test' && `Test ${currentTestIndex + 1}/${pairs.length}`}
            {phase === 'feedback' && (selectedColor === currentPair?.color.name ? 'Correct!' : 'Incorrect')}
          </span>
        </div>

        {/* Study Phase - Show all pairs */}
        {phase === 'study' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pairs.map((pair, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'w-20 h-24 rounded-xl flex flex-col items-center justify-center gap-2 border-2',
                  pair.color.bg,
                  pair.color.border
                )}
              >
                <span className="text-3xl">{pair.emoji}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Test Phase - Show emoji, pick color */}
        {(phase === 'test' || phase === 'feedback') && currentPair && (
          <>
            <motion.div
              key={currentTestIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-24 h-24 bg-navy-700 rounded-2xl flex items-center justify-center mb-8 border-2 border-navy-600"
            >
              <span className="text-5xl">{currentPair.emoji}</span>
            </motion.div>

            <p className="text-gray-400 mb-4">What color was this paired with?</p>

            <div className="flex gap-3 flex-wrap justify-center">
              {colorOptions.map((color) => {
                const isSelected = selectedColor === color.name;
                const isCorrect = phase === 'feedback' && color.name === currentPair.color.name;
                const isWrong = phase === 'feedback' && isSelected && color.name !== currentPair.color.name;

                return (
                  <motion.button
                    key={color.name}
                    onClick={() => handleColorSelect(color)}
                    disabled={phase === 'feedback'}
                    className={cn(
                      'w-16 h-16 rounded-xl border-4 transition-all',
                      color.bg,
                      isCorrect && 'border-white ring-4 ring-success-500',
                      isWrong && 'border-white ring-4 ring-error-500 opacity-50',
                      !isSelected && !isCorrect && phase === 'feedback' && 'opacity-40',
                      phase === 'test' && 'hover:scale-110 cursor-pointer border-transparent'
                    )}
                    whileHover={phase === 'test' ? { scale: 1.1 } : undefined}
                    whileTap={phase === 'test' ? { scale: 0.95 } : undefined}
                  />
                );
              })}
            </div>

            {/* Progress */}
            <div className="mt-8 text-sm text-gray-500">
              {roundCorrect} correct so far
            </div>
          </>
        )}
      </div>
    </GameWrapper>
  );
}
