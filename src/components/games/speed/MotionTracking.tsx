'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface MotionTrackingProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { targetCount: 2, totalObjects: 4, speed: 1, duration: 8000 },
  2: { targetCount: 2, totalObjects: 5, speed: 1.2, duration: 10000 },
  3: { targetCount: 3, totalObjects: 6, speed: 1.3, duration: 10000 },
  4: { targetCount: 3, totalObjects: 7, speed: 1.5, duration: 12000 },
  5: { targetCount: 4, totalObjects: 8, speed: 1.6, duration: 12000 },
  6: { targetCount: 4, totalObjects: 9, speed: 1.8, duration: 14000 },
  7: { targetCount: 5, totalObjects: 10, speed: 2, duration: 14000 },
  8: { targetCount: 5, totalObjects: 11, speed: 2.2, duration: 15000 },
  9: { targetCount: 6, totalObjects: 12, speed: 2.4, duration: 15000 },
  10: { targetCount: 6, totalObjects: 13, speed: 2.6, duration: 16000 },
};

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isTarget: boolean;
}

const gameConfig = {
  id: 'motion-tracking',
  name: 'Motion Tracking',
  description: 'Track multiple moving targets among distractors.',
  instructions: 'Some balls will flash - those are your targets. Track them as they move. When they stop, click on all the targets you tracked!',
  domain: 'speed',
};

