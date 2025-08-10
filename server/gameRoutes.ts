import { Router, Request, Response } from 'express';
import { dbService } from './database';

export function registerGameRoutes(app: any): void {
  const router = Router();

  // Get public games
  router.get('/', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;

      const games = await dbService.getPublicGames(limit, offset, search, tags);
      res.json({ games, total: games.length });
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  });

  // Get specific game
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const game = await dbService.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      // Don't send the game code unless it's a download request
      if (req.query.download !== 'true') {
        const { gameCode, ...gameMetadata } = game;
        res.json(gameMetadata);
      } else {
        // Track download
        const userId = req.headers['x-user-id'] as string;
        if (userId) {
          await dbService.downloadGame(req.params.id, userId);
        }
        res.json(game);
      }
    } catch (error) {
      console.error('Error fetching game:', error);
      res.status(500).json({ error: 'Failed to fetch game' });
    }
  });

  // Create new game
  router.post('/', async (req: Request, res: Response) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      const gameData = {
        ...req.body,
        creator: userId
      };

      // Validate required fields
      if (!gameData.name || !gameData.gameCode || !gameData.gameConfig) {
        return res.status(400).json({ error: 'Missing required fields: name, gameCode, gameConfig' });
      }

      const gameId = await dbService.createGame(gameData);
      res.status(201).json({ id: gameId, message: 'Game created successfully' });
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(500).json({ error: 'Failed to create game' });
    }
  });

  // Update game
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      const game = await dbService.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      if (game.creator !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this game' });
      }

      await dbService.updateGame(req.params.id, req.body);
      res.json({ message: 'Game updated successfully' });
    } catch (error) {
      console.error('Error updating game:', error);
      res.status(500).json({ error: 'Failed to update game' });
    }
  });

  // Delete game
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      await dbService.deleteGame(req.params.id, userId);
      res.json({ message: 'Game deleted successfully' });
    } catch (error) {
      console.error('Error deleting game:', error);
      res.status(500).json({ error: 'Failed to delete game' });
    }
  });

  // Like/unlike game
  router.post('/:id/like', async (req: Request, res: Response) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      await dbService.likeGame(req.params.id, userId);
      res.json({ message: 'Game like status updated' });
    } catch (error) {
      console.error('Error updating game like:', error);
      res.status(500).json({ error: 'Failed to update like status' });
    }
  });

  // Get user's games
  router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
      const games = await dbService.getGamesByCreator(req.params.userId);
      res.json({ games });
    } catch (error) {
      console.error('Error fetching user games:', error);
      res.status(500).json({ error: 'Failed to fetch user games' });
    }
  });

  app.use('/api/custom-games', router);
}
