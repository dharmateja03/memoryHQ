'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Users, Swords, UserPlus, ArrowRight, Gamepad2, Crown, Loader2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { generateRoomName, generateRoomCode, isValidRoomCode } from '@/lib/multiplayer/roomNames';
import { createRoom } from '@/lib/multiplayer/useRoom';
import { GAMES } from '@/lib/utils/games';

const MULTIPLAYER_GAMES = GAMES.filter(g =>
  ['n-queens', 'tower-of-hanoi', 'memory-matrix', 'stroop-test', 'number-series'].includes(g.id)
);

export default function MultiplayerPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [joinCode, setJoinCode] = useState('');
  const [selectedGame, setSelectedGame] = useState(MULTIPLAYER_GAMES[0]);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!session?.user) {
      setError('Please login to create a room');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const roomName = generateRoomName();
      const roomCode = generateRoomCode();

      await createRoom({
        roomName,
        roomCode,
        hostId: session.user.id,
        hostName: session.user.name || 'Player',
        gameId: selectedGame.id,
        gameName: selectedGame.name,
        difficulty: 3,
        maxPlayers,
      });

      router.push(`/multiplayer/room/${roomCode}`);
    } catch {
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = () => {
    const code = joinCode.toUpperCase().trim();

    if (!isValidRoomCode(code)) {
      setError('Invalid room code format. Use format: XXXX-1234');
      return;
    }

    router.push(`/multiplayer/room/${code}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Multiplayer</h1>
        <p className="text-gray-400">Challenge friends and compete in real-time!</p>
      </div>

      {mode === 'menu' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* 1v1 Duel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              className="cursor-pointer hover:border-electric-500/50 transition-all group"
              onClick={() => { setMode('create'); setMaxPlayers(2); }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-electric-500/10 rounded-xl group-hover:scale-110 transition-transform">
                    <Swords className="w-8 h-8 text-electric-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">1v1 Duel</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Challenge a friend to a head-to-head brain battle. See who can score higher!
                    </p>
                    <div className="flex items-center gap-2 text-electric-400 text-sm">
                      <Users className="w-4 h-4" />
                      <span>2 players</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Room Battle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              className="cursor-pointer hover:border-warning-500/50 transition-all group"
              onClick={() => { setMode('create'); setMaxPlayers(8); }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-warning-500/10 rounded-xl group-hover:scale-110 transition-transform">
                    <Crown className="w-8 h-8 text-warning-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Room Battle</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Create a room for up to 8 players. Compete on a live leaderboard!
                    </p>
                    <div className="flex items-center gap-2 text-warning-400 text-sm">
                      <Users className="w-4 h-4" />
                      <span>2-8 players</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className="cursor-pointer hover:border-success-500/50 transition-all group"
              onClick={() => setMode('join')}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-success-500/10 rounded-xl group-hover:scale-110 transition-transform">
                    <UserPlus className="w-8 h-8 text-success-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Join Room</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Have a room code? Enter it to join your friends!
                    </p>
                    <div className="flex items-center gap-2 text-success-400 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      <span>Enter code to join</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Friends (Coming Soon) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="opacity-60 cursor-not-allowed">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-memory/10 rounded-xl">
                    <Users className="w-8 h-8 text-memory" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Friends List</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Add friends and challenge them directly. Coming soon!
                    </p>
                    <div className="inline-block px-2 py-1 bg-navy-700 rounded text-xs text-gray-400">
                      Coming Soon
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {mode === 'create' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-electric-500" />
                Create {maxPlayers === 2 ? '1v1 Duel' : 'Room Battle'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-error-500/10 border border-error-500/50 text-error-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Game Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Game
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MULTIPLAYER_GAMES.map(game => (
                    <button
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedGame.id === game.id
                          ? 'border-electric-500 bg-electric-500/10'
                          : 'border-navy-600 bg-navy-700/50 hover:border-navy-500'
                      }`}
                    >
                      <div className="text-sm font-medium text-white">{game.name}</div>
                      <div className="text-xs text-gray-500 mt-1 capitalize">{game.domain.replace('_', ' ')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Players (for Room Battle) */}
              {maxPlayers > 2 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Max Players: {maxPlayers}
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>2</span>
                    <span>8</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setMode('menu')}>
                  Back
                </Button>
                <Button onClick={handleCreateRoom} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Room
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {mode === 'join' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-success-500" />
                Join Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-error-500/10 border border-error-500/50 text-error-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-1234"
                  className="w-full bg-navy-700 border border-navy-600 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-transparent"
                  maxLength={9}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the room code shared by your friend
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setMode('menu')}>
                  Back
                </Button>
                <Button onClick={handleJoinRoom} className="flex-1">
                  Join Room
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
