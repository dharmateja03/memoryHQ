'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface NumberSeriesProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

type PatternType = 'add' | 'subtract' | 'multiply' | 'alternate' | 'fibonacci' | 'square' | 'double';

interface Pattern {
  type: PatternType;
  params: number[];
  generate: (start: number, length: number) => number[];
  difficulty: number;
}

// Pattern generators
const PATTERNS: Pattern[] = [
  {
    type: 'add',
    params: [2],
    generate: (start, length) => Array.from({ length }, (_, i) => start + i * 2),
    difficulty: 1,
  },
  {
    type: 'add',
    params: [3],
    generate: (start, length) => Array.from({ length }, (_, i) => start + i * 3),
    difficulty: 1,
  },
  {
    type: 'add',
    params: [5],
    generate: (start, length) => Array.from({ length }, (_, i) => start + i * 5),
    difficulty: 2,
  },
  {
    type: 'subtract',
    params: [3],
    generate: (start, length) => Array.from({ length }, (_, i) => start - i * 3),
    difficulty: 2,
  },
  {
    type: 'multiply',
    params: [2],
    generate: (start, length) => Array.from({ length }, (_, i) => start * Math.pow(2, i)),
    difficulty: 3,
  },
  {
    type: 'alternate',
    params: [2, 3],
    generate: (start, length) => {
      const result = [start];
      for (let i = 1; i < length; i++) {
        result.push(result[i - 1] + (i % 2 === 1 ? 2 : 3));
      }
      return result;
    },
    difficulty: 4,
  },
  {
    type: 'double',
    params: [],
    generate: (start, length) => Array.from({ length }, (_, i) => start * Math.pow(2, i)),
    difficulty: 3,
  },
  {
    type: 'square',
    params: [],
    generate: (_, length) => Array.from({ length }, (_, i) => (i + 1) ** 2),
    difficulty: 5,
  },
  {
    type: 'fibonacci',
    params: [],
    generate: (_, length) => {
      const fib = [1, 1];
      for (let i = 2; i < length; i++) {
        fib.push(fib[i - 1] + fib[i - 2]);
      }
      return fib.slice(0, length);
    },
    difficulty: 6,
  },
];

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  1: { sequenceLength: 4, optionCount: 3, maxPatternDifficulty: 1 },
  2: { sequenceLength: 4, optionCount: 3, maxPatternDifficulty: 2 },
  3: { sequenceLength: 5, optionCount: 4, maxPatternDifficulty: 2 },
  4: { sequenceLength: 5, optionCount: 4, maxPatternDifficulty: 3 },
  5: { sequenceLength: 5, optionCount: 4, maxPatternDifficulty: 4 },
  6: { sequenceLength: 6, optionCount: 4, maxPatternDifficulty: 4 },
  7: { sequenceLength: 6, optionCount: 5, maxPatternDifficulty: 5 },
  8: { sequenceLength: 6, optionCount: 5, maxPatternDifficulty: 5 },
  9: { sequenceLength: 7, optionCount: 5, maxPatternDifficulty: 6 },
  10: { sequenceLength: 7, optionCount: 6, maxPatternDifficulty: 6 },
};

const gameConfig = {
  id: 'number-series',
  name: 'Number Series',
  description: 'Find patterns and predict the next number.',
  instructions: 'Look at the sequence of numbers and find the pattern. Select what number comes next in the sequence.',
  domain: 'problem_solving',
};

export function NumberSeries({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: NumberSeriesProps) {
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

  const [sequence, setSequence] = useState<number[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize game
  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  // Generate new trial
  const generateTrial = useCallback(() => {
    // Filter patterns by difficulty
    const availablePatterns = PATTERNS.filter(p => p.difficulty <= config.maxPatternDifficulty);
    const pattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

    // Generate sequence
    const start = Math.floor(Math.random() * 10) + 1;
    const fullSequence = pattern.generate(start, config.sequenceLength + 1);
    const displaySequence = fullSequence.slice(0, config.sequenceLength);
    const answer = fullSequence[config.sequenceLength];

    // Generate wrong options
    const wrongOptions: number[] = [];
    while (wrongOptions.length < config.optionCount - 1) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      const wrongAnswer = answer + offset;
      if (wrongAnswer !== answer && !wrongOptions.includes(wrongAnswer) && wrongAnswer > 0) {
        wrongOptions.push(wrongAnswer);
      }
    }

    // Shuffle options
    const allOptions = [answer, ...wrongOptions].sort(() => Math.random() - 0.5);

    setSequence(displaySequence);
    setCorrectAnswer(answer);
    setOptions(allOptions);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [config.sequenceLength, config.optionCount, config.maxPatternDifficulty]);

  // Start new round when game begins
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && sequence.length === 0) {
      generateTrial();
    }
  }, [gameState.status, gameState.currentRound, sequence.length, generateTrial]);

  // Handle answer selection
  const handleSelectAnswer = useCallback((answer: number) => {
    if (showFeedback || gameState.status !== 'playing') return;

    const isCorrect = answer === correctAnswer;

    setSelectedAnswer(answer);
    setShowFeedback(true);
    recordResponse(isCorrect);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        generateTrial();
      }
    }, 1200);
  }, [showFeedback, gameState.status, gameState.currentRound, totalRounds, correctAnswer, recordResponse, completeGame, nextRound, generateTrial]);

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
    setSequence([]);
    setCorrectAnswer(0);
    setOptions([]);
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
        {/* Sequence */}
        <div className="mb-12">
          <p className="text-gray-400 text-sm text-center mb-4">Find the pattern:</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {sequence.map((num, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-16 h-16 rounded-xl bg-navy-700 border-2 border-navy-600 flex items-center justify-center"
              >
                <span className="text-2xl font-bold text-white">{num}</span>
              </motion.div>
            ))}
            {/* Question mark */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sequence.length * 0.1 }}
              className={cn(
                'w-16 h-16 rounded-xl border-2 flex items-center justify-center',
                showFeedback && selectedAnswer === correctAnswer
                  ? 'bg-success-500/20 border-success-500'
                  : showFeedback && selectedAnswer !== correctAnswer
                  ? 'bg-error-500/20 border-error-500'
                  : 'bg-electric-500/20 border-electric-500 border-dashed'
              )}
            >
              <span className="text-2xl font-bold text-electric-400">
                {showFeedback ? correctAnswer : '?'}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Options */}
        <div className="w-full max-w-md">
          <p className="text-gray-400 text-sm text-center mb-4">What comes next?</p>
          <div className="grid grid-cols-3 gap-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = showFeedback && option === correctAnswer;
              const isWrong = showFeedback && isSelected && option !== correctAnswer;

              return (
                <motion.button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={showFeedback}
                  className={cn(
                    'py-4 px-6 rounded-xl font-bold text-xl transition-all',
                    'border-2',
                    isCorrect && 'border-success-500 bg-success-500/20 text-success-400',
                    isWrong && 'border-error-500 bg-error-500/20 text-error-400',
                    !showFeedback && !isSelected && 'border-navy-600 bg-navy-700 text-white hover:border-electric-500/50',
                    isSelected && !showFeedback && 'border-electric-500 bg-electric-500/20 text-electric-400'
                  )}
                  whileHover={!showFeedback ? { scale: 1.02 } : undefined}
                  whileTap={!showFeedback ? { scale: 0.98 } : undefined}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
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
                  The answer was {correctAnswer}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameWrapper>
  );
}
