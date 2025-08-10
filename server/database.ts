import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';

export interface WorldObject {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  material?: string;
  metadata?: any;
}

export interface World {
  id: string;
  name: string;
  description: string;
  creator: string;
  isPublic: boolean;
  thumbnail?: string;
  objects: WorldObject[];
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  likes: number;
  downloads: number;
}

export interface WorldMetadata {
  id: string;
  name: string;
  description: string;
  creator: string;
  isPublic: boolean;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  likes: number;
  downloads: number;
  objectCount: number;
}

export interface CustomGame {
  id: string;
  name: string;
  description: string;
  creator: string;
  isPublic: boolean;
  thumbnail?: string;
  gameCode: string;
  gameAssets?: { [key: string]: string };
  gameConfig: {
    name: string;
    description: string;
    maxPlayers: number;
    gameMode: 'singleplayer' | 'multiplayer' | 'coop';
    controls: { [key: string]: string };
    objectives?: string[];
    settings?: { [key: string]: any };
  };
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  likes: number;
  downloads: number;
  version: string;
}

export interface GameMetadata {
  id: string;
  name: string;
  description: string;
  creator: string;
  isPublic: boolean;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  likes: number;
  downloads: number;
  version: string;
  gameMode: 'singleplayer' | 'multiplayer' | 'coop';
  maxPlayers: number;
}

class DatabaseService {
  private db: Database | null = null;

  async initialize(): Promise<void> {
    const dbPath = path.join(process.cwd(), 'worlds.db');
    
    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Worlds table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS worlds (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        creator TEXT NOT NULL,
        is_public BOOLEAN DEFAULT 0,
        thumbnail TEXT,
        objects TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT,
        likes INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0
      )
    `);

    // World likes table (for tracking user likes)
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS world_likes (
        world_id TEXT,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (world_id, user_id),
        FOREIGN KEY (world_id) REFERENCES worlds (id) ON DELETE CASCADE
      )
    `);

