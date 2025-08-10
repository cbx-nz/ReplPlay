import type { Express } from "express";
import { createServer, type Server } from "http";
import { GameServer } from "./gameServer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Game API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/games", (req, res) => {
    // Return available games
    res.json({
      games: [
        {
          id: "driving",
          name: "Racing Game",
          description: "Drive a car around a circular track with realistic physics",
          maxPlayers: 8
        },
        {
          id: "sandbox",
          name: "Sandbox Builder", 
          description: "Build and interact with 3D objects in an open world",
          maxPlayers: 16
        }
      ]
    });
  });

  app.get("/api/server-stats", (req, res) => {
    // Return server statistics (will be populated by GameServer)
    res.json({
      players: 0,
      rooms: 0,
      uptime: process.uptime()
    });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize game server with WebSocket support
  const gameServer = new GameServer(httpServer);

  // Update stats endpoint to use actual game server data
  app.get("/api/server-stats", (req, res) => {
    const stats = gameServer.getStats();
    res.json({
      ...stats,
      uptime: process.uptime()
    });
  });

  console.log("Game server initialized with WebSocket support");

  return httpServer;
}
