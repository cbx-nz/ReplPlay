import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface Player {
  id: string;
  socket: WebSocket;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  name: string;
}

interface GameRoom {
  id: string;
  players: Map<string, Player>;
  gameType: string;
  maxPlayers: number;
}

export class GameServer {
  private wss: WebSocketServer;
  private players: Map<string, Player> = new Map();
  private rooms: Map<string, GameRoom> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
    this.createDefaultRoom();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (socket: WebSocket) => {
      const playerId = this.generatePlayerId();
      console.log(`Player ${playerId} connected`);

      // Create new player
      const player: Player = {
        id: playerId,
        socket,
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        color: this.generateRandomColor(),
        name: `Player ${playerId.slice(0, 4)}`
      };

      this.players.set(playerId, player);
      
      // Add player to default room
      const defaultRoom = this.rooms.get('default');
      if (defaultRoom) {
        defaultRoom.players.set(playerId, player);
      }

      // Send welcome message
      this.sendToPlayer(playerId, {
        type: 'player_joined',
        playerId: playerId,
        color: player.color
      });

      // Notify other players
      this.broadcastToRoom('default', {
        type: 'player_joined',
        playerId: playerId,
        data: {
          position: player.position,
          rotation: player.rotation,
          color: player.color,
          name: player.name
        }
      }, playerId);

      // Send existing players to new player
      if (defaultRoom) {
        defaultRoom.players.forEach((existingPlayer, existingPlayerId) => {
          if (existingPlayerId !== playerId) {
            this.sendToPlayer(playerId, {
              type: 'player_update',
              playerId: existingPlayerId,
              data: {
                position: existingPlayer.position,
                rotation: existingPlayer.rotation,
                color: existingPlayer.color,
                name: existingPlayer.name
              }
            });
          }
        });
      }

      // Handle messages
      socket.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handlePlayerMessage(playerId, message);
        } catch (error) {
          console.error(`Failed to parse message from player ${playerId}:`, error);
        }
      });

      // Handle disconnect
      socket.on('close', () => {
        console.log(`Player ${playerId} disconnected`);
        this.removePlayer(playerId);
      });

      socket.on('error', (error) => {
        console.error(`WebSocket error for player ${playerId}:`, error);
      });
    });
  }

  private handlePlayerMessage(playerId: string, message: any): void {
    const player = this.players.get(playerId);
    if (!player) return;

    switch (message.type) {
      case 'player_update':
        // Update player position/rotation
        if (message.data.position) {
          player.position = message.data.position;
        }
        if (message.data.rotation) {
          player.rotation = message.data.rotation;
        }

        // Broadcast to other players in room
        this.broadcastToRoom('default', {
          type: 'player_update',
          playerId: playerId,
          data: {
            position: player.position,
            rotation: player.rotation,
            color: player.color,
            name: player.name
          }
        }, playerId);
        break;

      case 'game_event':
        // Handle game-specific events
        this.broadcastToRoom('default', {
          type: 'game_event',
          playerId: playerId,
          event: message.event,
          data: message.data
        }, playerId);
        break;

      case 'chat_message':
        // Handle chat messages
        this.broadcastToRoom('default', {
          type: 'chat_message',
          playerId: playerId,
          message: message.message,
          playerName: player.name
        });
        break;
    }
  }

  private removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    // Remove from all rooms
    this.rooms.forEach((room) => {
      if (room.players.has(playerId)) {
        room.players.delete(playerId);
        
        // Notify other players in room
        this.broadcastToRoom(room.id, {
          type: 'player_left',
          playerId: playerId
        });
      }
    });

    this.players.delete(playerId);
  }

  private sendToPlayer(playerId: string, message: any): void {
    const player = this.players.get(playerId);
    if (player && player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(JSON.stringify(message));
    }
  }

  private broadcastToRoom(roomId: string, message: any, excludePlayerId?: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.forEach((player, playerId) => {
      if (playerId !== excludePlayerId && player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(JSON.stringify(message));
      }
    });
  }

  private createDefaultRoom(): void {
    const defaultRoom: GameRoom = {
      id: 'default',
      players: new Map(),
      gameType: 'general',
      maxPlayers: 20
    };
    this.rooms.set('default', defaultRoom);
  }

  private generatePlayerId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private generateRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getStats(): { players: number; rooms: number } {
    return {
      players: this.players.size,
      rooms: this.rooms.size
    };
  }
}
