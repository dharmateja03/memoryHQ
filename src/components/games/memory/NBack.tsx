'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface NBackProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { nBack: 1, displayTime: 2500, items: ['A', 'B', 'C', 'D'] },
  2: { nBack: 1, displayTime: 2000, items: ['A', 'B', 'C', 'D', 'E'] },
  3: { nBack: 2, displayTime: 2500, items: ['A', 'B', 'C', 'D'] },
  4: { nBack: 2, displayTime: 2000, items: ['A', 'B', 'C', 'D', 'E'] },
  5: { nBack: 2, displayTime: 1500, items: ['A', 'B', 'C', 'D', 'E', 'F'] },
  6: { nBack: 3, displayTime: 2500, items: ['A', 'B', 'C', 'D', 'E'] },
  7: { nBack: 3, displayTime: 2000, items: ['A', 'B', 'C', 'D', 'E', 'F'] },
  8: { nBack: 3, displayTime: 1500, items: ['A', 'B', 'C', 'D', 'E', 'F'] },
  9: { nBack: 4, displayTime: 2000, items: ['A', 'B', 'C', 'D', 'E', 'F'] },
  10: { nBack: 4, displayTime: 1500, items: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
};

const gameConfig = {
  id: 'n-back',
  name: 'N-Back',
  description: 'Identify when the current item matches the one N items back.',
  instructions: 'Press "Match" when the current letter matches the one shown N positions ago. This tests your working memory!',
  domain: 'memory',
};

export function NBack({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: NBackProps) {
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

  const [history, setHistory] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [responded, setResponded] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'missed' | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateItem = useCallback((hist: string[]): string => {
    // 30% chance to repeat N-back item if possible
    if (hist.length >= config.nBack && Math.random() < 0.3) {
      return hist[hist.length - config.nBack];
    }
    return config.items[Math.floor(Math.random() * config.items.length)];
  }, [config.nBack, config.items]);

  const isMatch = useCallback((): boolean => {
    if (history.length < config.nBack) return false;
    return currentItem === history[history.length - config.nBack];
  }, [history, currentItem, config.nBack]);

  const showNextItem = useCallback(() => {
    if (gameState.currentRound > totalRounds) {
      completeGame();
      return;
    }

    const newItem = generateItem(history);
    setCurrentItem(newItem);
    setResponded(false);
    setFeedback(null);

    timerRef.current = setTimeout(() => {
      // Time's up - check if should have responded
      const wasMatch = history.length >= config.nBack && newItem === history[history.length - config.nBack];

      if (wasMatch && !responded) {
        setFeedback('missed');
        recordResponse(false, config.displayTime);
      } else if (!wasMatch) {
        recordResponse(true, config.displayTime);
      }

      setHistory(prev => [...prev, newItem]);

      setTimeout(() => {
        if (gameState.currentRound >= totalRounds) {
          completeGame();
        } else {
          nextRound();
        }
      }, 500);
    }, config.displayTime);
  }, [gameState.currentRound, totalRounds, generateItem, history, config.nBack, config.displayTime, responded, recordResponse, completeGame, nextRound]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && !currentItem) {
      showNextItem();
    }
  }, [gameState.status, gameState.currentRound, currentItem, showNextItem]);

  useEffect(() => {
    if (gameState.currentRound > 1 && gameState.status === 'playing' && currentItem === null) {
      showNextItem();
    }
  }, [gameState.currentRound, gameState.status, currentItem, showNextItem]);

  const handleMatch = () => {
    if (responded || gameState.status !== 'playing') return;

    setResponded(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    const match = isMatch();
    if (match) {
      setFeedback('correct');
      recordResponse(true, 0);
    } else {
      setFeedback('incorrect');
      recordResponse(false, 0);
    }

    setHistory(prev => [...prev, currentItem!]);

    setTimeout(() => {
      setCurrentItem(null);
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
      }
    }, 500);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    setHistory([]);
    showNextItem();
  };
  const handleRestart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    resetGame();
    setHistory([]);
    setCurrentItem(null);
    setResponded(false);
    setFeedback(null);
    showInstructions();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
        {/* N-Back Level Indicator */}
        <div className="mb-8 text-center">
          <span className="px-4 py-2 bg-memory/20 text-memory rounded-xl text-lg font-bold">
            {config.nBack}-Back
          </span>
          <p className="text-gray-500 text-sm mt-2">
            Match if same as {config.nBack} item{config.nBack > 1 ? 's' : ''} ago
          </p>
        </div>

        {/* Current Item Display */}
        <motion.div
          className={cn(
            'w-40 h-40 rounded-3xl flex items-center justify-center mb-8 border-4 transition-colors',
            feedback === 'correct' && 'bg-success-500/20 border-success-500',
            feedback === 'incorrect' && 'bg-error-500/20 border-error-500',
            feedback === 'missed' && 'bg-warning-500/20 border-warning-500',
            !feedback && 'bg-navy-700 border-navy-600'
          )}
        >
          {currentItem && (
            <motion.span
              key={currentItem + gameState.currentRound}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-7xl font-bold text-white"
            >
              {currentItem}
            </motion.span>
          )}
        </motion.div>

        {/* History Display */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center max-w-md">
          {history.slice(-config.nBack - 1).map((item, i) => (
            <div
              key={i}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold',
                i === history.slice(-config.nBack - 1).length - config.nBack - 1
                  ? 'bg-memory/30 text-memory border-2 border-memory'
                  : 'bg-navy-700 text-gray-500'
              )}
            >
              {item}
            </div>
          ))}
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-electric-500/20 border-2 border-electric-500 text-electric-400 font-bold">
            ?
          </div>
        </div>

        {/* Match Button */}
        <motion.button
          onClick={handleMatch}
          disabled={responded || gameState.status !== 'playing'}
          className={cn(
            'px-12 py-4 rounded-xl text-xl font-bold transition-all',
            responded || gameState.status !== 'playing'
              ? 'bg-navy-700 text-gray-600 cursor-not-allowed'
              : 'bg-memory text-white hover:bg-memory/80'
          )}
          whileHover={!responded ? { scale: 1.05 } : undefined}
          whileTap={!responded ? { scale: 0.95 } : undefined}
        >
          Match!
        </motion.button>

        {/* Feedback */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-4 text-lg font-medium',
              feedback === 'correct' && 'text-success-400',
              feedback === 'incorrect' && 'text-error-400',
              feedback === 'missed' && 'text-warning-400'
            )}
          >
            {feedback === 'correct' && 'Correct match!'}
            {feedback === 'incorrect' && 'Not a match!'}
            {feedback === 'missed' && 'Missed a match!'}
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
