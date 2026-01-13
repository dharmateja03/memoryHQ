'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface DividedAttentionProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { shapeSpeed: 2000, countingInterval: 1500, targetShape: 'circle' },
  2: { shapeSpeed: 1800, countingInterval: 1400, targetShape: 'circle' },
  3: { shapeSpeed: 1600, countingInterval: 1300, targetShape: 'circle' },
  4: { shapeSpeed: 1500, countingInterval: 1200, targetShape: 'square' },
  5: { shapeSpeed: 1400, countingInterval: 1100, targetShape: 'square' },
  6: { shapeSpeed: 1300, countingInterval: 1000, targetShape: 'square' },
  7: { shapeSpeed: 1200, countingInterval: 900, targetShape: 'triangle' },
  8: { shapeSpeed: 1100, countingInterval: 850, targetShape: 'triangle' },
  9: { shapeSpeed: 1000, countingInterval: 800, targetShape: 'triangle' },
  10: { shapeSpeed: 900, countingInterval: 750, targetShape: 'diamond' },
};

const SHAPES = ['circle', 'square', 'triangle', 'diamond'];
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

interface ShapeItem {
  id: number;
  shape: string;
  color: string;
  x: number;
  y: number;
  isTarget: boolean;
}

const gameConfig = {
  id: 'divided-attention',
  name: 'Divided Attention',
  description: 'Track multiple stimuli and respond to targets.',
  instructions: 'Click/tap on target shapes when they appear. While doing this, also count how many times you hear a beep. Report the count at the end!',
  domain: 'attention',
};

