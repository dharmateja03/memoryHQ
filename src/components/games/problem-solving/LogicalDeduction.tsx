'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface LogicalDeductionProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { clueCount: 2, itemCount: 3 },
  2: { clueCount: 2, itemCount: 3 },
  3: { clueCount: 3, itemCount: 3 },
  4: { clueCount: 3, itemCount: 4 },
  5: { clueCount: 3, itemCount: 4 },
  6: { clueCount: 4, itemCount: 4 },
  7: { clueCount: 4, itemCount: 4 },
  8: { clueCount: 4, itemCount: 5 },
  9: { clueCount: 5, itemCount: 5 },
  10: { clueCount: 5, itemCount: 5 },
};

const NAMES = ['Alex', 'Blake', 'Casey', 'Drew', 'Eden'];
const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

interface Puzzle {
  clues: string[];
  question: string;
  answer: string;
  options: string[];
}

const gameConfig = {
  id: 'logical-deduction',
  name: 'Logical Deduction',
  description: 'Solve logic puzzles using given clues.',
  instructions: 'Read the clues carefully and use logical reasoning to answer the question. Only one answer is correct!',
  domain: 'problem_solving',
};

export function LogicalDeduction({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: LogicalDeductionProps) {
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

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generatePuzzle = useCallback((): Puzzle => {
    const names = NAMES.slice(0, config.itemCount);
    const colors = COLORS.slice(0, config.itemCount);

    // Shuffle and assign colors to names
    const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
    const assignments = new Map<string, string>();
    names.forEach((name, i) => assignments.set(name, shuffledColors[i]));

    const clues: string[] = [];
    const usedNames = new Set<string>();

    // Generate clues
    while (clues.length < config.clueCount) {
      const clueType = Math.floor(Math.random() * 3);

      if (clueType === 0 && usedNames.size < names.length - 1) {
        // Direct clue: "X has Y color"
        const availableNames = names.filter(n => !usedNames.has(n));
        const name = availableNames[Math.floor(Math.random() * availableNames.length)];
        const color = assignments.get(name);
        clues.push(`${name} has the ${color} item.`);
        usedNames.add(name);
      } else if (clueType === 1) {
        // Negative clue: "X does not have Y color"
        const name = names[Math.floor(Math.random() * names.length)];
        const wrongColors = colors.filter(c => c !== assignments.get(name));
        const wrongColor = wrongColors[Math.floor(Math.random() * wrongColors.length)];
        const clue = `${name} does not have the ${wrongColor} item.`;
        if (!clues.includes(clue)) {
          clues.push(clue);
        }
      } else {
        // Comparative clue
        const [name1, name2] = names.sort(() => Math.random() - 0.5).slice(0, 2);
        if (assignments.get(name1) !== assignments.get(name2)) {
          clues.push(`${name1} and ${name2} have different colored items.`);
        }
      }
    }

    // Pick a name to ask about
    const questionName = names[Math.floor(Math.random() * names.length)];
    const answer = assignments.get(questionName)!;

    return {
      clues,
      question: `What color item does ${questionName} have?`,
      answer,
      options: colors.sort(() => Math.random() - 0.5)
    };
  }, [config.itemCount, config.clueCount]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && !puzzle) {
      setPuzzle(generatePuzzle());
      setSelectedOption(null);
      setShowFeedback(false);
    }
  }, [gameState.status, gameState.currentRound, puzzle, generatePuzzle]);

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return;

    setSelectedOption(option);
    setShowFeedback(true);

    const isCorrect = option === puzzle?.answer;
    recordResponse(isCorrect, 0);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setPuzzle(null);
      }
    }, 1500);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    setPuzzle(generatePuzzle());
  };
  const handleRestart = () => {
    resetGame();
    setPuzzle(null);
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
        {puzzle && (
          <>
            {/* Clues */}
            <div className="bg-navy-700 rounded-xl p-4 mb-6 max-w-md w-full">
              <h3 className="text-sm font-bold text-gray-400 mb-3">CLUES:</h3>
              <ul className="space-y-2">
                {puzzle.clues.map((clue, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-white text-sm flex items-start gap-2"
                  >
                    <span className="text-electric-400">•</span>
                    {clue}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Question */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-white">{puzzle.question}</h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
              {puzzle.options.map((option) => {
                const isSelected = selectedOption === option;
                const isCorrect = showFeedback && option === puzzle.answer;
                const isWrong = showFeedback && isSelected && option !== puzzle.answer;

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    disabled={showFeedback}
                    className={cn(
                      'py-3 px-4 rounded-xl font-medium transition-all border-2',
                      isCorrect && 'bg-success-500/20 border-success-500 text-success-400',
                      isWrong && 'bg-error-500/20 border-error-500 text-error-400',
                      !showFeedback && 'bg-navy-700 border-navy-600 text-white hover:border-electric-500/50',
                      isSelected && !showFeedback && 'border-electric-500'
                    )}
                    whileHover={!showFeedback ? { scale: 1.02 } : undefined}
                    whileTap={!showFeedback ? { scale: 0.98 } : undefined}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {/* Feedback */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-6 text-lg font-medium',
              selectedOption === puzzle?.answer ? 'text-success-400' : 'text-error-400'
            )}
          >
            {selectedOption === puzzle?.answer ? 'Correct!' : `The answer was ${puzzle?.answer}`}
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
