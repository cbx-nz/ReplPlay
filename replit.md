# Overview

This project is a 3D multiplayer game framework built with React Three Fiber on the frontend and Express.js with WebSocket support on the backend. The framework includes 6 complete game templates demonstrating different gameplay mechanics: Open World Explorer, Platformer Adventure, Circuit Racing, Arena Shooter, Puzzle Chamber, and Sandbox Mode. It features a modular architecture where new games can be easily added through a game registry system. The current demo showcases an open world environment with camera-relative movement and free exploration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend uses React with Three.js through React Three Fiber for 3D rendering. The architecture follows a component-based approach with:

- **Game Engine System**: A central game engine (`GameEngine` component) that manages game lifecycle and dynamically loads game modules from a registry
- **State Management**: Zustand stores handle different aspects of the application:
  - `useGameEngine`: Manages current game, game state, and game data
  - `useMultiplayer`: Handles WebSocket connections and player synchronization
  - `useGame`: Controls game phases (ready, playing, ended)
  - `useAudio`: Manages sound effects and background music
- **Game Registry**: A modular system where games are registered with their components and initialization functions (6 game templates available)
- **Game Templates**: Complete implementations of different game genres with unique control schemes and physics
- **3D Rendering**: Canvas-based rendering with support for physics, lighting, and post-processing effects
- **UI Framework**: Radix UI components with Tailwind CSS for styling

## Backend Architecture

The backend follows a RESTful API design with WebSocket support for real-time features:

- **Express.js Server**: Main HTTP server handling API routes and static file serving
- **WebSocket Game Server**: Dedicated `GameServer` class managing real-time multiplayer sessions
- **Room-based Architecture**: Players are organized into game rooms with support for different game types
- **Storage Layer**: Abstracted storage interface with in-memory implementation for user data

## Data Management

- **Database**: Drizzle ORM configured for PostgreSQL with user schema
- **Real-time Communication**: WebSocket protocol for player position updates, game events, and room management
- **Client-side Caching**: TanStack Query for API request caching and state synchronization

## Game System Design

- **Modular Games**: Each game template is a self-contained module with its own component and initialization logic
- **Game Templates**: 6 complete game templates (Open World, Platformer, Racing, Shooter, Puzzle, Sandbox)
- **Game Registry**: Centralized registration system for all game templates in `gameRegistry.ts`
- **Physics Engine**: Custom physics implementation for collision detection, movement, and game-specific mechanics
- **Input System**: Keyboard controls mapped through a centralized control system with game-specific control schemes
- **Multiplayer Synchronization**: Real-time player position and state updates across connected clients

## Development Workflow

- **Build System**: Vite for frontend bundling with hot module replacement
- **TypeScript**: Full type safety across frontend and backend with shared schemas
- **Development Server**: Integrated development environment with proxy setup for API calls

# External Dependencies

## Core Frontend Libraries
- **React Three Fiber**: 3D scene management and rendering engine
- **Three.js**: 3D graphics library for WebGL rendering
- **Zustand**: Lightweight state management solution
- **TanStack Query**: Server state management and caching

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Backend Services
- **Express.js**: Web application framework for Node.js
- **WebSocket (ws)**: Real-time bidirectional communication
- **Drizzle ORM**: Type-safe SQL query builder and ORM

## Database
- **PostgreSQL**: Primary database (configured via Neon Database serverless)
- **DATABASE_URL**: Environment variable for database connection

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: JavaScript bundler for production builds

## Additional Integrations
- **WebGL Shaders**: GLSL support for custom visual effects
- **3D Asset Loading**: Support for GLTF/GLB model formats
- **Audio Assets**: MP3, OGG, WAV file support for game audio

## Game Templates Available
- **Open World Explorer**: Large open world with camera-relative movement and free exploration
- **Platformer Adventure**: Side-scrolling with jump physics and platform collision detection
- **Circuit Racing**: High-speed racing with drift physics and professional track
- **Arena Shooter**: Top-down combat with bullet system and tank controls
- **Puzzle Chamber**: Interactive object manipulation with switches and doors
- **Sandbox Mode**: Creative building and experimentation mode

## Recent Changes (August 2025)
- Added 5 new game templates with complete gameplay mechanics
- Expanded open world demo to 200x200 units with camera controls
- Implemented camera-relative movement system (move where you're looking)
- Created comprehensive game template documentation
- Updated game registry system to handle multiple game types
- Enhanced main menu to showcase all available game templates