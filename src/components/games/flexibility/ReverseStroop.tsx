'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface ReverseStroopProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { congruentRatio: 0.7, ruleSwitch: false },
  2: { congruentRatio: 0.6, ruleSwitch: false },
  3: { congruentRatio: 0.5, ruleSwitch: false },
  4: { congruentRatio: 0.4, ruleSwitch: false },
  5: { congruentRatio: 0.4, ruleSwitch: true },
  6: { congruentRatio: 0.3, ruleSwitch: true },
  7: { congruentRatio: 0.3, ruleSwitch: true },
  8: { congruentRatio: 0.25, ruleSwitch: true },
  9: { congruentRatio: 0.2, ruleSwitch: true },
  10: { congruentRatio: 0.2, ruleSwitch: true },
};

const COLORS = [
  { name: 'RED', color: '#EF4444' },
  { name: 'BLUE', color: '#3B82F6' },
  { name: 'GREEN', color: '#10B981' },
  { name: 'YELLOW', color: '#F59E0B' },
];

type Rule = 'word' | 'color';

interface Trial {
  word: string;
  displayColor: string;
  isCongruent: boolean;
}

const gameConfig = {
  id: 'reverse-stroop',
  name: 'Reverse Stroop',
  description: 'Name the word, not the color it is displayed in.',
  instructions: 'Read the WORD, ignore its color! Sometimes the rule switches - pay attention to the current rule shown.',
  domain: 'flexibility',
};

export function ReverseStroop({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: ReverseStroopProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 30;

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

  const [trial, setTrial] = useState<Trial | null>(null);
  const [currentRule, setCurrentRule] = useState<Rule>('word');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateTrial = useCallback(() => {
    // Possibly switch rules
    let newRule = currentRule;
    if (config.ruleSwitch && Math.random() < 0.2) {
      newRule = currentRule === 'word' ? 'color' : 'word';
    }

    const isCongruent = Math.random() < config.congruentRatio;
    const wordIndex = Math.floor(Math.random() * COLORS.length);
    const word = COLORS[wordIndex].name;

    let displayColor: string;
    if (isCongruent) {
      displayColor = COLORS[wordIndex].color;
    } else {
      const otherColors = COLORS.filter((_, i) => i !== wordIndex);
      displayColor = otherColors[Math.floor(Math.random() * otherColors.length)].color;
    }

    setCurrentRule(newRule);
    setTrial({ word, displayColor, isCongruent });
    setSelectedAnswer(null);
    setShowFeedback(false);
    reactionTime.start();
  }, [currentRule, config.congruentRatio, config.ruleSwitch, reactionTime]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && !trial) {
      generateTrial();
    }
  }, [gameState.status, gameState.currentRound, trial, generateTrial]);

  const handleAnswer = (colorName: string) => {
    if (showFeedback || !trial) return;

    const rt = reactionTime.stop();
    let correctAnswer: string;

    if (currentRule === 'word') {
      correctAnswer = trial.word;
    } else {
      correctAnswer = COLORS.find(c => c.color === trial.displayColor)!.name;
    }

    const isCorrect = colorName === correctAnswer;

    setSelectedAnswer(colorName);
    setShowFeedback(true);
    recordResponse(isCorrect, rt);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setTrial(null);
      }
    }, 800);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    setCurrentRule('word');
    generateTrial();
  };
  const handleRestart = () => {
    resetGame();
    setTrial(null);
    setCurrentRule('word');
    showInstructions();
  };

  const getCorrectAnswer = () => {
    if (!trial) return '';
    if (currentRule === 'word') {
      return trial.word;
    }
    return COLORS.find(c => c.color === trial.displayColor)!.name;
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
        {/* Current Rule */}
        <motion.div
          key={currentRule}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className={cn(
            'px-6 py-2 rounded-xl text-sm font-bold',
            currentRule === 'word' ? 'bg-flexibility/20 text-flexibility' : 'bg-attention/20 text-attention'
          )}>
            {currentRule === 'word' ? 'Read the WORD' : 'Name the COLOR'}
          </div>
        </motion.div>

        {/* Word Display */}
        {trial && (
          <motion.div
            key={`${trial.word}-${trial.displayColor}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'mb-8 px-8 py-6 bg-navy-700 rounded-2xl border-2',
              showFeedback && selectedAnswer === getCorrectAnswer() && 'border-success-500',
              showFeedback && selectedAnswer !== getCorrectAnswer() && 'border-error-500',
              !showFeedback && 'border-navy-600'
            )}
          >
            <span
              className="text-5xl font-bold"
              style={{ color: trial.displayColor }}
            >
              {trial.word}
            </span>
          </motion.div>
        )}

        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-3">
          {COLORS.map((color) => {
            const isSelected = selectedAnswer === color.name;
            const isCorrect = showFeedback && color.name === getCorrectAnswer();
            const isWrong = showFeedback && isSelected && color.name !== getCorrectAnswer();

            return (
              <motion.button
                key={color.name}
                onClick={() => handleAnswer(color.name)}
                disabled={showFeedback}
                className={cn(
                  'px-8 py-4 rounded-xl font-bold text-lg transition-all border-2',
                  isCorrect && 'bg-success-500/20 border-success-500 text-success-400',
                  isWrong && 'bg-error-500/20 border-error-500 text-error-400',
                  !showFeedback && 'bg-navy-700 border-navy-600 hover:border-electric-500/50'
                )}
                style={{ color: showFeedback ? undefined : color.color }}
                whileHover={!showFeedback ? { scale: 1.05 } : undefined}
                whileTap={!showFeedback ? { scale: 0.95 } : undefined}
              >
                {color.name}
              </motion.button>
            );
          })}
        </div>

        {/* Trial type indicator */}
        {trial && (
          <div className="mt-4 text-xs text-gray-600">
            {trial.isCongruent ? 'Congruent' : 'Incongruent'}
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
