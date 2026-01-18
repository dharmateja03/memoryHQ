import type * as Party from "partykit/server";

// Room state
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
  countdownStart?: number;
}

// Message types
type ClientMessage =
  | { type: 'join'; name: string }
  | { type: 'ready' }
  | { type: 'start' }
  | { type: 'score-update'; score: number; accuracy: number }
  | { type: 'game-complete'; score: number; accuracy: number }
  | { type: 'leave' };

type ServerMessage =
  | { type: 'room-state'; state: RoomState }
  | { type: 'player-joined'; player: Player }
  | { type: 'player-left'; playerId: string }
  | { type: 'player-ready'; playerId: string }
  | { type: 'countdown'; seconds: number }
  | { type: 'game-start' }
  | { type: 'score-update'; playerId: string; score: number; accuracy: number }
  | { type: 'player-finished'; playerId: string; score: number; accuracy: number; time: number }
  | { type: 'game-over'; rankings: { playerId: string; name: string; score: number; accuracy: number; time: number }[] }
  | { type: 'error'; message: string };

export default class GameRoom implements Party.Server {
  state: RoomState | null = null;

  constructor(public room: Party.Room) {}

  async onStart() {
    // Load persisted state if exists
    const stored = await this.room.storage.get<RoomState>("state");
    if (stored) {
      this.state = stored;
    }
  }

  async onConnect(conn: Party.Connection, _ctx: Party.ConnectionContext) {
    // Send current state to new connection
    if (this.state) {
      conn.send(JSON.stringify({ type: 'room-state', state: this.state } as ServerMessage));
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    const msg = JSON.parse(message) as ClientMessage;

    switch (msg.type) {
      case 'join':
        await this.handleJoin(sender, msg.name);
        break;
      case 'ready':
        await this.handleReady(sender);
        break;
      case 'start':
        await this.handleStart(sender);
        break;
      case 'score-update':
        await this.handleScoreUpdate(sender, msg.score, msg.accuracy);
        break;
      case 'game-complete':
        await this.handleGameComplete(sender, msg.score, msg.accuracy);
        break;
      case 'leave':
        await this.handleLeave(sender);
        break;
    }
  }

  async onClose(conn: Party.Connection) {
    await this.handleLeave(conn);
  }

  private async handleJoin(conn: Party.Connection, name: string) {
    if (!this.state) {
      conn.send(JSON.stringify({ type: 'error', message: 'Room not found' } as ServerMessage));
      return;
    }

    if (Object.keys(this.state.players).length >= this.state.maxPlayers) {
      conn.send(JSON.stringify({ type: 'error', message: 'Room is full' } as ServerMessage));
      return;
    }

    if (this.state.status !== 'waiting') {
      conn.send(JSON.stringify({ type: 'error', message: 'Game already in progress' } as ServerMessage));
      return;
    }

    const player: Player = {
      id: conn.id,
      name,
      score: 0,
      accuracy: 0,
      isReady: false,
      isFinished: false,
    };

    this.state.players[conn.id] = player;
    await this.saveState();

    // Broadcast to all
    this.room.broadcast(JSON.stringify({ type: 'player-joined', player } as ServerMessage));
    conn.send(JSON.stringify({ type: 'room-state', state: this.state } as ServerMessage));
  }

  private async handleReady(conn: Party.Connection) {
    if (!this.state || !this.state.players[conn.id]) return;

    this.state.players[conn.id].isReady = true;
    await this.saveState();

    this.room.broadcast(JSON.stringify({ type: 'player-ready', playerId: conn.id } as ServerMessage));
  }

  private async handleStart(conn: Party.Connection) {
    if (!this.state) return;

    // Only host can start
    if (conn.id !== this.state.hostId) {
      conn.send(JSON.stringify({ type: 'error', message: 'Only host can start' } as ServerMessage));
      return;
    }

    // Check all players ready
    const players = Object.values(this.state.players);
    if (players.length < 2) {
      conn.send(JSON.stringify({ type: 'error', message: 'Need at least 2 players' } as ServerMessage));
      return;
    }

    const allReady = players.every(p => p.isReady || p.id === this.state!.hostId);
    if (!allReady) {
      conn.send(JSON.stringify({ type: 'error', message: 'Not all players are ready' } as ServerMessage));
      return;
    }

    // Start countdown
    this.state.status = 'countdown';
    this.state.countdownStart = Date.now();
    await this.saveState();

    // Countdown from 3
    for (let i = 3; i > 0; i--) {
      this.room.broadcast(JSON.stringify({ type: 'countdown', seconds: i } as ServerMessage));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Start game
    this.state.status = 'playing';
    this.state.startTime = Date.now();
    await this.saveState();

    this.room.broadcast(JSON.stringify({ type: 'game-start' } as ServerMessage));
  }

  private async handleScoreUpdate(conn: Party.Connection, score: number, accuracy: number) {
    if (!this.state || !this.state.players[conn.id]) return;
    if (this.state.status !== 'playing') return;

    this.state.players[conn.id].score = score;
    this.state.players[conn.id].accuracy = accuracy;
    await this.saveState();

    this.room.broadcast(JSON.stringify({
      type: 'score-update',
      playerId: conn.id,
      score,
      accuracy,
    } as ServerMessage));
  }

  private async handleGameComplete(conn: Party.Connection, score: number, accuracy: number) {
    if (!this.state || !this.state.players[conn.id]) return;
    if (this.state.status !== 'playing') return;

    const finishTime = Date.now() - (this.state.startTime || Date.now());

    this.state.players[conn.id].score = score;
    this.state.players[conn.id].accuracy = accuracy;
    this.state.players[conn.id].isFinished = true;
    this.state.players[conn.id].finishTime = finishTime;
    await this.saveState();

    this.room.broadcast(JSON.stringify({
      type: 'player-finished',
      playerId: conn.id,
      score,
      accuracy,
      time: finishTime,
    } as ServerMessage));

    // Check if all finished
    const allFinished = Object.values(this.state.players).every(p => p.isFinished);
    if (allFinished) {
      await this.endGame();
    }
  }

  private async endGame() {
    if (!this.state) return;

    this.state.status = 'finished';
    await this.saveState();

    // Calculate rankings (by score, then by time)
    const rankings = Object.values(this.state.players)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.finishTime || Infinity) - (b.finishTime || Infinity);
      })
      .map(p => ({
        playerId: p.id,
        name: p.name,
        score: p.score,
        accuracy: p.accuracy,
        time: p.finishTime || 0,
      }));

