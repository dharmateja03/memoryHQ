'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Crown, Copy, Check, ArrowLeft, Play, Trophy,
  Target, Medal, Loader2
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { useRoom, getRoomState } from '@/lib/multiplayer/useRoom';
import { GAMES } from '@/lib/utils/games';
import { MultiplayerGameWrapper } from '@/components/multiplayer/MultiplayerGameWrapper';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const roomCode = params.code as string;

  const { roomState, countdown, rankings, error, isConnected, actions } = useRoom(roomCode);
  const [hasJoined, setHasJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);

  // Check if room exists on mount
  useEffect(() => {
    getRoomState(roomCode).then(state => {
      setRoomExists(state !== null);
    });
  }, [roomCode]);

  // Auto-join when connected
  useEffect(() => {
    if (isConnected && session?.user && !hasJoined && roomState) {
      const playerName = session.user.name || 'Player';
      actions.join(playerName);
      setHasJoined(true);
    }
  }, [isConnected, session, hasJoined, roomState, actions]);

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    actions.leave();
    router.push('/multiplayer');
  };

  const handleReady = () => {
    actions.ready();
  };

  const handleStart = () => {
    actions.start();
  };

  const handlePlayAgain = () => {
    router.push('/multiplayer');
  };

  // Room not found
  if (roomExists === false) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Room Not Found</h1>
        <p className="text-gray-400 mb-6">
          The room code &quot;{roomCode}&quot; doesn&apos;t exist or has expired.
        </p>
        <Button onClick={() => router.push('/multiplayer')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Multiplayer
        </Button>
      </div>
    );
  }

  // Loading
  if (!roomState || roomExists === null) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-electric-500 mx-auto mb-4" />
        <p className="text-gray-400">Connecting to room...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-error-500/10 border border-error-500/50 text-error-400 px-6 py-4 rounded-xl mb-6">
          {error}
        </div>
        <Button onClick={() => router.push('/multiplayer')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Multiplayer
        </Button>
      </div>
    );
  }

  const players = Object.values(roomState.players);
  const isHost = session?.user?.id === roomState.hostId;
  const currentPlayer = session?.user ? roomState.players[session.user.id] : null;
  const allReady = players.every(p => p.isReady || p.id === roomState.hostId);
  const gameConfig = GAMES.find(g => g.id === roomState.gameId);

  // Game is in progress - show multiplayer game wrapper
  if (roomState.status === 'playing' && gameConfig) {
    return (
      <MultiplayerGameWrapper
        gameConfig={gameConfig}
        roomState={roomState}
        onScoreUpdate={actions.updateScore}
        onFinish={actions.finishGame}
        onLeave={handleLeave}
      />
    );
  }

  // Countdown
  if (roomState.status === 'countdown' && countdown !== null) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          className="text-9xl font-bold text-electric-500 mb-8"
        >
          {countdown}
        </motion.div>
        <p className="text-xl text-gray-400">Get ready!</p>
        <p className="text-gray-500 mt-2">Playing: {roomState.gameName}</p>
      </div>
    );
  }

  // Game finished - show rankings
  if (roomState.status === 'finished' && rankings) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-warning-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Game Over!</h1>
          <p className="text-gray-400">{roomState.gameName}</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-warning-500" />
              Final Rankings
            </h2>

            <div className="space-y-3">
              {rankings.map((player, index) => (
                <motion.div
                  key={player.playerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    index === 0
                      ? 'bg-warning-500/10 border border-warning-500/30'
                      : 'bg-navy-700/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-warning-500 text-navy-900' :
                    index === 1 ? 'bg-gray-400 text-navy-900' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-navy-600 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-white flex items-center gap-2">
                      {player.name}
                      {index === 0 && <Crown className="w-4 h-4 text-warning-500" />}
                    </div>
                    <div className="text-sm text-gray-400">
                      {Math.round(player.time / 1000)}s • {player.accuracy}% accuracy
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-white">{player.score}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleLeave} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave Room
          </Button>
          <Button onClick={handlePlayAgain} className="flex-1">
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  // Waiting lobby
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={handleLeave}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Leave
        </Button>

        <button
          onClick={copyRoomCode}
          className="flex items-center gap-2 px-4 py-2 bg-navy-700 hover:bg-navy-600 rounded-xl transition-colors"
        >
          <span className="font-mono text-lg text-electric-400">{roomCode}</span>
          {copied ? (
            <Check className="w-4 h-4 text-success-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Room Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{roomState.roomName}</h1>
              <p className="text-gray-400 mt-1">
                Playing: <span className="text-electric-400">{roomState.gameName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span>{players.length}/{roomState.maxPlayers}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-navy-700/50 rounded-xl p-4 text-sm text-gray-300">
            <p className="mb-2">
              <strong className="text-white">How to play:</strong>
            </p>
            <p>{gameConfig?.instructions || 'Instructions not available'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Players */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-electric-500" />
            Players
          </h2>

          <div className="space-y-3">
            <AnimatePresence>
              {players.map(player => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-4 p-3 bg-navy-700/50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-full bg-electric-500/20 flex items-center justify-center">
                    <span className="text-electric-400 font-medium">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-white flex items-center gap-2">
                      {player.name}
                      {player.id === roomState.hostId && (
                        <Crown className="w-4 h-4 text-warning-500" />
                      )}
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    player.isReady || player.id === roomState.hostId
                      ? 'bg-success-500/20 text-success-400'
                      : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {player.id === roomState.hostId ? 'Host' : player.isReady ? 'Ready' : 'Not Ready'}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty slots */}
            {Array.from({ length: roomState.maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-4 p-3 border-2 border-dashed border-navy-600 rounded-xl"
              >
                <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center">
                  <span className="text-gray-600">?</span>
                </div>
                <span className="text-gray-500">Waiting for player...</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {isHost ? (
          <Button
            onClick={handleStart}
            disabled={players.length < 2 || !allReady}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            {players.length < 2
              ? 'Need 2+ Players'
              : !allReady
              ? 'Waiting for Players'
              : 'Start Game'}
          </Button>
        ) : (
          <Button
            onClick={handleReady}
            disabled={currentPlayer?.isReady}
            className="flex-1"
          >
            {currentPlayer?.isReady ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Ready!
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Ready Up
              </>
            )}
          </Button>
        )}
      </div>

      {/* Share tip */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Share the room code with friends to invite them!</p>
      </div>
    </div>
  );
}