export function DividedAttention({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: DividedAttentionProps) {
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

  const [_shapes, _setShapes] = useState<ShapeItem[]>([]);
  const [currentShape, setCurrentShape] = useState<ShapeItem | null>(null);
  const [beepCount, setBeepCount] = useState(0);
  const [userBeepCount, setUserBeepCount] = useState(0);
  const [responded, setResponded] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'missed' | 'wrong' | null>(null);
  const [phase, setPhase] = useState<'playing' | 'counting'>('playing');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const shapeIdRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const beepTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateShape = useCallback((): ShapeItem => {
    const isTarget = Math.random() < 0.3;
    const shape = isTarget ? config.targetShape : SHAPES.filter(s => s !== config.targetShape)[Math.floor(Math.random() * 3)];

    return {
      id: ++shapeIdRef.current,
      shape,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      isTarget
    };
  }, [config.targetShape]);

  const showNextShape = useCallback(() => {
    if (phase !== 'playing') return;
    if (gameState.currentRound >= totalRounds) {
      setPhase('counting');
      return;
    }

    const shape = generateShape();
    setCurrentShape(shape);
    setResponded(false);
    setFeedback(null);
    reactionTime.start();

    timerRef.current = setTimeout(() => {
      if (shape.isTarget && !responded) {
        setFeedback('missed');
        recordResponse(false, config.shapeSpeed);
      } else if (!shape.isTarget) {
        recordResponse(true, 0);
      }

      nextRound();
      setCurrentShape(null);
    }, config.shapeSpeed);
  }, [phase, gameState.currentRound, totalRounds, generateShape, responded, reactionTime, recordResponse, config.shapeSpeed, nextRound]);

  // Start beep counter
  const startBeeping = useCallback(() => {
    const scheduleBeep = () => {
      if (gameState.status !== 'playing' || phase !== 'playing') return;

      const randomDelay = config.countingInterval + (Math.random() - 0.5) * 500;
      beepTimerRef.current = setTimeout(() => {
        setBeepCount(c => c + 1);
        // Visual flash instead of audio
        scheduleBeep();
      }, randomDelay);
    };
    scheduleBeep();
  }, [config.countingInterval, gameState.status, phase]);

  useEffect(() => {
    if (gameState.status === 'playing' && phase === 'playing' && currentShape === null && gameState.currentRound >= 1) {
      showNextShape();
    }
  }, [gameState.status, phase, currentShape, gameState.currentRound, showNextShape]);

  const handleShapeClick = useCallback(() => {
    if (responded || !currentShape || phase !== 'playing') return;

    setResponded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    const rt = reactionTime.stop();

    if (currentShape.isTarget) {
      setFeedback('correct');
      recordResponse(true, rt);
    } else {
      setFeedback('wrong');
      recordResponse(false, rt);
    }

    setTimeout(() => {
      nextRound();
      setCurrentShape(null);
    }, 300);
  }, [responded, currentShape, phase, reactionTime, recordResponse, nextRound]);

  const handleCountSubmit = () => {
    const isCorrect = Math.abs(userBeepCount - beepCount) <= 2;
    if (isCorrect) {
      recordResponse(true, 0);
    }
    completeGame();
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    setBeepCount(0);
    setPhase('playing');
    startBeeping();
    showNextShape();
  };
  const handleRestart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (beepTimerRef.current) clearTimeout(beepTimerRef.current);
    resetGame();
    setCurrentShape(null);
    setBeepCount(0);
    setUserBeepCount(0);
    setPhase('playing');
    showInstructions();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (beepTimerRef.current) clearTimeout(beepTimerRef.current);
    };
  }, []);

  const renderShape = (shape: string, color: string, size: number) => {
    const style = { backgroundColor: color };

    switch (shape) {
      case 'circle':
        return <div className="rounded-full" style={{ ...style, width: size, height: size }} />;
      case 'square':
        return <div className="rounded-md" style={{ ...style, width: size, height: size }} />;
      case 'triangle':
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${size/2}px solid transparent`,
              borderRight: `${size/2}px solid transparent`,
              borderBottom: `${size}px solid ${color}`,
            }}
          />
        );
      case 'diamond':
        return (
          <div
            className="rotate-45 rounded-sm"
            style={{ ...style, width: size * 0.7, height: size * 0.7 }}
          />
        );
      default:
        return <div className="rounded-full" style={{ ...style, width: size, height: size }} />;
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
      onExit={() => onExit?.()}
      onCountdownComplete={handleCountdownComplete}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
    >
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        {phase === 'playing' && (
          <>
            {/* Target Reference */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-gray-400 text-sm">Click on:</span>
              <div className="w-8 h-8 flex items-center justify-center">
                {renderShape(config.targetShape, '#F59E0B', 24)}
              </div>
              <span className="text-warning-400 text-sm capitalize">{config.targetShape}s</span>
            </div>

            {/* Game Area */}
            <div
              className="relative w-80 h-80 bg-navy-700 rounded-2xl border-2 border-navy-600 overflow-hidden"
              onClick={handleShapeClick}
            >
              {currentShape && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className={cn(
                    'absolute cursor-pointer',
                    feedback === 'correct' && 'ring-4 ring-success-500',
                    feedback === 'wrong' && 'ring-4 ring-error-500',
                    feedback === 'missed' && 'ring-4 ring-warning-500'
                  )}
                  style={{
                    left: `${currentShape.x}%`,
                    top: `${currentShape.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {renderShape(currentShape.shape, currentShape.color, 50)}
                </motion.div>
              )}
            </div>

            {/* Beep Counter Visual */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-gray-500 text-sm">Counting beeps...</span>
              <motion.div
                key={beepCount}
                initial={{ scale: 1.5, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-4 h-4 rounded-full bg-attention"
              />
            </div>
          </>
        )}

        {phase === 'counting' && (
          <div className="text-center">
            <h3 className="text-xl text-white font-bold mb-4">How many beeps did you count?</h3>
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.button
                onClick={() => setUserBeepCount(Math.max(0, userBeepCount - 1))}
                className="w-12 h-12 bg-navy-700 rounded-xl text-white text-2xl font-bold"
                whileTap={{ scale: 0.95 }}
              >
                -
              </motion.button>
              <div className="text-4xl font-bold text-electric-400 w-20 text-center">
                {userBeepCount}
              </div>
              <motion.button
                onClick={() => setUserBeepCount(userBeepCount + 1)}
                className="w-12 h-12 bg-navy-700 rounded-xl text-white text-2xl font-bold"
                whileTap={{ scale: 0.95 }}
              >
                +
              </motion.button>
            </div>
            <motion.button
              onClick={handleCountSubmit}
              className="px-8 py-3 bg-electric-500 text-white rounded-xl font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit
            </motion.button>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
