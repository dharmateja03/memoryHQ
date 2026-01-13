'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface TaskSwitchingProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

type TaskType = 'color' | 'shape' | 'size' | 'number';

interface Stimulus {
  color: 'red' | 'blue' | 'green' | 'yellow';
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
  size: 'small' | 'large';
  number: 1 | 2 | 3 | 4;
}

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  1: { taskCount: 2, switchFrequency: 5, timePerTrial: 4000 },
  2: { taskCount: 2, switchFrequency: 4, timePerTrial: 3500 },
  3: { taskCount: 2, switchFrequency: 3, timePerTrial: 3000 },
  4: { taskCount: 2, switchFrequency: 2, timePerTrial: 3000 },
  5: { taskCount: 3, switchFrequency: 3, timePerTrial: 2500 },
  6: { taskCount: 3, switchFrequency: 2, timePerTrial: 2500 },
  7: { taskCount: 3, switchFrequency: 1, timePerTrial: 2000 },
  8: { taskCount: 4, switchFrequency: 2, timePerTrial: 2000 },
  9: { taskCount: 4, switchFrequency: 1, timePerTrial: 1500 },
  10: { taskCount: 4, switchFrequency: 1, timePerTrial: 1200 },
};

const COLORS = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
};

const SHAPES = {
  circle: '●',
  square: '■',
  triangle: '▲',
  diamond: '◆',
};

const gameConfig = {
  id: 'task-switching',
  name: 'Task Switching',
  description: 'Rapidly switch between different rules.',
  instructions: 'Categorize the shape based on the current rule shown at the top. The rule will change - adapt quickly! For COLOR: select the color. For SHAPE: select the shape name.',
  domain: 'flexibility',
};

export function TaskSwitching({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: TaskSwitchingProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 24;

  const allTasks: TaskType[] = ['color', 'shape', 'size', 'number'];
  const availableTasks = allTasks.slice(0, config.taskCount);

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

  const [currentTask, setCurrentTask] = useState<TaskType>('color');
  const [stimulus, setStimulus] = useState<Stimulus | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [trialsUntilSwitch, setTrialsUntilSwitch] = useState(config.switchFrequency);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize game
  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  // Generate stimulus
  const generateStimulus = useCallback((): Stimulus => {
    const colors: Stimulus['color'][] = ['red', 'blue', 'green', 'yellow'];
    const shapes: Stimulus['shape'][] = ['circle', 'square', 'triangle', 'diamond'];
    const sizes: Stimulus['size'][] = ['small', 'large'];
    const numbers: Stimulus['number'][] = [1, 2, 3, 4];

    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)],
      number: numbers[Math.floor(Math.random() * numbers.length)],
    };
  }, []);

  // Get options and correct answer for current task
  const getTaskOptions = useCallback((task: TaskType, stim: Stimulus) => {
    switch (task) {
      case 'color':
        return {
          options: ['Red', 'Blue', 'Green', 'Yellow'],
          correct: stim.color.charAt(0).toUpperCase() + stim.color.slice(1),
        };
      case 'shape':
        return {
          options: ['Circle', 'Square', 'Triangle', 'Diamond'],
          correct: stim.shape.charAt(0).toUpperCase() + stim.shape.slice(1),
        };
      case 'size':
        return {
          options: ['Small', 'Large'],
          correct: stim.size.charAt(0).toUpperCase() + stim.size.slice(1),
        };
      case 'number':
        return {
          options: ['1', '2', '3', '4'],
          correct: stim.number.toString(),
        };
      default:
        return { options: [], correct: '' };
    }
  }, []);

  // Generate new trial
  const generateTrial = useCallback(() => {
    // Check if we need to switch tasks
    let newTask = currentTask;
    let newTrialsUntilSwitch = trialsUntilSwitch - 1;

    if (newTrialsUntilSwitch <= 0) {
      // Switch to a different task
      const otherTasks = availableTasks.filter(t => t !== currentTask);
      newTask = otherTasks[Math.floor(Math.random() * otherTasks.length)];
      newTrialsUntilSwitch = config.switchFrequency;
    }

    const newStimulus = generateStimulus();
    const { options: taskOptions, correct } = getTaskOptions(newTask, newStimulus);

    setCurrentTask(newTask);
    setTrialsUntilSwitch(newTrialsUntilSwitch);
    setStimulus(newStimulus);
    setOptions(taskOptions);
    setCorrectAnswer(correct);
    setSelectedAnswer(null);
    setShowFeedback(false);
    reactionTime.start();
  }, [currentTask, trialsUntilSwitch, availableTasks, config.switchFrequency, generateStimulus, getTaskOptions, reactionTime]);

  // Start new round when game begins
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && !stimulus) {
      generateTrial();
    }
  }, [gameState.status, gameState.currentRound, stimulus, generateTrial]);

  // Handle answer selection
  const handleSelectAnswer = useCallback((answer: string) => {
    if (showFeedback || gameState.status !== 'playing') return;

    const rt = reactionTime.stop();
    const isCorrect = answer === correctAnswer;

    setSelectedAnswer(answer);
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
    setTrialsUntilSwitch(config.switchFrequency);
    generateTrial();
  };

  const handleRestart = () => {
    resetGame();
    setCurrentTask('color');
    setStimulus(null);
    setOptions([]);
    setCorrectAnswer('');
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTrialsUntilSwitch(config.switchFrequency);
    showInstructions();
  };

  const handleExit = () => {
    onExit?.();
  };

  const getTaskLabel = (task: TaskType) => {
    switch (task) {
      case 'color': return 'COLOR';
      case 'shape': return 'SHAPE';
      case 'size': return 'SIZE';
      case 'number': return 'NUMBER';
    }
  };

  const getTaskColor = (task: TaskType) => {
    switch (task) {
      case 'color': return 'text-attention';
      case 'shape': return 'text-memory';
      case 'size': return 'text-speed';
      case 'number': return 'text-flexibility';
    }
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
        {/* Current Task Indicator */}
        <motion.div
          key={currentTask}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="px-6 py-3 bg-navy-700 rounded-xl border-2 border-navy-600">
            <span className="text-gray-400 text-sm">Categorize by: </span>
            <span className={cn('text-xl font-bold', getTaskColor(currentTask))}>
              {getTaskLabel(currentTask)}
            </span>
          </div>
        </motion.div>

        {/* Stimulus */}
        {stimulus && (
          <motion.div
            key={`${gameState.currentRound}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-2xl bg-navy-700 border-2 border-navy-600',
                stimulus.size === 'small' ? 'w-24 h-24' : 'w-40 h-40'
              )}
            >
              <span
                className={cn(
                  'font-bold',
                  stimulus.size === 'small' ? 'text-4xl' : 'text-6xl'
                )}
                style={{ color: COLORS[stimulus.color] }}
              >
                {SHAPES[stimulus.shape]}
              </span>
              {/* Number overlay */}
              <span
                className="absolute text-white font-bold text-lg"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
              >
                {stimulus.number}
              </span>
            </div>
          </motion.div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 max-w-md w-full">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = showFeedback && option === correctAnswer;
            const isWrong = showFeedback && isSelected && option !== correctAnswer;

            return (
              <motion.button
                key={option}
                onClick={() => handleSelectAnswer(option)}
                disabled={showFeedback}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'py-4 px-6 rounded-xl font-bold text-lg transition-all',
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