    // World downloads table (for tracking downloads)
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS world_downloads (
        world_id TEXT,
        user_id TEXT,
        downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (world_id) REFERENCES worlds (id) ON DELETE CASCADE
      )
    `);

    // Custom games table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS custom_games (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        creator TEXT NOT NULL,
        is_public BOOLEAN DEFAULT 0,
        thumbnail TEXT,
        game_code TEXT NOT NULL,
        game_assets TEXT,
        game_config TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT,
        likes INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        version TEXT DEFAULT '1.0.0'
      )
    `);

    // Game likes table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_likes (
        game_id TEXT,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (game_id, user_id),
        FOREIGN KEY (game_id) REFERENCES custom_games (id) ON DELETE CASCADE
      )
    `);

    // Game downloads table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_downloads (
        game_id TEXT,
        user_id TEXT,
        downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES custom_games (id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables created successfully');
  }

  async createWorld(world: Omit<World, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'downloads'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.run(`
      INSERT INTO worlds (id, name, description, creator, is_public, thumbnail, objects, created_at, updated_at, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      world.name,
      world.description || '',
      world.creator,
      world.isPublic ? 1 : 0,
      world.thumbnail || null,
      JSON.stringify(world.objects),
      now,
      now,
      world.tags ? JSON.stringify(world.tags) : null
    ]);

    return id;
  }

  async updateWorld(id: string, updates: Partial<World>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.isPublic !== undefined) {
      fields.push('is_public = ?');
      values.push(updates.isPublic ? 1 : 0);
    }
    if (updates.thumbnail !== undefined) {
      fields.push('thumbnail = ?');
      values.push(updates.thumbnail);
    }
    if (updates.objects !== undefined) {
      fields.push('objects = ?');
      values.push(JSON.stringify(updates.objects));
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());

    if (fields.length === 1) return; // Only updated_at, no actual changes

    values.push(id);

    await this.db.run(`
      UPDATE worlds SET ${fields.join(', ')} WHERE id = ?
    `, values);
  }

  async getWorld(id: string): Promise<World | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.get(`
      SELECT * FROM worlds WHERE id = ?
    `, [id]);

    if (!row) return null;

    return this.rowToWorld(row);
  }

  async getWorldsByCreator(creator: string): Promise<WorldMetadata[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all(`
      SELECT *, LENGTH(objects) as object_count FROM worlds 
      WHERE creator = ? 
      ORDER BY updated_at DESC
    `, [creator]);

    return rows.map((row: any) => this.rowToWorldMetadata(row));
  }

  async getPublicWorlds(limit = 20, offset = 0, search?: string, tags?: string[]): Promise<WorldMetadata[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT *, LENGTH(objects) as object_count FROM worlds 
      WHERE is_public = 1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tags && tags.length > 0) {
      const tagConditions = tags.map(() => `tags LIKE ?`).join(' OR ');
      query += ` AND (${tagConditions})`;
      tags.forEach(tag => params.push(`%"${tag}"%`));
    }

    query += ` ORDER BY likes DESC, downloads DESC, updated_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await this.db.all(query, params);
    return rows.map((row: any) => this.rowToWorldMetadata(row));
  }

  async likeWorld(worldId: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.run(`
        INSERT INTO world_likes (world_id, user_id) VALUES (?, ?)
      `, [worldId, userId]);

      await this.db.run(`
        UPDATE worlds SET likes = likes + 1 WHERE id = ?
      `, [worldId]);
    } catch (error) {
      // Like already exists, remove it (unlike)
      await this.db.run(`
        DELETE FROM world_likes WHERE world_id = ? AND user_id = ?
      `, [worldId, userId]);

      await this.db.run(`
        UPDATE worlds SET likes = likes - 1 WHERE id = ?
      `, [worldId]);
    }
  }

  async downloadWorld(worldId: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      INSERT OR IGNORE INTO world_downloads (world_id, user_id) VALUES (?, ?)
    `, [worldId, userId]);

    await this.db.run(`
      UPDATE worlds SET downloads = (
        SELECT COUNT(DISTINCT user_id) FROM world_downloads WHERE world_id = ?
      ) WHERE id = ?
    `, [worldId, worldId]);
  }

  async deleteWorld(id: string, creator: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      DELETE FROM worlds WHERE id = ? AND creator = ?
    `, [id, creator]);
  }

  // Custom Games methods
  async createGame(game: Omit<CustomGame, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'downloads'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.run(`
      INSERT INTO custom_games (id, name, description, creator, is_public, thumbnail, game_code, game_assets, game_config, created_at, updated_at, tags, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      game.name,
      game.description || '',
      game.creator,
      game.isPublic ? 1 : 0,
      game.thumbnail || null,
      game.gameCode,
      game.gameAssets ? JSON.stringify(game.gameAssets) : null,
      JSON.stringify(game.gameConfig),
      now,
      now,
      game.tags ? JSON.stringify(game.tags) : null,
      game.version
    ]);

    return id;
  }

  async updateGame(id: string, updates: Partial<CustomGame>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.isPublic !== undefined) {
      fields.push('is_public = ?');
      values.push(updates.isPublic ? 1 : 0);
    }
    if (updates.thumbnail !== undefined) {
      fields.push('thumbnail = ?');
      values.push(updates.thumbnail);
    }
    if (updates.gameCode !== undefined) {
      fields.push('game_code = ?');
      values.push(updates.gameCode);
    }
    if (updates.gameAssets !== undefined) {
      fields.push('game_assets = ?');
      values.push(JSON.stringify(updates.gameAssets));
    }
    if (updates.gameConfig !== undefined) {
      fields.push('game_config = ?');
      values.push(JSON.stringify(updates.gameConfig));
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.version !== undefined) {
      fields.push('version = ?');
      values.push(updates.version);
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());

    if (fields.length === 1) return; // Only updated_at, no actual changes

    values.push(id);

    await this.db.run(`
      UPDATE custom_games SET ${fields.join(', ')} WHERE id = ?
    `, values);
  }

  async getGame(id: string): Promise<CustomGame | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.get(`
      SELECT * FROM custom_games WHERE id = ?
    `, [id]);

    if (!row) return null;

    return this.rowToGame(row);
  }

  async getGamesByCreator(creator: string): Promise<GameMetadata[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all(`
      SELECT * FROM custom_games 
      WHERE creator = ? 
      ORDER BY updated_at DESC
    `, [creator]);

    return rows.map((row: any) => this.rowToGameMetadata(row));
  }

  async getPublicGames(limit = 20, offset = 0, search?: string, tags?: string[]): Promise<GameMetadata[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT * FROM custom_games 
      WHERE is_public = 1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tags && tags.length > 0) {
      const tagConditions = tags.map(() => `tags LIKE ?`).join(' OR ');
      query += ` AND (${tagConditions})`;
      tags.forEach(tag => params.push(`%"${tag}"%`));
    }

    query += ` ORDER BY likes DESC, downloads DESC, updated_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await this.db.all(query, params);
    return rows.map((row: any) => this.rowToGameMetadata(row));
  }

  async likeGame(gameId: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.run(`
        INSERT INTO game_likes (game_id, user_id) VALUES (?, ?)
      `, [gameId, userId]);

      await this.db.run(`
        UPDATE custom_games SET likes = likes + 1 WHERE id = ?
      `, [gameId]);
    } catch (error) {
      // Like already exists, remove it (unlike)
      await this.db.run(`
        DELETE FROM game_likes WHERE game_id = ? AND user_id = ?
      `, [gameId, userId]);

      await this.db.run(`
        UPDATE custom_games SET likes = likes - 1 WHERE id = ?
      `, [gameId]);
    }
  }

  async downloadGame(gameId: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      INSERT OR IGNORE INTO game_downloads (game_id, user_id) VALUES (?, ?)
    `, [gameId, userId]);

    await this.db.run(`
      UPDATE custom_games SET downloads = (
        SELECT COUNT(DISTINCT user_id) FROM game_downloads WHERE game_id = ?
      ) WHERE id = ?
    `, [gameId, gameId]);
  }

  async deleteGame(id: string, creator: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      DELETE FROM custom_games WHERE id = ? AND creator = ?
    `, [id, creator]);
  }

  private rowToWorld(row: any): World {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      creator: row.creator,
      isPublic: Boolean(row.is_public),
      thumbnail: row.thumbnail,
      objects: JSON.parse(row.objects),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      tags: row.tags ? JSON.parse(row.tags) : [],
      likes: row.likes,
      downloads: row.downloads
    };
  }

  private rowToWorldMetadata(row: any): WorldMetadata {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      creator: row.creator,
      isPublic: Boolean(row.is_public),
      thumbnail: row.thumbnail,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      tags: row.tags ? JSON.parse(row.tags) : [],
      likes: row.likes,
      downloads: row.downloads,
      objectCount: JSON.parse(row.objects).length
    };
  }

  private rowToGame(row: any): CustomGame {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      creator: row.creator,
      isPublic: Boolean(row.is_public),
      thumbnail: row.thumbnail,
      gameCode: row.game_code,
      gameAssets: row.game_assets ? JSON.parse(row.game_assets) : undefined,
      gameConfig: JSON.parse(row.game_config),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      tags: row.tags ? JSON.parse(row.tags) : [],
      likes: row.likes,
      downloads: row.downloads,
      version: row.version
    };
  }

  private rowToGameMetadata(row: any): GameMetadata {
    const gameConfig = JSON.parse(row.game_config);
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      creator: row.creator,
      isPublic: Boolean(row.is_public),
      thumbnail: row.thumbnail,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      tags: row.tags ? JSON.parse(row.tags) : [],
      likes: row.likes,
      downloads: row.downloads,
      version: row.version,
      gameMode: gameConfig.gameMode,
      maxPlayers: gameConfig.maxPlayers
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export const dbService = new DatabaseService();
