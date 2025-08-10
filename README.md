# 3D Game Framework

A browser-based 3D multiplayer game framework built with React Three Fiber, similar to Roblox. Features multiple playable game templates, user accounts, car customization, world building, and real-time chat.

![3D Game Framework](https://img.shields.io/badge/status-active-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Three.js](https://img.shields.io/badge/Three.js-latest-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

### 🎮 Multiple Game Templates
- **Open World Explorer** - Large open world with camera-relative movement
- **Platformer Adventure** - Jump-based gameplay with platforms
- **Circuit Racing** - Racing track with car physics and drift mechanics
- **Arena Shooter** - Combat arena with cover objects
- **Puzzle Chamber** - Interactive room with puzzle elements
- **Sandbox Mode** - Creative mode with building tools

### 👤 User System
- User registration and guest accounts
- Persistent login with localStorage
- User profiles and account management

### 🚗 Car Customization
- Visual customization (body, roof, wheel colors)
- Body type selection (sedan, sports, truck, compact)
- Upgrade system with 5 levels for engine, brakes, handling
- Nitro boost system with 3 levels

### 💬 Real-time Chat
- Chat message history with timestamps
- Quick chat buttons for common messages
- System announcements and user messages

### 🏗️ World Builder
- Block-based building system with 7 block types
- Real-time 3D preview with orbit controls
- Save/load custom worlds with metadata
- Public/private world sharing system

## Tech Stack

### Frontend
- **React 18** - UI framework
- **React Three Fiber** - 3D rendering with Three.js
- **@react-three/drei** - Useful helpers for R3F
- **Zustand** - State management
- **TanStack Query** - Server state management
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **TypeScript** - Type safety

### Backend
- **Express.js** - Web server
- **WebSocket (ws)** - Real-time communication
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database

### Development
- **Vite** - Build tool and dev server
- **ESBuild** - Fast bundler
- **PostCSS** - CSS processing

## Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database (optional - uses in-memory storage by default)

## Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd 3d-game-framework
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup (Optional)
Create a `.env` file in the root directory if you want to use PostgreSQL:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/gamedb
```

### 4. Start Development Server
```bash
npm run dev
```

The application will start on `http://localhost:3000` with the backend on port 5000.

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── UserSystem.tsx     # User login/profile
│   │   │   ├── ChatSystem.tsx     # Real-time chat
│   │   │   ├── CarCustomization.tsx # Car customization
│   │   │   ├── WorldBuilder.tsx   # 3D world builder
│   │   │   └── GameRenderer.tsx   # Game template renderer
│   │   ├── games/         # Game template implementations
│   │   ├── lib/           # Utilities and stores
│   │   └── SimpleApp.tsx  # Main application component
├── server/                # Backend Express server
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage layer
│   └── gameServer.ts     # WebSocket game server
├── shared/               # Shared types and schemas
│   ├── types.ts         # TypeScript interfaces
│   └── schema.ts        # Data schemas
└── README.md
```

## Usage

### Getting Started
1. Open the application in your browser
2. Create a user account or continue as guest
3. Choose a game template from the main menu
4. Start playing!

### Game Controls
**Movement (all games):**
- `W/S` - Move forward/backward
- `A/D` - Move left/right
- `Space` - Brake/Jump (context dependent)

**Camera (Open World):**
- `I/K` - Look up/down
- `J/L` - Look left/right

**General:**
- `ESC` - Return to menu

### Car Customization
1. Click "Customize Car" from the menu or in-game HUD
2. Choose colors for body, roof, and wheels
3. Select body type (sedan, sports, truck, compact)
4. Upgrade engine, brakes, handling, and nitro
5. Save your customization

### World Builder
1. Click "World Builder" to access the 3D editor
2. Select block types from the palette
3. Click in the 3D view to place blocks
4. Use edit mode to modify existing blocks
5. Save your custom world

### Chat System
- Use the chat box to communicate with other players
- Quick chat buttons provide common messages
- Chat history is preserved during your session

## Development

### Adding New Game Templates
1. Create a new game component in `client/src/games/`
2. Implement the game logic with Three.js components
3. Add the game to `GameRenderer.tsx`
4. Update the game selection menu

### Customizing the Framework
- Modify `shared/types.ts` to add new data structures
- Extend the storage layer in `server/storage.ts`
- Add new API endpoints in `server/routes.ts`
- Create new UI components in `client/src/components/`

### Building for Production
```bash
npm run build
```

## Deployment

### Using Replit
1. Import the project to Replit
2. Run `npm install` in the Shell
3. Click the "Run" button
4. Your app will be available at your Replit URL

### Using Other Platforms
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure your backend is accessible
4. Set up environment variables if using PostgreSQL

## Configuration

### Database Setup (Optional)
If you want to use PostgreSQL instead of in-memory storage:

1. Install PostgreSQL
2. Create a database
3. Set the `DATABASE_URL` environment variable
4. Run database migrations (if implemented)

### WebSocket Configuration
The WebSocket server runs on the same port as the Express server. Configure the port in `server/index.ts`:

```typescript
const PORT = process.env.PORT || 5000;
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Game Templates

### Open World Explorer
- Large 200x200 unit world
- Camera-relative movement
- Buildings, trees, and environmental objects
- Free exploration gameplay

### Platformer Adventure
- Jump-based movement
- Multiple platform levels
- Physics simulation
- Collectible items

### Circuit Racing
- Circular racing track
- Car physics with drift mechanics
- Lap timing system
- Racing barriers and track elements

### Arena Shooter
- Combat arena environment
- Cover objects for tactical gameplay
- Player movement and positioning
- Shooting mechanics framework

### Puzzle Chamber
- Interactive puzzle elements
- Switches and movable objects
- Logic-based gameplay
- Room escape mechanics

### Sandbox Mode
- Creative building tools
- Object placement and manipulation
- Physics experimentation
- Open-ended gameplay

## Architecture

### Frontend Architecture
- Component-based React structure
- Zustand for state management
- React Three Fiber for 3D rendering
- Modular game template system

### Backend Architecture
- Express.js REST API
- WebSocket for real-time features
- Room-based multiplayer architecture
- Abstracted storage layer

### Data Management
- Shared TypeScript interfaces
- Client-side caching with TanStack Query
- Real-time synchronization via WebSocket
- Persistent user data storage

## Troubleshooting

### Common Issues

**Application won't start:**
- Check Node.js version (18+ required)
- Run `npm install` to ensure dependencies are installed
- Check for port conflicts (3000 for frontend, 5000 for backend)

**3D scenes not rendering:**
- Ensure WebGL is supported in your browser
- Check browser console for Three.js errors
- Update graphics drivers if needed

**WebSocket connection failed:**
- Verify backend server is running
- Check firewall settings
- Ensure ports 5000 is accessible

**Database connection issues:**
- Verify PostgreSQL is running (if using database)
- Check DATABASE_URL environment variable
- Fall back to in-memory storage if needed

### Performance Tips
- Use modern browsers with good WebGL support
- Close other tabs to free up GPU memory
- Reduce graphics quality on lower-end devices
- Monitor frame rate with the built-in FPS counter

## License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## Acknowledgments

- Built with React Three Fiber
- Inspired by Roblox and other block-based game platforms
- Uses various open-source libraries and tools

---

**Need help?** Check the troubleshooting section or create an issue in the repository.
