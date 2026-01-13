'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface PatternCompletionProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { patternLength: 4, patternType: 'shape', optionCount: 3 },
  2: { patternLength: 5, patternType: 'shape', optionCount: 4 },
  3: { patternLength: 5, patternType: 'color', optionCount: 4 },
  4: { patternLength: 6, patternType: 'color', optionCount: 4 },
  5: { patternLength: 6, patternType: 'rotation', optionCount: 4 },
  6: { patternLength: 7, patternType: 'rotation', optionCount: 5 },
  7: { patternLength: 7, patternType: 'multi', optionCount: 5 },
  8: { patternLength: 8, patternType: 'multi', optionCount: 5 },
  9: { patternLength: 8, patternType: 'complex', optionCount: 6 },
  10: { patternLength: 9, patternType: 'complex', optionCount: 6 },
};

const SHAPES = ['●', '■', '▲', '◆', '★'];
const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
const ROTATIONS = [0, 90, 180, 270];

interface PatternItem {
  shape: string;
  color: string;
  rotation: number;
}

const gameConfig = {
  id: 'pattern-completion',
  name: 'Pattern Completion',
  description: 'Identify the next item in a visual pattern.',
  instructions: 'Study the sequence and identify the pattern. Select the item that should come next in the sequence.',
  domain: 'problem_solving',
};

export function PatternCompletion({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: PatternCompletionProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 10;

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

  const [pattern, setPattern] = useState<PatternItem[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<PatternItem | null>(null);
  const [options, setOptions] = useState<PatternItem[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generatePattern = useCallback(() => {
    const items: PatternItem[] = [];
    const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const baseRotation = 0;

    const type = config.patternType;

    for (let i = 0; i < config.patternLength; i++) {
      let shape = baseShape;
      let color = baseColor;
      let rotation = baseRotation;

      switch (type) {
        case 'shape':
          // Alternating or cycling shapes
          shape = SHAPES[i % 2];
          break;
        case 'color':
          // Cycling colors
          color = COLORS[i % 3];
          break;
        case 'rotation':
          // Progressive rotation
          rotation = (i * 90) % 360;
          break;
        case 'multi':
          // Shape and color pattern
          shape = SHAPES[i % 2];
          color = COLORS[i % 3];
          break;
        case 'complex':
          // All three change
          shape = SHAPES[i % 3];
          color = COLORS[i % 2];
          rotation = (i * 90) % 360;
          break;
      }

      items.push({ shape, color, rotation });
    }

    // Generate the correct next item
    const nextIndex = config.patternLength;
    let nextShape = baseShape;
    let nextColor = baseColor;
    let nextRotation = baseRotation;

    switch (type) {
      case 'shape':
        nextShape = SHAPES[nextIndex % 2];
        break;
      case 'color':
        nextColor = COLORS[nextIndex % 3];
        break;
      case 'rotation':
        nextRotation = (nextIndex * 90) % 360;
        break;
      case 'multi':
        nextShape = SHAPES[nextIndex % 2];
        nextColor = COLORS[nextIndex % 3];
        break;
      case 'complex':
        nextShape = SHAPES[nextIndex % 3];
        nextColor = COLORS[nextIndex % 2];
        nextRotation = (nextIndex * 90) % 360;
        break;
    }

    const correct: PatternItem = { shape: nextShape, color: nextColor, rotation: nextRotation };

    // Generate wrong options
    const allOptions: PatternItem[] = [correct];
    while (allOptions.length < config.optionCount) {
      const wrongItem: PatternItem = {
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)]
      };

      // Make sure it's different from correct
      if (wrongItem.shape !== correct.shape || wrongItem.color !== correct.color || wrongItem.rotation !== correct.rotation) {
        allOptions.push(wrongItem);
      }
    }

    const shuffled = allOptions.sort(() => Math.random() - 0.5);

    setPattern(items);
    setCorrectAnswer(correct);
    setOptions(shuffled);
    setSelectedOption(null);
    setShowFeedback(false);
  }, [config.patternLength, config.patternType, config.optionCount]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && pattern.length === 0) {
      generatePattern();
    }
  }, [gameState.status, gameState.currentRound, pattern.length, generatePattern]);

  const handleOptionSelect = (index: number) => {
    if (showFeedback) return;

    const selected = options[index];
    const isCorrect = correctAnswer &&
      selected.shape === correctAnswer.shape &&
      selected.color === correctAnswer.color &&
      selected.rotation === correctAnswer.rotation;

    setSelectedOption(index);
    setShowFeedback(true);
    recordResponse(isCorrect || false, 0);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setPattern([]);
      }
    }, 1500);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    generatePattern();
  };
  const handleRestart = () => {
    resetGame();
    setPattern([]);
    showInstructions();
  };

  const isOptionCorrect = (option: PatternItem) => {
    return correctAnswer &&
      option.shape === correctAnswer.shape &&
      option.color === correctAnswer.color &&
      option.rotation === correctAnswer.rotation;
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
        {/* Pattern sequence */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {pattern.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center border-2 border-navy-600"
            >
              <span
                className="text-2xl"
                style={{
                  color: item.color,
                  transform: `rotate(${item.rotation}deg)`
                }}
              >
                {item.shape}
              </span>
            </motion.div>
          ))}
          {/* Missing slot */}
          <div className="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-dashed border-electric-500 bg-electric-500/10">
            <span className="text-electric-500/50 text-2xl">?</span>
          </div>
        </div>

        {/* Options */}
        <div className="flex gap-3 flex-wrap justify-center">
          {options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = showFeedback && isOptionCorrect(option);
            const isWrong = showFeedback && isSelected && !isOptionCorrect(option);

            return (
              <motion.button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showFeedback}
                className={cn(
                  'w-14 h-14 rounded-lg flex items-center justify-center border-2 transition-all',
                  isCorrect && 'bg-success-500/20 border-success-500',
                  isWrong && 'bg-error-500/20 border-error-500',
                  !showFeedback && 'bg-navy-700 border-navy-600 hover:border-electric-500/50',
                  isSelected && !showFeedback && 'border-electric-500'
                )}
                whileHover={!showFeedback ? { scale: 1.1 } : undefined}
                whileTap={!showFeedback ? { scale: 0.95 } : undefined}
              >
                <span
                  className="text-2xl"
                  style={{
                    color: option.color,
                    transform: `rotate(${option.rotation}deg)`
                  }}
                >
                  {option.shape}
                </span>
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
              selectedOption !== null && isOptionCorrect(options[selectedOption])
                ? 'text-success-400'
                : 'text-error-400'
            )}
          >
            {selectedOption !== null && isOptionCorrect(options[selectedOption])
              ? 'Correct!'
              : 'Incorrect - look for the pattern!'}
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
