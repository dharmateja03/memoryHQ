'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface VerbalFluencyProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { timeLimit: 60, minWords: 5, category: 'letter' as const },
  2: { timeLimit: 60, minWords: 7, category: 'letter' as const },
  3: { timeLimit: 45, minWords: 7, category: 'letter' as const },
  4: { timeLimit: 45, minWords: 8, category: 'semantic' as const },
  5: { timeLimit: 45, minWords: 10, category: 'semantic' as const },
  6: { timeLimit: 30, minWords: 8, category: 'switching' as const },
  7: { timeLimit: 30, minWords: 10, category: 'switching' as const },
  8: { timeLimit: 30, minWords: 12, category: 'switching' as const },
  9: { timeLimit: 30, minWords: 14, category: 'switching' as const },
  10: { timeLimit: 30, minWords: 16, category: 'switching' as const },
};

const LETTERS = 'ABCDEFGHIJKLMNOPRSTW'.split('');
const SEMANTIC_CATEGORIES = ['Animals', 'Foods', 'Countries', 'Sports', 'Colors', 'Vehicles'];

const gameConfig = {
  id: 'verbal-fluency',
  name: 'Verbal Fluency',
  description: 'Generate words based on rules as fast as possible.',
  instructions: 'Type words that match the given rule. For letters: words starting with that letter. For categories: items in that category. For switching: alternate between two categories!',
  domain: 'flexibility',
};

export function VerbalFluency({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: VerbalFluencyProps) {
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

  const [currentPrompt, setCurrentPrompt] = useState('');
  const [secondPrompt, setSecondPrompt] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [isComplete, setIsComplete] = useState(false);
  const [lastCategory, setLastCategory] = useState<0 | 1>(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generatePrompt = useCallback(() => {
    if (config.category === 'letter') {
      const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      setCurrentPrompt(`Words starting with "${letter}"`);
      setSecondPrompt('');
    } else if (config.category === 'semantic') {
      const category = SEMANTIC_CATEGORIES[Math.floor(Math.random() * SEMANTIC_CATEGORIES.length)];
      setCurrentPrompt(category);
      setSecondPrompt('');
    } else {
      // Switching
      const shuffled = [...SEMANTIC_CATEGORIES].sort(() => Math.random() - 0.5);
      setCurrentPrompt(shuffled[0]);
      setSecondPrompt(shuffled[1]);
    }

    setWords([]);
    setInputValue('');
    setTimeLeft(config.timeLimit);
    setIsComplete(false);
    setLastCategory(0);
  }, [config.category, config.timeLimit]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && !currentPrompt) {
      generatePrompt();
    }
  }, [gameState.status, gameState.currentRound, currentPrompt, generatePrompt]);

  // Timer
  useEffect(() => {
    if (gameState.status === 'playing' && timeLeft > 0 && !isComplete) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isComplete) {
      setIsComplete(true);
      const success = words.length >= config.minWords;
      recordResponse(success, 0);

      setTimeout(() => {
        if (gameState.currentRound >= totalRounds) {
          completeGame();
        } else {
          nextRound();
          setCurrentPrompt('');
        }
      }, 2000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState.status, timeLeft, isComplete, words.length, config.minWords, gameState.currentRound, totalRounds, recordResponse, completeGame, nextRound]);

  // Focus input when playing
  useEffect(() => {
    if (gameState.status === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState.status, currentPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isComplete) return;

    const word = inputValue.trim().toLowerCase();

    // Check if already used
    if (words.includes(word)) {
      setInputValue('');
      return;
    }

    // Validate word based on category type
    let isValid = true;

    if (config.category === 'letter') {
      const targetLetter = currentPrompt.match(/"([A-Z])"/)?.[1]?.toLowerCase();
      isValid = word.startsWith(targetLetter || '');
    }
    // For semantic and switching, we trust user input
    // In a real app, you'd validate against a dictionary

    if (isValid) {
      setWords([...words, word]);
      if (config.category === 'switching') {
        setLastCategory(lastCategory === 0 ? 1 : 0);
      }
    }

    setInputValue('');
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    generatePrompt();
  };
  const handleRestart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    resetGame();
    setCurrentPrompt('');
    showInstructions();
  };

  const getCurrentCategoryPrompt = () => {
    if (config.category !== 'switching') return currentPrompt;
    return lastCategory === 0 ? currentPrompt : secondPrompt;
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
        {/* Timer */}
        <div className="mb-4">
          <div className={cn(
            'text-4xl font-bold',
            timeLeft <= 10 ? 'text-error-400' : 'text-white'
          )}>
            {timeLeft}s
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-6 text-center">
          {config.category === 'switching' ? (
            <div className="flex gap-4 items-center">
              <span className={cn(
                'px-4 py-2 rounded-xl font-bold',
                lastCategory === 0 ? 'bg-flexibility text-white' : 'bg-navy-700 text-gray-400'
              )}>
                {currentPrompt}
              </span>
              <span className="text-gray-500">↔</span>
              <span className={cn(
                'px-4 py-2 rounded-xl font-bold',
                lastCategory === 1 ? 'bg-flexibility text-white' : 'bg-navy-700 text-gray-400'
              )}>
                {secondPrompt}
              </span>
            </div>
          ) : (
            <div className="px-6 py-3 bg-flexibility/20 rounded-xl">
              <span className="text-flexibility text-xl font-bold">{currentPrompt}</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm mb-6">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isComplete}
            placeholder={`Type a ${config.category === 'switching' ? getCurrentCategoryPrompt().toLowerCase() : 'word'}...`}
            className="w-full px-4 py-3 bg-navy-700 border-2 border-navy-600 rounded-xl text-white placeholder-gray-500 focus:border-electric-500 focus:outline-none"
            autoComplete="off"
          />
        </form>

        {/* Word Count */}
        <div className="mb-4 text-center">
          <div className={cn(
            'text-2xl font-bold',
            words.length >= config.minWords ? 'text-success-400' : 'text-white'
          )}>
            {words.length}
          </div>
          <div className="text-sm text-gray-500">
            words (need {config.minWords})
          </div>
        </div>

        {/* Words List */}
        <div className="flex flex-wrap gap-2 max-w-md justify-center">
          {words.slice(-12).map((word) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 bg-navy-700 rounded-lg text-sm text-gray-300"
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* Completion */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'mt-6 px-6 py-3 rounded-xl font-bold text-lg',
              words.length >= config.minWords
                ? 'bg-success-500/20 text-success-400'
                : 'bg-error-500/20 text-error-400'
            )}
          >
            {words.length >= config.minWords
              ? `Great! ${words.length} words!`
              : `Needed ${config.minWords}, got ${words.length}`}
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
