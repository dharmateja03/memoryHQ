'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface CategorySwitchingProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { switchFrequency: 5, categories: 2 },
  2: { switchFrequency: 4, categories: 2 },
  3: { switchFrequency: 4, categories: 2 },
  4: { switchFrequency: 3, categories: 2 },
  5: { switchFrequency: 3, categories: 3 },
  6: { switchFrequency: 2, categories: 3 },
  7: { switchFrequency: 2, categories: 3 },
  8: { switchFrequency: 2, categories: 4 },
  9: { switchFrequency: 1, categories: 4 },
  10: { switchFrequency: 1, categories: 4 },
};

type Category = 'animal' | 'food' | 'vehicle' | 'furniture';

const ITEMS: Record<Category, { word: string; options: [string, string] }[]> = {
  animal: [
    { word: 'Dog', options: ['Yes', 'No'] },
    { word: 'Cat', options: ['Yes', 'No'] },
    { word: 'Bird', options: ['Yes', 'No'] },
    { word: 'Fish', options: ['Yes', 'No'] },
    { word: 'Table', options: ['Yes', 'No'] },
    { word: 'Apple', options: ['Yes', 'No'] },
  ],
  food: [
    { word: 'Pizza', options: ['Yes', 'No'] },
    { word: 'Burger', options: ['Yes', 'No'] },
    { word: 'Salad', options: ['Yes', 'No'] },
    { word: 'Cake', options: ['Yes', 'No'] },
    { word: 'Chair', options: ['Yes', 'No'] },
    { word: 'Lion', options: ['Yes', 'No'] },
  ],
  vehicle: [
    { word: 'Car', options: ['Yes', 'No'] },
    { word: 'Bike', options: ['Yes', 'No'] },
    { word: 'Train', options: ['Yes', 'No'] },
    { word: 'Plane', options: ['Yes', 'No'] },
    { word: 'Banana', options: ['Yes', 'No'] },
    { word: 'Desk', options: ['Yes', 'No'] },
  ],
  furniture: [
    { word: 'Chair', options: ['Yes', 'No'] },
    { word: 'Table', options: ['Yes', 'No'] },
    { word: 'Sofa', options: ['Yes', 'No'] },
    { word: 'Bed', options: ['Yes', 'No'] },
    { word: 'Truck', options: ['Yes', 'No'] },
    { word: 'Tiger', options: ['Yes', 'No'] },
  ],
};

const CATEGORY_ANSWERS: Record<Category, string[]> = {
  animal: ['Dog', 'Cat', 'Bird', 'Fish', 'Lion', 'Tiger'],
  food: ['Pizza', 'Burger', 'Salad', 'Cake', 'Banana', 'Apple'],
  vehicle: ['Car', 'Bike', 'Train', 'Plane', 'Truck'],
  furniture: ['Chair', 'Table', 'Sofa', 'Bed', 'Desk'],
};

const gameConfig = {
  id: 'category-switching',
  name: 'Category Switching',
  description: 'Switch between categorizing items by different rules.',
  instructions: 'Determine if the word belongs to the current category. The category will change - stay flexible!',
  domain: 'flexibility',
};

export function CategorySwitching({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: CategorySwitchingProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 30;
  const allCategories: Category[] = ['animal', 'food', 'vehicle', 'furniture'];
  const categories = allCategories.slice(0, config.categories);

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

  const [currentCategory, setCurrentCategory] = useState<Category>('animal');
  const [currentWord, setCurrentWord] = useState('');
  const [trialsUntilSwitch, setTrialsUntilSwitch] = useState(config.switchFrequency);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateTrial = useCallback(() => {
    let newCategory = currentCategory;
    let newTrialsUntilSwitch = trialsUntilSwitch - 1;

    if (newTrialsUntilSwitch <= 0) {
      const otherCategories = categories.filter(c => c !== currentCategory);
      newCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)];
      newTrialsUntilSwitch = config.switchFrequency;
    }

    const items = ITEMS[newCategory];
    const item = items[Math.floor(Math.random() * items.length)];

    setCurrentCategory(newCategory);
    setTrialsUntilSwitch(newTrialsUntilSwitch);
    setCurrentWord(item.word);
    setSelectedAnswer(null);
    setShowFeedback(false);
    reactionTime.start();
  }, [currentCategory, trialsUntilSwitch, categories, config.switchFrequency, reactionTime]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && !currentWord) {
      generateTrial();
    }
  }, [gameState.status, gameState.currentRound, currentWord, generateTrial]);

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;

    const rt = reactionTime.stop();
    const correctAnswer = CATEGORY_ANSWERS[currentCategory].includes(currentWord) ? 'Yes' : 'No';
    const isCorrect = answer === correctAnswer;

    setSelectedAnswer(answer);
    setShowFeedback(true);
    recordResponse(isCorrect, rt);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setCurrentWord('');
      }
    }, 800);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    setTrialsUntilSwitch(config.switchFrequency);
    generateTrial();
  };
  const handleRestart = () => {
    resetGame();
    setCurrentWord('');
    setCurrentCategory('animal');
    setTrialsUntilSwitch(config.switchFrequency);
    showInstructions();
  };

  const getCategoryLabel = (cat: Category) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const correctAnswer = CATEGORY_ANSWERS[currentCategory].includes(currentWord) ? 'Yes' : 'No';

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
        {/* Current Category */}
        <motion.div
          key={currentCategory}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className="px-6 py-3 bg-flexibility/20 rounded-xl border-2 border-flexibility">
            <span className="text-gray-400 text-sm">Is this a </span>
            <span className="text-flexibility text-xl font-bold">
              {getCategoryLabel(currentCategory)}
            </span>
            <span className="text-gray-400 text-sm">?</span>
          </div>
        </motion.div>

        {/* Word Display */}
        <motion.div
          key={currentWord}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'w-48 h-24 rounded-2xl flex items-center justify-center border-2 mb-8',
            showFeedback && selectedAnswer === correctAnswer && 'bg-success-500/20 border-success-500',
            showFeedback && selectedAnswer !== correctAnswer && 'bg-error-500/20 border-error-500',
            !showFeedback && 'bg-navy-700 border-navy-600'
          )}
        >
          <span className="text-3xl font-bold text-white">{currentWord}</span>
        </motion.div>

        {/* Answer Buttons */}
        <div className="flex gap-4">
          {['Yes', 'No'].map((answer) => {
            const isSelected = selectedAnswer === answer;
            const isCorrectOption = showFeedback && answer === correctAnswer;
            const isWrong = showFeedback && isSelected && answer !== correctAnswer;

            return (
              <motion.button
                key={answer}
                onClick={() => handleAnswer(answer)}
                disabled={showFeedback}
                className={cn(
                  'px-12 py-4 rounded-xl font-bold text-lg transition-all border-2',
                  isCorrectOption && 'bg-success-500/20 border-success-500 text-success-400',
                  isWrong && 'bg-error-500/20 border-error-500 text-error-400',
                  !showFeedback && 'bg-navy-700 border-navy-600 text-white hover:border-electric-500/50'
                )}
                whileHover={!showFeedback ? { scale: 1.05 } : undefined}
                whileTap={!showFeedback ? { scale: 0.95 } : undefined}
              >
                {answer}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-6 text-lg font-medium',
              selectedAnswer === correctAnswer ? 'text-success-400' : 'text-error-400'
            )}
          >
            {selectedAnswer === correctAnswer ? 'Correct!' : `Incorrect! It's ${correctAnswer}`}
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
