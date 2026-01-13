'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface StroopTestProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const COLORS = [
  { name: 'RED', hex: '#EF4444' },
  { name: 'BLUE', hex: '#3B82F6' },
  { name: 'GREEN', hex: '#10B981' },
  { name: 'YELLOW', hex: '#F59E0B' },
  { name: 'PURPLE', hex: '#8B5CF6' },
  { name: 'ORANGE', hex: '#F97316' },
];

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  1: { colorCount: 3, congruentRatio: 0.8, timePerTrial: 3000 },
  2: { colorCount: 3, congruentRatio: 0.6, timePerTrial: 3000 },
  3: { colorCount: 4, congruentRatio: 0.5, timePerTrial: 2500 },
  4: { colorCount: 4, congruentRatio: 0.4, timePerTrial: 2500 },
  5: { colorCount: 4, congruentRatio: 0.3, timePerTrial: 2000 },
  6: { colorCount: 5, congruentRatio: 0.3, timePerTrial: 2000 },
  7: { colorCount: 5, congruentRatio: 0.2, timePerTrial: 1800 },
  8: { colorCount: 5, congruentRatio: 0.2, timePerTrial: 1500 },
  9: { colorCount: 6, congruentRatio: 0.15, timePerTrial: 1500 },
  10: { colorCount: 6, congruentRatio: 0.1, timePerTrial: 1200 },
};

const gameConfig = {
  id: 'stroop-test',
  name: 'Stroop Test',
  description: 'Classic attention and inhibition test. Identify ink colors, not words.',
  instructions: 'A color word will appear in a different ink color. Select the INK COLOR of the word, not what the word says. For example, if you see "RED" written in blue ink, select BLUE.',
  domain: 'attention',
};

export function StroopTest({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: StroopTestProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 20;
  const availableColors = COLORS.slice(0, config.colorCount);

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

  const [currentWord, setCurrentWord] = useState<string>('');
  const [currentColor, setCurrentColor] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize game
  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  // Generate new trial
  const generateTrial = useCallback(() => {
    const isCongruent = Math.random() < config.congruentRatio;

    const wordIndex = Math.floor(Math.random() * availableColors.length);
    const word = availableColors[wordIndex].name;

    let colorIndex;
    if (isCongruent) {
      colorIndex = wordIndex;
    } else {
      do {
        colorIndex = Math.floor(Math.random() * availableColors.length);
      } while (colorIndex === wordIndex);
    }

    const color = availableColors[colorIndex];

    setCurrentWord(word);
    setCurrentColor(color.hex);
    setCorrectAnswer(color.name);
    setSelectedAnswer(null);
    setShowFeedback(false);
    reactionTime.start();
  }, [availableColors, config.congruentRatio, reactionTime]);

  // Start new round when game begins
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && !currentWord) {
      generateTrial();
    }
  }, [gameState.status, gameState.currentRound, currentWord, generateTrial]);

  // Handle color selection
  const handleColorSelect = useCallback((colorName: string) => {
    if (showFeedback || gameState.status !== 'playing') return;

    const rt = reactionTime.stop();
    const isCorrect = colorName === correctAnswer;

    setSelectedAnswer(colorName);
    setShowFeedback(true);
    recordResponse(isCorrect, rt);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        generateTrial();
      }
    }, 800);
  }, [showFeedback, gameState.status, gameState.currentRound, totalRounds, reactionTime, correctAnswer, recordResponse, completeGame, nextRound, generateTrial]);

  // Handle game controls
  const handleStart = () => {
    startCountdown();
  };

  const handleCountdownComplete = () => {
    startGame();
    generateTrial();
  };

  const handleRestart = () => {
    resetGame();
    setCurrentWord('');
    setCurrentColor('');
    setCorrectAnswer('');
    setSelectedAnswer(null);
    setShowFeedback(false);
    showInstructions();
  };

  const handleExit = () => {
    onExit?.();
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
        {/* Current Word */}
        <AnimatePresence mode="wait">
          {currentWord && (
            <motion.div
              key={`${gameState.currentRound}-${currentWord}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="mb-12"
            >
              <div
                className="text-6xl sm:text-7xl font-black tracking-wider"
                style={{ color: currentColor }}
              >
                {currentWord}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instruction reminder */}
        <p className="text-gray-500 text-sm mb-8">
          Select the <span className="text-white font-medium">INK COLOR</span>, not the word
        </p>

        {/* Color Buttons */}
        <div className="grid grid-cols-3 gap-3 max-w-md w-full">
          {availableColors.map((color) => {
            const isSelected = selectedAnswer === color.name;
            const isCorrect = showFeedback && color.name === correctAnswer;
            const isWrong = showFeedback && isSelected && color.name !== correctAnswer;

            return (
              <motion.button
                key={color.name}
                onClick={() => handleColorSelect(color.name)}
                disabled={showFeedback}
                className={cn(
                  'py-4 px-6 rounded-xl font-bold text-lg transition-all',
                  'border-2',
                  isCorrect && 'border-success-500 bg-success-500/20',
                  isWrong && 'border-error-500 bg-error-500/20',
                  !showFeedback && !isSelected && 'border-navy-600 bg-navy-700 hover:border-electric-500/50',
                  isSelected && !showFeedback && 'border-electric-500 bg-electric-500/20'
                )}
                style={{
                  color: color.hex,
                }}
                whileHover={!showFeedback ? { scale: 1.02 } : undefined}
                whileTap={!showFeedback ? { scale: 0.98 } : undefined}
              >
                {color.name}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              {selectedAnswer === correctAnswer ? (
                <span className="text-success-400 font-medium">Correct!</span>
              ) : (
                <span className="text-error-400 font-medium">
                  Wrong! The answer was {correctAnswer}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameWrapper>
  );
}
