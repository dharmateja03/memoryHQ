'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface ChoiceReactionProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { choices: 2, minDelay: 1500, maxDelay: 3000 },
  2: { choices: 2, minDelay: 1200, maxDelay: 2500 },
  3: { choices: 2, minDelay: 1000, maxDelay: 2000 },
  4: { choices: 3, minDelay: 1000, maxDelay: 2000 },
  5: { choices: 3, minDelay: 800, maxDelay: 1800 },
  6: { choices: 3, minDelay: 600, maxDelay: 1500 },
  7: { choices: 4, minDelay: 600, maxDelay: 1500 },
  8: { choices: 4, minDelay: 500, maxDelay: 1200 },
  9: { choices: 4, minDelay: 400, maxDelay: 1000 },
  10: { choices: 4, minDelay: 300, maxDelay: 800 },
};

const COLORS = [
  { name: 'red', bg: 'bg-red-500', key: 'r' },
  { name: 'blue', bg: 'bg-blue-500', key: 'b' },
  { name: 'green', bg: 'bg-green-500', key: 'g' },
  { name: 'yellow', bg: 'bg-yellow-500', key: 'y' },
];

const gameConfig = {
  id: 'choice-reaction',
  name: 'Choice Reaction',
  description: 'React to stimuli with the correct response.',
  instructions: 'When a color appears, press the matching color button as fast as you can. Speed AND accuracy matter!',
  domain: 'speed',
};

export function ChoiceReaction({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: ChoiceReactionProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 25;

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

  const [targetColor, setTargetColor] = useState<typeof COLORS[0] | null>(null);
  const [phase, setPhase] = useState<'waiting' | 'ready' | 'feedback'>('waiting');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [lastRT, setLastRT] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const availableColors = COLORS.slice(0, config.choices);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const startTrial = useCallback(() => {
    setPhase('waiting');
    setTargetColor(null);
    setSelectedColor(null);

    const delay = config.minDelay + Math.random() * (config.maxDelay - config.minDelay);

    timerRef.current = setTimeout(() => {
      const color = availableColors[Math.floor(Math.random() * availableColors.length)];
      setTargetColor(color);
      setPhase('ready');
      reactionTime.start();
    }, delay);
  }, [config.minDelay, config.maxDelay, availableColors, reactionTime]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && phase === 'waiting' && !targetColor) {
      startTrial();
    }
  }, [gameState.status, gameState.currentRound, phase, targetColor, startTrial]);

  const handleColorPress = (colorName: string) => {
    if (phase === 'waiting') {
      // Too early!
      if (timerRef.current) clearTimeout(timerRef.current);
      setSelectedColor(colorName);
      setPhase('feedback');
      setLastRT(null);
      recordResponse(false, 0);

      setTimeout(() => {
        if (gameState.currentRound >= totalRounds) {
          completeGame();
        } else {
          nextRound();
          startTrial();
        }
      }, 1000);
      return;
    }

    if (phase !== 'ready') return;

    const rt = reactionTime.stop();
    const isCorrect = colorName === targetColor?.name;

    setSelectedColor(colorName);
    setLastRT(rt);
    setPhase('feedback');
    recordResponse(isCorrect, rt);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        startTrial();
      }
    }, 800);
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing') return;

      const color = availableColors.find(c => c.key === e.key.toLowerCase());
      if (color) {
        handleColorPress(color.name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, availableColors, phase, targetColor]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    startTrial();
  };
  const handleRestart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    resetGame();
    setTargetColor(null);
    setPhase('waiting');
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
        {/* Status */}
        <div className="mb-8">
          <span className={cn(
            'px-4 py-2 rounded-xl text-sm font-bold',
            phase === 'waiting' && 'bg-gray-500/20 text-gray-400',
            phase === 'ready' && 'bg-speed/20 text-speed',
            phase === 'feedback' && (selectedColor === targetColor?.name ? 'bg-success-500/20 text-success-400' : 'bg-error-500/20 text-error-400')
          )}>
            {phase === 'waiting' && 'Get ready...'}
            {phase === 'ready' && 'GO!'}
            {phase === 'feedback' && selectedColor === targetColor?.name && `${lastRT}ms`}
            {phase === 'feedback' && selectedColor !== targetColor?.name && (lastRT === null ? 'Too early!' : 'Wrong color!')}
          </span>
        </div>

        {/* Target Display */}
        <div className={cn(
          'w-32 h-32 rounded-3xl mb-8 transition-all border-4',
          phase === 'waiting' && 'bg-navy-700 border-navy-600',
          phase === 'ready' && targetColor && `${targetColor.bg} border-white`,
          phase === 'feedback' && targetColor && `${targetColor.bg} border-white opacity-50`
        )}>
          {phase === 'waiting' && (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <span className="text-4xl">?</span>
            </div>
          )}
        </div>

        {/* Response Buttons */}
        <div className="flex gap-3 flex-wrap justify-center">
          {availableColors.map((color) => {
            const isSelected = selectedColor === color.name;
            const isCorrect = phase === 'feedback' && color.name === targetColor?.name;
            const isWrong = phase === 'feedback' && isSelected && color.name !== targetColor?.name;

            return (
              <motion.button
                key={color.name}
                onClick={() => handleColorPress(color.name)}
                className={cn(
                  'w-20 h-20 rounded-2xl transition-all border-4',
                  color.bg,
                  isCorrect && 'border-white ring-4 ring-success-500',
                  isWrong && 'border-white ring-4 ring-error-500 opacity-50',
                  !isSelected && phase === 'feedback' && !isCorrect && 'opacity-30',
                  phase !== 'feedback' && 'border-transparent hover:border-white/50'
                )}
                whileHover={phase !== 'feedback' ? { scale: 1.1 } : undefined}
                whileTap={phase !== 'feedback' ? { scale: 0.95 } : undefined}
              >
                <span className="text-white font-bold text-xs uppercase opacity-70">
                  ({color.key})
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Keyboard hints */}
        <div className="mt-6 text-xs text-gray-600">
          Press {availableColors.map(c => c.key.toUpperCase()).join(', ')} keys or click buttons
        </div>
      </div>
    </GameWrapper>
  );
}