export function MotionTracking({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: MotionTrackingProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 6;

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

  const [balls, setBalls] = useState<Ball[]>([]);
  const [phase, setPhase] = useState<'showing' | 'tracking' | 'selecting' | 'feedback'>('showing');
  const [selectedBalls, setSelectedBalls] = useState<Set<number>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const initializeBalls = useCallback(() => {
    const newBalls: Ball[] = [];
    const containerSize = 280;
    const ballSize = 32;
    const margin = ballSize;

    for (let i = 0; i < config.totalObjects; i++) {
      let x: number, y: number;
      let attempts = 0;
      do {
        x = margin + Math.random() * (containerSize - 2 * margin);
        y = margin + Math.random() * (containerSize - 2 * margin);
        attempts++;
      } while (
        attempts < 100 &&
        newBalls.some(b => Math.hypot(b.x - x, b.y - y) < ballSize * 1.5)
      );

      const angle = Math.random() * Math.PI * 2;
      const speed = config.speed * (0.8 + Math.random() * 0.4);

      newBalls.push({
        id: i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        isTarget: i < config.targetCount
      });
    }

    return newBalls.sort(() => Math.random() - 0.5);
  }, [config.totalObjects, config.targetCount, config.speed]);

  const startRound = useCallback(() => {
    const newBalls = initializeBalls();
    setBalls(newBalls);
    setSelectedBalls(new Set());
    setPhase('showing');

    // Show targets for 2 seconds
    setTimeout(() => {
      setPhase('tracking');

      // Start movement
      const startTime = Date.now();
      const containerSize = 280;
      const ballSize = 32;

      const animate = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed >= config.duration) {
          setPhase('selecting');
          return;
        }

        setBalls(prevBalls => {
          return prevBalls.map(ball => {
            let newX = ball.x + ball.vx;
            let newY = ball.y + ball.vy;
            let newVx = ball.vx;
            let newVy = ball.vy;

            // Bounce off walls
            if (newX < ballSize / 2 || newX > containerSize - ballSize / 2) {
              newVx = -newVx;
              newX = Math.max(ballSize / 2, Math.min(containerSize - ballSize / 2, newX));
            }
            if (newY < ballSize / 2 || newY > containerSize - ballSize / 2) {
              newVy = -newVy;
              newY = Math.max(ballSize / 2, Math.min(containerSize - ballSize / 2, newY));
            }

            return { ...ball, x: newX, y: newY, vx: newVx, vy: newVy };
          });
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    }, 2000);
  }, [initializeBalls, config.duration]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && balls.length === 0) {
      startRound();
    }
  }, [gameState.status, gameState.currentRound, balls.length, startRound]);

  const handleBallClick = (ballId: number) => {
    if (phase !== 'selecting') return;

    setSelectedBalls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ballId)) {
        newSet.delete(ballId);
      } else if (newSet.size < config.targetCount) {
        newSet.add(ballId);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    if (phase !== 'selecting') return;

    setPhase('feedback');

    const correctTargets = balls.filter(b => b.isTarget).map(b => b.id);
    const selectedArray = Array.from(selectedBalls);
    const correctCount = selectedArray.filter(id => correctTargets.includes(id)).length;
    const accuracy = correctCount / config.targetCount;

    recordResponse(accuracy >= 0.8, 0);

    setTimeout(() => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setBalls([]);
      }
    }, 2000);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    startRound();
  };
  const handleRestart = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    resetGame();
    setBalls([]);
    setPhase('showing');
    showInstructions();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
        {/* Phase indicator */}
        <div className="mb-4">
          <span className={cn(
            'px-4 py-2 rounded-xl text-sm font-bold',
            phase === 'showing' && 'bg-speed/20 text-speed',
            phase === 'tracking' && 'bg-electric-500/20 text-electric-400',
            phase === 'selecting' && 'bg-attention/20 text-attention',
            phase === 'feedback' && 'bg-success-500/20 text-success-400'
          )}>
            {phase === 'showing' && `Remember these ${config.targetCount} targets!`}
            {phase === 'tracking' && 'Track the targets!'}
            {phase === 'selecting' && `Select ${config.targetCount} targets`}
            {phase === 'feedback' && 'Results'}
          </span>
        </div>

        {/* Game Area */}
        <div
          ref={containerRef}
          className="relative w-72 h-72 bg-navy-700 rounded-2xl border-2 border-navy-600 overflow-hidden"
        >
          {balls.map((ball) => {
            const isSelected = selectedBalls.has(ball.id);
            const showAsTarget = phase === 'showing' || phase === 'feedback';

            return (
              <motion.div
                key={ball.id}
                className={cn(
                  'absolute w-8 h-8 rounded-full cursor-pointer transition-all',
                  showAsTarget && ball.isTarget && 'bg-speed ring-4 ring-speed/50',
                  showAsTarget && !ball.isTarget && 'bg-gray-500',
                  !showAsTarget && !isSelected && 'bg-white',
                  !showAsTarget && isSelected && 'bg-electric-500 ring-4 ring-electric-500/50',
                  phase === 'feedback' && isSelected && ball.isTarget && 'bg-success-500 ring-4 ring-success-500/50',
                  phase === 'feedback' && isSelected && !ball.isTarget && 'bg-error-500 ring-4 ring-error-500/50',
                  phase === 'feedback' && !isSelected && ball.isTarget && 'bg-warning-500 ring-4 ring-warning-500/50'
                )}
                style={{
                  left: ball.x - 16,
                  top: ball.y - 16,
                }}
                onClick={() => handleBallClick(ball.id)}
                whileHover={phase === 'selecting' ? { scale: 1.2 } : undefined}
                whileTap={phase === 'selecting' ? { scale: 0.9 } : undefined}
              />
            );
          })}
        </div>

        {/* Submit Button */}
        {phase === 'selecting' && (
          <motion.button
            onClick={handleSubmit}
            disabled={selectedBalls.size !== config.targetCount}
            className={cn(
              'mt-6 px-8 py-3 rounded-xl font-bold transition-colors',
              selectedBalls.size === config.targetCount
                ? 'bg-electric-500 text-white hover:bg-electric-400'
                : 'bg-navy-700 text-gray-600 cursor-not-allowed'
            )}
            whileHover={selectedBalls.size === config.targetCount ? { scale: 1.05 } : undefined}
            whileTap={selectedBalls.size === config.targetCount ? { scale: 0.95 } : undefined}
          >
            Submit ({selectedBalls.size}/{config.targetCount})
          </motion.button>
        )}

        {/* Feedback */}
        {phase === 'feedback' && (
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-400">
              <span className="text-success-400 font-bold">
                {Array.from(selectedBalls).filter(id => balls.find(b => b.id === id)?.isTarget).length}
              </span>
              {' / '}
              {config.targetCount} correct
            </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
