'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Home, Volume2, VolumeX } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui';
import type { GameState, CognitiveDomain } from '@/types';
import { GameInstructions } from './GameInstructions';
import { GameCountdown } from './GameCountdown';
import { GameResults } from './GameResults';
import { useProgressStore } from '@/lib/stores/progressStore';

interface GameWrapperProps {
  gameState: GameState;
  gameConfig: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    domain: CognitiveDomain | string;
  };
  children: ReactNode;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
  onStartPractice?: () => void;
  onCountdownComplete: () => void;
  showTimer?: boolean;
  timeRemaining?: number;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  practiceAvailable?: boolean;
}

export function GameWrapper({
  gameState,
  gameConfig,
  children,
  onStart,
  onPause,
  onResume,
  onRestart,
  onExit,
  onStartPractice,
  onCountdownComplete,
  showTimer = false,
  timeRemaining,
  soundEnabled = true,
  onToggleSound,
  practiceAvailable = true,
}: GameWrapperProps) {
  const { data: session } = useSession();
  const { recordGameResult, markTodayGameComplete } = useProgressStore();
  const hasRecordedRef = useRef(false);

  // Record game result when game is complete
  useEffect(() => {
    if (gameState.status === 'complete' && !hasRecordedRef.current) {
      hasRecordedRef.current = true;

      // Calculate correct answers based on accuracy and total rounds
      const correctAnswers = Math.round((gameState.accuracy / 100) * gameState.totalRounds);

      const result = {
        gameId: gameConfig.id,
        gameName: gameConfig.name,
        domain: gameConfig.domain as CognitiveDomain,
        score: Math.floor(gameState.score),
        accuracy: Math.round(gameState.accuracy),
        difficulty: gameState.difficulty,
        completedAt: new Date().toISOString(),
        correctAnswers,
        totalRounds: gameState.totalRounds,
      };

      // Save to local storage
      recordGameResult(result);
      markTodayGameComplete(gameConfig.id, { ...result, id: '' });

      // Save to database if user is logged in
      if (session?.user) {
        fetch('/api/games/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
        }).catch(console.error);
      }
    }
  }, [gameState.status, gameState.score, gameState.accuracy, gameState.difficulty, gameState.totalRounds, gameConfig.id, gameConfig.name, gameConfig.domain, recordGameResult, markTodayGameComplete, session]);

  // Reset the recorded flag when game restarts
  useEffect(() => {
    if (gameState.status === 'instructions' || gameState.status === 'countdown') {
      hasRecordedRef.current = false;
    }
  }, [gameState.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Game Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{gameConfig.name}</h1>
          <p className="text-sm text-gray-400">Level {gameState.difficulty}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          {showTimer && timeRemaining !== undefined && gameState.status === 'playing' && (
            <div className="px-4 py-2 bg-navy-700 rounded-lg">
              <span className="text-lg font-mono text-white">{formatTime(timeRemaining)}</span>
            </div>
          )}

          {/* Score */}
          {gameState.status === 'playing' && (
            <div className="px-4 py-2 bg-navy-700 rounded-lg">
              <span className="text-sm text-gray-400">Score: </span>
              <span className="text-lg font-bold text-white">{Math.floor(gameState.score)}</span>
            </div>
          )}

          {/* Streak */}
          {gameState.streak > 0 && gameState.status === 'playing' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-2 bg-warning-500/20 rounded-lg flex items-center gap-1"
            >
              <span className="text-warning-400 font-bold">{gameState.streak}x</span>
            </motion.div>
          )}

          {/* Sound Toggle */}
          {onToggleSound && (
            <Button variant="ghost" size="sm" onClick={onToggleSound}>
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </Button>
          )}

          {/* Pause/Resume */}
          {gameState.status === 'playing' && (
            <Button variant="ghost" size="sm" onClick={onPause}>
              <Pause className="w-5 h-5" />
            </Button>
          )}

          {/* Exit */}
          <Button variant="ghost" size="sm" onClick={onExit}>
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {gameState.status === 'playing' && gameState.totalRounds > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Round {gameState.currentRound} of {gameState.totalRounds}</span>
            <span>{Math.round(gameState.accuracy)}% accuracy</span>
          </div>
          <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-electric-500"
              initial={{ width: 0 }}
              animate={{ width: `${(gameState.currentRound / gameState.totalRounds) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Game Content */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {/* Instructions */}
          {gameState.status === 'instructions' && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameInstructions
                title={gameConfig.name}
                description={gameConfig.description}
                instructions={gameConfig.instructions}
                difficulty={gameState.difficulty}
                onStart={onStart}
                onPractice={practiceAvailable ? onStartPractice : undefined}
              />
            </motion.div>
          )}

          {/* Countdown */}
          {gameState.status === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameCountdown onComplete={onCountdownComplete} />
            </motion.div>
          )}

          {/* Playing */}
          {(gameState.status === 'playing' || gameState.status === 'practice') && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {children}
            </motion.div>
          )}

          {/* Paused */}
          {gameState.status === 'paused' && (
            <motion.div
              key="paused"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm rounded-2xl"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-6">Game Paused</h2>
                <div className="flex items-center gap-4">
                  <Button variant="secondary" onClick={onExit} icon={<Home className="w-4 h-4" />}>
                    Exit
                  </Button>
                  <Button onClick={onResume} icon={<Play className="w-4 h-4" />}>
                    Resume
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Complete */}
          {gameState.status === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameResults
                gameName={gameConfig.name}
                score={Math.floor(gameState.score)}
                accuracy={gameState.accuracy}
                averageReactionTime={
                  gameState.reactionTimes.length > 0
                    ? gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length
                    : undefined
                }
                roundsCompleted={gameState.currentRound}
                totalRounds={gameState.totalRounds}
                bestStreak={gameState.bestStreak}
                difficulty={gameState.difficulty}
                onPlayAgain={onRestart}
                onExit={() => onExit?.()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
