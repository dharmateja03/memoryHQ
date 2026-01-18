'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, ArrowLeft, Clock } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import type { GameConfig } from '@/types';

// Import game components
import { NumberSeries } from '@/components/games/problem-solving/NumberSeries';
import { TowerOfHanoi } from '@/components/games/problem-solving/TowerOfHanoi';
import { MemoryMatrix } from '@/components/games/memory/MemoryMatrix';
import { StroopTest } from '@/components/games/attention/StroopTest';
import { NQueens } from '@/components/games/problem-solving/NQueens';

interface Player {
  id: string;
  name: string;
  score: number;
  accuracy: number;
  isReady: boolean;
  isFinished: boolean;
  finishTime?: number;
}

interface RoomState {
  roomName: string;
  roomCode: string;
  hostId: string;
  gameId: string;
  gameName: string;
  difficulty: number;
  maxPlayers: number;
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  players: Record<string, Player>;
  startTime?: number;
}

interface MultiplayerGameWrapperProps {
  gameConfig: GameConfig;
  roomState: RoomState;
  onScoreUpdate: (score: number, accuracy: number) => void;
  onFinish: (score: number, accuracy: number) => void;
  onLeave: () => void;
}

// Game component map
const GAME_COMPONENTS: Record<string, React.ComponentType<{
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
  onScoreChange?: (score: number, accuracy: number) => void;
}>> = {
  'number-series': NumberSeries,
  'tower-of-hanoi': TowerOfHanoi,
  'memory-matrix': MemoryMatrix,
  'stroop-test': StroopTest,
  'n-queens': NQueens,
};

export function MultiplayerGameWrapper({
  gameConfig,
  roomState,
  onScoreUpdate,
  onFinish,
  onLeave,
}: MultiplayerGameWrapperProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const lastScoreRef = useRef({ score: 0, accuracy: 0 });

  // Update elapsed time
  useEffect(() => {
    if (roomState.status !== 'playing') return;

    const interval = setInterval(() => {
      if (roomState.startTime) {
        setElapsedTime(Math.floor((Date.now() - roomState.startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomState.status, roomState.startTime]);

  // Handle score updates from game
  const handleScoreChange = useCallback((score: number, accuracy: number) => {
    // Only send update if score changed
    if (score !== lastScoreRef.current.score || accuracy !== lastScoreRef.current.accuracy) {
      lastScoreRef.current = { score, accuracy };
      onScoreUpdate(score, accuracy);
    }
  }, [onScoreUpdate]);

  // Handle game completion
  const handleComplete = useCallback((result: { score: number; accuracy: number }) => {
    onFinish(result.score, result.accuracy);
  }, [onFinish]);

  // Get sorted players for leaderboard
  const sortedPlayers = Object.values(roomState.players)
    .sort((a, b) => b.score - a.score);

  const GameComponent = GAME_COMPONENTS[gameConfig.id];

  if (!GameComponent) {
    return (
      <div className="text-center py-12">
        <p className="text-error-400">Game component not found for: {gameConfig.id}</p>
        <Button variant="secondary" onClick={onLeave} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Leave Room
        </Button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {/* Floating Leaderboard Toggle */}
      <button
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        className="fixed top-20 right-4 z-50 p-3 bg-navy-700 hover:bg-navy-600 rounded-xl border border-navy-600 transition-colors"
      >
        <Users className="w-5 h-5 text-electric-400" />
      </button>

      {/* Floating Timer */}
      <div className="fixed top-20 left-4 z-50 px-4 py-2 bg-navy-700 rounded-xl border border-navy-600 flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="font-mono text-white">{formatTime(elapsedTime)}</span>
      </div>

      {/* Live Leaderboard */}
      {showLeaderboard && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-36 right-4 z-40 w-64"
        >
          <Card className="bg-navy-800/95 backdrop-blur-sm border-navy-600">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-warning-500" />
                Live Scores
              </h3>
              <div className="space-y-2">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      index === 0 ? 'bg-warning-500/10' : 'bg-navy-700/50'
                    }`}
                  >
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-warning-500 text-navy-900' :
                      index === 1 ? 'bg-gray-400 text-navy-900' :
                      index === 2 ? 'bg-amber-700 text-white' :
                      'bg-navy-600 text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {player.name}
                      </div>
                      {player.isFinished && (
                        <div className="text-xs text-success-400">Finished!</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{player.score}</div>
                      <div className="text-xs text-gray-500">{player.accuracy}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Game Content */}
      <div className="pr-0 lg:pr-72">
        <GameComponent
          difficulty={roomState.difficulty}
          onComplete={handleComplete}
          onExit={onLeave}
          onScoreChange={handleScoreChange}
        />
      </div>
    </div>
  );
}