    this.room.broadcast(JSON.stringify({ type: 'game-over', rankings } as ServerMessage));
  }

  private async handleLeave(conn: Party.Connection) {
    if (!this.state || !this.state.players[conn.id]) return;

    delete this.state.players[conn.id];
    await this.saveState();

    this.room.broadcast(JSON.stringify({ type: 'player-left', playerId: conn.id } as ServerMessage));

    // If host left, assign new host or close room
    if (conn.id === this.state.hostId) {
      const remainingPlayers = Object.keys(this.state.players);
      if (remainingPlayers.length > 0) {
        this.state.hostId = remainingPlayers[0];
        await this.saveState();
      }
    }
  }

  private async saveState() {
    if (this.state) {
      await this.room.storage.put("state", this.state);
    }
  }

  // HTTP endpoint to create/initialize room
  async onRequest(req: Party.Request) {
    if (req.method === "POST") {
      const body = await req.json() as {
        roomName: string;
        roomCode: string;
        hostId: string;
        hostName: string;
        gameId: string;
        gameName: string;
        difficulty: number;
        maxPlayers: number;
      };

      this.state = {
        roomName: body.roomName,
        roomCode: body.roomCode,
        hostId: body.hostId,
        gameId: body.gameId,
        gameName: body.gameName,
        difficulty: body.difficulty,
        maxPlayers: body.maxPlayers,
        status: 'waiting',
        players: {
          [body.hostId]: {
            id: body.hostId,
            name: body.hostName,
            score: 0,
            accuracy: 0,
            isReady: true,
            isFinished: false,
          },
        },
      };

      await this.saveState();

      return new Response(JSON.stringify(this.state), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET") {
      return new Response(JSON.stringify(this.state), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  }
}
