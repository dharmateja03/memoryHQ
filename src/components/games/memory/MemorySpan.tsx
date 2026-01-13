'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface MemorySpanProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

type SpanType = 'digits' | 'letters';

const DIFFICULTY_CONFIG = {
  1: { startLength: 3, maxLength: 5, displayTime: 1000 },
  2: { startLength: 3, maxLength: 6, displayTime: 900 },
  3: { startLength: 4, maxLength: 7, displayTime: 800 },
  4: { startLength: 4, maxLength: 8, displayTime: 700 },
  5: { startLength: 5, maxLength: 9, displayTime: 600 },
  6: { startLength: 5, maxLength: 10, displayTime: 550 },
  7: { startLength: 6, maxLength: 11, displayTime: 500 },
  8: { startLength: 6, maxLength: 12, displayTime: 450 },
  9: { startLength: 7, maxLength: 13, displayTime: 400 },
  10: { startLength: 7, maxLength: 14, displayTime: 350 },
};

const gameConfig = {
  id: 'memory-span',
  name: 'Memory Span',
  description: 'Remember and recall sequences of digits or letters.',
  instructions: 'Watch the sequence carefully. After it finishes, type the sequence back in order. The sequences get longer as you progress!',
  domain: 'memory',
};

export function MemorySpan({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: MemorySpanProps) {
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

  const [spanType] = useState<SpanType>('digits');
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(-1);
  const [phase, setPhase] = useState<'showing' | 'input' | 'feedback'>('showing');
  const [userInput, setUserInput] = useState('');
  const [currentLength, setCurrentLength] = useState(config.startLength);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showingItem, setShowingItem] = useState<string | null>(null);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateSequence = useCallback((length: number): string[] => {
    const chars = spanType === 'digits'
      ? '0123456789'
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const seq: string[] = [];
    for (let i = 0; i < length; i++) {
      seq.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    return seq;
  }, [spanType]);

  const showSequence = useCallback(() => {
    if (currentDisplayIndex < sequence.length) {
      setShowingItem(sequence[currentDisplayIndex]);
      setTimeout(() => {
        setShowingItem(null);
        setTimeout(() => {
          setCurrentDisplayIndex(currentDisplayIndex + 1);
        }, 200);
      }, config.displayTime);
    } else {
      setPhase('input');
    }
  }, [currentDisplayIndex, sequence, config.displayTime]);

  useEffect(() => {
    if (phase === 'showing' && currentDisplayIndex >= 0 && currentDisplayIndex < sequence.length) {
      showSequence();
    } else if (phase === 'showing' && currentDisplayIndex >= sequence.length && sequence.length > 0) {
      setPhase('input');
    }
  }, [phase, currentDisplayIndex, sequence.length, showSequence]);

  const startNewRound = useCallback(() => {
    const newSequence = generateSequence(currentLength);
    setSequence(newSequence);
    setCurrentDisplayIndex(0);
    setPhase('showing');
    setUserInput('');
  }, [currentLength, generateSequence]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && sequence.length === 0) {
      startNewRound();
    }
  }, [gameState.status, gameState.currentRound, sequence.length, startNewRound]);

  const handleSubmit = () => {
    if (phase !== 'input') return;

    const isCorrect = userInput.toUpperCase() === sequence.join('');
    recordResponse(isCorrect, 0);
    setPhase('feedback');

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        if (isCorrect && currentLength < config.maxLength) {
          setCurrentLength(currentLength + 1);
        } else if (!isCorrect && currentLength > config.startLength) {
          setCurrentLength(currentLength - 1);
        }
        nextRound();
        setSequence([]);
      }
    }, 1500);
  };

  const handleKeyPress = (key: string) => {
    if (phase !== 'input') return;
    if (key === 'backspace') {
      setUserInput(userInput.slice(0, -1));
    } else if (key === 'enter') {
      handleSubmit();
    } else if (userInput.length < sequence.length) {
      setUserInput(userInput + key);
    }
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    startNewRound();
  };
  const handleRestart = () => {
    resetGame();
    setSequence([]);
    setUserInput('');
    setPhase('showing');
    setCurrentLength(config.startLength);
    showInstructions();
  };

  const keys = spanType === 'digits'
    ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    : ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'];

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
        {/* Sequence Length Indicator */}
        <div className="mb-6 text-gray-400 text-sm">
          Sequence length: <span className="text-white font-bold">{currentLength}</span>
        </div>

        {/* Display Area */}
        <div className="w-32 h-32 bg-navy-700 rounded-2xl flex items-center justify-center mb-8 border-2 border-navy-600">
          <AnimatePresence mode="wait">
            {phase === 'showing' && showingItem && (
              <motion.span
                key={showingItem + currentDisplayIndex}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-6xl font-bold text-electric-400"
              >
                {showingItem}
              </motion.span>
            )}
            {phase === 'showing' && !showingItem && currentDisplayIndex < sequence.length && (
              <span className="text-gray-600">•</span>
            )}
          </AnimatePresence>
          {phase === 'input' && (
            <span className="text-gray-500 text-sm">Enter sequence</span>
          )}
          {phase === 'feedback' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'text-4xl',
                userInput.toUpperCase() === sequence.join('') ? 'text-success-400' : 'text-error-400'
              )}
            >
              {userInput.toUpperCase() === sequence.join('') ? '✓' : '✗'}
            </motion.span>
          )}
        </div>

        {/* User Input Display */}
        {phase === 'input' && (
          <div className="mb-6">
            <div className="flex gap-2 justify-center mb-4">
              {sequence.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-10 h-12 rounded-lg flex items-center justify-center text-xl font-bold border-2',
                    userInput[i]
                      ? 'bg-electric-500/20 border-electric-500 text-electric-400'
                      : 'bg-navy-700 border-navy-600 text-gray-600'
                  )}
                >
                  {userInput[i] || ''}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {phase === 'feedback' && (
          <div className="mb-6 text-center">
            <div className={cn(
              'text-lg font-medium mb-2',
              userInput.toUpperCase() === sequence.join('') ? 'text-success-400' : 'text-error-400'
            )}>
              {userInput.toUpperCase() === sequence.join('') ? 'Correct!' : 'Incorrect'}
            </div>
            {userInput.toUpperCase() !== sequence.join('') && (
              <div className="text-gray-400 text-sm">
                Correct sequence: <span className="text-white">{sequence.join('')}</span>
              </div>
            )}
          </div>
        )}

        {/* Keypad */}
        {phase === 'input' && (
          <div className="w-full max-w-sm">
            <div className="grid grid-cols-5 gap-2 mb-3">
              {keys.slice(0, 10).map((key) => (
                <motion.button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className="py-3 bg-navy-700 rounded-lg text-white font-bold hover:bg-navy-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {key}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => handleKeyPress('backspace')}
                className="flex-1 py-3 bg-navy-700 rounded-lg text-gray-400 font-medium hover:bg-navy-600 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                ← Delete
              </motion.button>
              <motion.button
                onClick={() => handleKeyPress('enter')}
                disabled={userInput.length !== sequence.length}
                className={cn(
                  'flex-1 py-3 rounded-lg font-bold transition-colors',
                  userInput.length === sequence.length
                    ? 'bg-electric-500 text-white hover:bg-electric-400'
                    : 'bg-navy-700 text-gray-600 cursor-not-allowed'
                )}
                whileTap={userInput.length === sequence.length ? { scale: 0.95 } : undefined}
              >
                Submit
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
