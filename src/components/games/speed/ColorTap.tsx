'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { useReactionTime } from '@/lib/hooks/useTimer';
import { GameWrapper } from '../GameWrapper';

interface ColorTapProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { targetColor: '#10B981', speed: 2000, spawnRate: 1500 },
  2: { targetColor: '#10B981', speed: 1800, spawnRate: 1300 },
  3: { targetColor: '#10B981', speed: 1600, spawnRate: 1200 },
  4: { targetColor: '#10B981', speed: 1400, spawnRate: 1100 },
  5: { targetColor: '#10B981', speed: 1200, spawnRate: 1000 },
  6: { targetColor: '#10B981', speed: 1100, spawnRate: 900 },
  7: { targetColor: '#10B981', speed: 1000, spawnRate: 800 },
  8: { targetColor: '#10B981', speed: 900, spawnRate: 700 },
  9: { targetColor: '#10B981', speed: 800, spawnRate: 600 },
  10: { targetColor: '#10B981', speed: 700, spawnRate: 500 },
};

const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B'];

interface Bubble {
  id: number;
  x: number;
  y: number;
  color: string;
  isTarget: boolean;
}

const gameConfig = {
  id: 'color-tap',
  name: 'Color Tap',
  description: 'Tap only the green bubbles as fast as you can.',
  instructions: 'Bubbles will appear and disappear quickly. Tap ONLY the GREEN bubbles. Avoid tapping other colors! Speed is key.',
  domain: 'speed',
};

export function ColorTap({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: ColorTapProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalTargets = 30;

  const {
    state: gameState,
    showInstructions,
    startCountdown,
    startGame,
    pauseGame,
    resumeGame,
    completeGame,
    recordResponse,
    resetGame,
    setDifficulty,
  } = useGameState(totalTargets, difficulty);

  const reactionTime = useReactionTime();

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [stats, setStats] = useState({ tapped: 0, missed: 0, wrong: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const bubbleIdRef = useRef(0);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const targetsSpawnedRef = useRef(0);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const spawnBubble = useCallback(() => {
    if (targetsSpawnedRef.current >= totalTargets) {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      // Wait for remaining bubbles to clear
      setTimeout(() => {
        completeGame();
      }, config.speed + 500);
      return;
    }

    const isTarget = Math.random() < 0.6;
    const color = isTarget ? config.targetColor : COLORS.filter(c => c !== config.targetColor)[Math.floor(Math.random() * 3)];

    if (isTarget) {
      targetsSpawnedRef.current++;
    }

    const bubble: Bubble = {
      id: ++bubbleIdRef.current,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      color,
      isTarget
    };

    setBubbles(prev => [...prev, bubble]);

    // Remove bubble after duration
    setTimeout(() => {
      setBubbles(prev => {
        const remaining = prev.filter(b => b.id !== bubble.id);
        if (prev.find(b => b.id === bubble.id && b.isTarget)) {
          setStats(s => ({ ...s, missed: s.missed + 1 }));
          recordResponse(false, config.speed);
        }
        return remaining;
      });
    }, config.speed);

    // Schedule next bubble
    if (targetsSpawnedRef.current < totalTargets) {
      spawnTimerRef.current = setTimeout(spawnBubble, config.spawnRate);
    }
  }, [config.targetColor, config.speed, config.spawnRate, totalTargets, completeGame, recordResponse]);

  const handleBubbleTap = (bubble: Bubble) => {
    if (gameState.status !== 'playing') return;

    setBubbles(prev => prev.filter(b => b.id !== bubble.id));

    if (bubble.isTarget) {
      const rt = Date.now() % 10000; // Approximate RT
      setStats(s => ({ ...s, tapped: s.tapped + 1 }));
      recordResponse(true, rt);
    } else {
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      recordResponse(false, 0);
    }
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    setStats({ tapped: 0, missed: 0, wrong: 0 });
    targetsSpawnedRef.current = 0;
    reactionTime.start();
    spawnBubble();
  };
  const handleRestart = () => {
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    resetGame();
    setBubbles([]);
    setStats({ tapped: 0, missed: 0, wrong: 0 });
    targetsSpawnedRef.current = 0;
    showInstructions();
  };

  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
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
        {/* Target indicator */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-gray-400 text-sm">Tap only:</span>
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: config.targetColor }}
          />
          <span className="text-speed text-sm font-bold">GREEN</span>
        </div>

        {/* Game Area */}
        <div className="relative w-80 h-80 bg-navy-700 rounded-2xl border-2 border-navy-600 overflow-hidden">
          {bubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute cursor-pointer"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleBubbleTap(bubble)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.8 }}
            >
              <div
                className="w-12 h-12 rounded-full shadow-lg"
                style={{ backgroundColor: bubble.color }}
              />
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-6 flex gap-6 text-sm">
          <div className="text-center">
            <div className="text-success-400 font-bold text-lg">{stats.tapped}</div>
            <div className="text-gray-500">Tapped</div>
          </div>
          <div className="text-center">
            <div className="text-error-400 font-bold text-lg">{stats.missed}</div>
            <div className="text-gray-500">Missed</div>
          </div>
          <div className="text-center">
            <div className="text-warning-400 font-bold text-lg">{stats.wrong}</div>
            <div className="text-gray-500">Wrong</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 text-xs text-gray-600">
          Targets: {stats.tapped + stats.missed} / {totalTargets}
        </div>
      </div>
    </GameWrapper>
  );
}
