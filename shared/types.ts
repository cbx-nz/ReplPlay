// Shared types for multiplayer game system

export interface User {
  id: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  lastSeen: Date;
}

export interface CarCustomization {
  bodyColor: string;
  roofColor: string;
  wheelColor: string;
  bodyType: 'sedan' | 'sports' | 'truck' | 'compact';
  upgrades: CarUpgrades;
}

export interface CarUpgrades {
  engine: number; // 1-5 levels
  brakes: number; // 1-5 levels
  handling: number; // 1-5 levels
  nitro: number; // 0-3 levels
}

export interface PlayerCar {
  userId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  customization: CarCustomization;
  health: number;
  nitroFuel: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'system' | 'announcement';
}

export interface WorldBlock {
  type: 'ground' | 'building' | 'tree' | 'rock' | 'road' | 'ramp' | 'custom';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  texture?: string;
  id: string;
}

export interface CustomWorld {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  blocks: WorldBlock[];
  spawnPoints: [number, number, number][];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  maxPlayers: number;
}

export interface GameRoom {
  id: string;
  name: string;
  worldId?: string;
  gameType: 'openworld' | 'racing' | 'shooter' | 'platformer' | 'puzzle' | 'sandbox';
  players: PlayerCar[];
  maxPlayers: number;
  isPrivate: boolean;
  hostId: string;
  createdAt: Date;
}

export interface MultiplayerGameState {
  roomId: string;
  players: { [userId: string]: PlayerCar };
  chatMessages: ChatMessage[];
  worldData?: CustomWorld;
  gameStatus: 'waiting' | 'playing' | 'ended';
  gameData: any; // Game-specific data
}

// WebSocket message types
export type SocketMessage = 
  | { type: 'player_join'; payload: { user: User; car: PlayerCar } }
  | { type: 'player_leave'; payload: { userId: string } }
  | { type: 'player_update'; payload: { userId: string; car: Partial<PlayerCar> } }
  | { type: 'chat_message'; payload: ChatMessage }
  | { type: 'world_update'; payload: { blocks: WorldBlock[] } }
  | { type: 'game_state_update'; payload: Partial<MultiplayerGameState> }
  | { type: 'room_created'; payload: GameRoom }
  | { type: 'room_joined'; payload: { room: GameRoom; user: User } };