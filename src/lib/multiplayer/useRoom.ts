'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PartySocket from 'partysocket';

// Types matching the server
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

interface Ranking {
  playerId: string;
  name: string;
  score: number;
  accuracy: number;
  time: number;
}

type ServerMessage =
  | { type: 'room-state'; state: RoomState }
  | { type: 'player-joined'; player: Player }
  | { type: 'player-left'; playerId: string }
  | { type: 'player-ready'; playerId: string }
  | { type: 'countdown'; seconds: number }
  | { type: 'game-start' }
  | { type: 'score-update'; playerId: string; score: number; accuracy: number }
  | { type: 'player-finished'; playerId: string; score: number; accuracy: number; time: number }
  | { type: 'game-over'; rankings: Ranking[] }
  | { type: 'error'; message: string };

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

export function useRoom(roomCode: string | null) {
  const [socket, setSocket] = useState<PartySocket | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [rankings, setRankings] = useState<Ranking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);

  // Connect to room
  useEffect(() => {
    if (!roomCode) return;

    const ws = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomCode,
    });

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setError('Connection error');
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as ServerMessage;
      handleMessage(msg);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'room-state':
        setRoomState(msg.state);
        break;

      case 'player-joined':
        setRoomState(prev => prev ? {
          ...prev,
          players: { ...prev.players, [msg.player.id]: msg.player },
        } : null);
        break;

      case 'player-left':
        setRoomState(prev => {
          if (!prev) return null;
          const { [msg.playerId]: _, ...rest } = prev.players;
          return { ...prev, players: rest };
        });
        break;

      case 'player-ready':
        setRoomState(prev => prev ? {
          ...prev,
          players: {
            ...prev.players,
            [msg.playerId]: { ...prev.players[msg.playerId], isReady: true },
          },
        } : null);
        break;

      case 'countdown':
        setCountdown(msg.seconds);
        break;

      case 'game-start':
        setCountdown(null);
        setRoomState(prev => prev ? { ...prev, status: 'playing' } : null);
        break;

      case 'score-update':
        setRoomState(prev => prev ? {
          ...prev,
          players: {
            ...prev.players,
            [msg.playerId]: {
              ...prev.players[msg.playerId],
              score: msg.score,
              accuracy: msg.accuracy,
            },
          },
        } : null);
        break;

      case 'player-finished':
        setRoomState(prev => prev ? {
          ...prev,
          players: {
            ...prev.players,
            [msg.playerId]: {
              ...prev.players[msg.playerId],
              score: msg.score,
              accuracy: msg.accuracy,
              isFinished: true,
              finishTime: msg.time,
            },
          },
        } : null);
        break;

      case 'game-over':
        setRankings(msg.rankings);
        setRoomState(prev => prev ? { ...prev, status: 'finished' } : null);
        break;

      case 'error':
        setError(msg.message);
        break;
    }
  }, []);

  // Actions
  const join = useCallback((name: string) => {
    socket?.send(JSON.stringify({ type: 'join', name }));
  }, [socket]);

  const ready = useCallback(() => {
    socket?.send(JSON.stringify({ type: 'ready' }));
  }, [socket]);

  const start = useCallback(() => {
    socket?.send(JSON.stringify({ type: 'start' }));
  }, [socket]);

  const updateScore = useCallback((score: number, accuracy: number) => {
    socket?.send(JSON.stringify({ type: 'score-update', score, accuracy }));
  }, [socket]);

  const finishGame = useCallback((score: number, accuracy: number) => {
    socket?.send(JSON.stringify({ type: 'game-complete', score, accuracy }));
  }, [socket]);

  const leave = useCallback(() => {
    socket?.send(JSON.stringify({ type: 'leave' }));
    socket?.close();
  }, [socket]);

  return {
    roomState,
    countdown,
    rankings,
    error,
    isConnected,
    actions: {
      join,
      ready,
      start,
      updateScore,
      finishGame,
      leave,
    },
  };
}

// Create a new room
export async function createRoom(params: {
  roomName: string;
  roomCode: string;
  hostId: string;
  hostName: string;
  gameId: string;
  gameName: string;
  difficulty: number;
  maxPlayers: number;
}): Promise<RoomState> {
  const response = await fetch(
    `${window.location.protocol}//${PARTYKIT_HOST}/party/${params.roomCode}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create room');
  }

  return response.json();
}

// Check if room exists
export async function getRoomState(roomCode: string): Promise<RoomState | null> {
  try {
    const response = await fetch(
      `${window.location.protocol}//${PARTYKIT_HOST}/party/${roomCode}`
    );

    if (!response.ok) return null;

    return response.json();
  } catch {
    return null;
  }
}
