import type { Express } from "express";
import { dbService } from "./database";

export function registerWorldRoutes(app: Express): void {
  // Get public worlds (library)
  app.get("/api/worlds", async (req, res) => {
    try {
      const {
        limit = 20,
        offset = 0,
        search,
        tags
      } = req.query;

      const parsedTags = typeof tags === 'string' ? tags.split(',') : undefined;
      
      const worlds = await dbService.getPublicWorlds(
        Number(limit),
        Number(offset),
        search as string,
        parsedTags
      );

      res.json({
        worlds,
        total: worlds.length
      });
    } catch (error) {
      console.error('Error fetching worlds:', error);
      res.status(500).json({ error: 'Failed to fetch worlds' });
    }
  });

  // Get a specific world by ID
  app.get("/api/worlds/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const world = await dbService.getWorld(id);

      if (!world) {
        return res.status(404).json({ error: 'World not found' });
      }

      // If world is not public, only creator can access
      if (!world.isPublic) {
        const userId = req.headers['x-user-id'] as string;
        if (userId !== world.creator) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      res.json(world);
    } catch (error) {
      console.error('Error fetching world:', error);
      res.status(500).json({ error: 'Failed to fetch world' });
    }
  });

  // Create a new world
  app.post("/api/worlds", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      const {
        name,
        description,
        isPublic = false,
        thumbnail,
        objects = [],
        tags = []
      } = req.body;

      if (!name || !objects) {
        return res.status(400).json({ error: 'Name and objects are required' });
      }

      const worldId = await dbService.createWorld({
        name,
        description,
        creator: userId,
        isPublic,
        thumbnail,
        objects,
        tags
      });

      res.status(201).json({ id: worldId });
    } catch (error) {
      console.error('Error creating world:', error);
      res.status(500).json({ error: 'Failed to create world' });
    }
  });

  // Update a world
  app.put("/api/worlds/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      const world = await dbService.getWorld(id);
      if (!world) {
        return res.status(404).json({ error: 'World not found' });
      }

      if (world.creator !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await dbService.updateWorld(id, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating world:', error);
      res.status(500).json({ error: 'Failed to update world' });
    }
  });

  // Delete a world
  app.delete("/api/worlds/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      await dbService.deleteWorld(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting world:', error);
      res.status(500).json({ error: 'Failed to delete world' });
    }
  });

  // Get user's worlds
  app.get("/api/users/:userId/worlds", async (req, res) => {
    try {
      const { userId } = req.params;
      const requesterId = req.headers['x-user-id'] as string;

      // Only allow users to see their own private worlds
      const includePrivate = requesterId === userId;
      
      const worlds = await dbService.getWorldsByCreator(userId);
      
      // Filter out private worlds if not the creator
      const filteredWorlds = includePrivate 
        ? worlds 
        : worlds.filter(world => world.isPublic);

      res.json({ worlds: filteredWorlds });
    } catch (error) {
      console.error('Error fetching user worlds:', error);
      res.status(500).json({ error: 'Failed to fetch user worlds' });
    }
  });

  // Like/unlike a world
  app.post("/api/worlds/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      await dbService.likeWorld(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error liking world:', error);
      res.status(500).json({ error: 'Failed to like world' });
    }
  });

  // Download a world (increment download count)
  app.post("/api/worlds/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      await dbService.downloadWorld(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error downloading world:', error);
      res.status(500).json({ error: 'Failed to download world' });
    }
  });

  // Search worlds
  app.get("/api/search/worlds", async (req, res) => {
    try {
      const { q: search, tags, limit = 20, offset = 0 } = req.query;
      
      const parsedTags = typeof tags === 'string' ? tags.split(',') : undefined;
      
      const worlds = await dbService.getPublicWorlds(
        Number(limit),
        Number(offset),
        search as string,
        parsedTags
      );

      res.json({ worlds });
    } catch (error) {
      console.error('Error searching worlds:', error);
      res.status(500).json({ error: 'Failed to search worlds' });
    }
  });
}
