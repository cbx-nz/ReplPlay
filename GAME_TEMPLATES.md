# 3D Game Framework - Game Templates

This framework includes multiple game templates demonstrating different gameplay mechanics and patterns. Each template is a complete, playable game that showcases specific features and can be used as a starting point for your own games.

## Available Game Templates

### 1. Open World Explorer (`SimpleApp.tsx`)
**Status:** ✅ Fully Playable
- **Description:** Large open world with free exploration and camera controls
- **Features:**
  - 200x200 unit world with varied terrain
  - Camera-relative movement (move where you're looking)
  - Free camera controls (I/K/J/L keys)
  - Scattered buildings, trees, and rocks
  - Dynamic terrain chunks with color variation
- **Controls:**
  - W/S: Move forward/backward relative to camera
  - A/D: Move left/right relative to camera
  - I/K: Look up/down
  - J/L: Look left/right
  - Space: Brake
  - ESC: Return to menu

### 2. Platformer Adventure (`games/platformer.tsx`)
**Status:** ✅ Template Created
- **Description:** Side-scrolling platformer with jump physics
- **Features:**
  - Gravity and jump physics system
  - Multiple platforms at different heights
  - Ground collision detection
  - Platform collision detection
  - Collectible coins scattered throughout level
  - Following camera that tracks player
- **Controls:**
  - A/D: Move left/right
  - Space/W: Jump
- **Physics:**
  - Jump force: 12 units
  - Gravity: -25 units/second²
  - Move speed: 8 units/second

### 3. Circuit Racing (`games/racing.tsx`)
**Status:** ✅ Template Created
- **Description:** High-speed racing with realistic car physics
- **Features:**
  - Drift physics system
  - Circular racing track with barriers
  - Speed-based steering responsiveness
  - Track boundaries with collision penalties
  - Professional racing track with grandstands
  - Checkered start/finish line
- **Controls:**
  - W: Accelerate
  - S: Reverse
  - A/D: Steer left/right
  - Space: Brake
- **Physics:**
  - Max speed: 25 units/second
  - Drift coefficient: 0.95
  - Speed affects steering sensitivity

### 4. Arena Shooter (`games/shooter.tsx`)
**Status:** ✅ Template Created
- **Description:** Top-down combat with bullet system and AI
- **Features:**
  - Bullet physics with lifetime management
  - Tank-style player with turret
  - Arena environment with cover objects
  - Enemy AI system (template ready)
  - Collision detection for bullets
- **Controls:**
  - W/A/S/D: Move in cardinal directions
  - Space: Shoot bullets
- **System:**
  - Bullet speed: 30 units/second
  - Bullet lifetime: 3 seconds
  - Shot cooldown: 0.2 seconds

### 5. Puzzle Chamber (`games/puzzle.tsx`)
**Status:** ✅ Template Created
- **Description:** Interactive puzzle solving with objects and switches
- **Features:**
  - Movable box system
  - Pressure plate mechanics
  - Interactive switches
  - Animated doors that open when puzzles are solved
  - Room-based environment
  - Goal detection system
- **Controls:**
  - W/A/S/D: Move player
  - E/Space: Interact with objects
  - Click: Select/interact with boxes and switches
- **Puzzle Elements:**
  - 3 switches to activate
  - 3 movable boxes
  - 3 pressure plates
  - 1 exit door

### 6. Sandbox Mode (`games/sandbox.tsx`)
**Status:** ✅ Template Created (Existing)
- **Description:** Creative building and experimentation mode
- **Features:** (To be expanded based on existing sandbox game)

## Framework Architecture

### Game Registry System
All games are registered in `client/src/lib/gameRegistry.ts`:

```typescript
export const gameRegistry: { [key: string]: Omit<GameInfo, 'id'> } = {
  driving: drivingGameConfig,
  sandbox: sandboxGameConfig,
  platformer: platformerGameConfig,
  shooter: shooterGameConfig,
  puzzle: puzzleGameConfig,
  racing: racingGameConfig
};
```

### Game Template Structure
Each game template follows this pattern:

```typescript
// Game component with KeyboardControls wrapper
function MyGame({ gameData, setGameData }: any) {
  return (
    <KeyboardControls map={myControls}>
      <Environment />
      <Player gameData={gameData} setGameData={setGameData} />
    </KeyboardControls>
  );
}

// Export configuration
export const myGameConfig = {
  name: "Game Name",
  description: "Game description",
  component: MyGame,
  init: () => ({
    // Initial game state
  })
};
```

### Control Systems
Each game defines its own control scheme:

```typescript
enum MyControls {
  forward = 'forward',
  // ... other controls
}

const myControls = [
  { name: MyControls.forward, keys: ['KeyW', 'ArrowUp'] },
  // ... other mappings
];
```

### Physics Implementation
Games use `useFrame` hook for physics:

```typescript
useFrame((state, delta) => {
  // Physics calculations
  // Movement updates
  // Collision detection
  // Camera updates
});
```

## How to Add a New Game Template

1. **Create the game file** in `client/src/games/yourgame.tsx`
2. **Define controls** enum and key mappings
3. **Implement game components** (Player, Environment, etc.)
4. **Add physics** using useFrame hook
5. **Export game config** with name, description, component, and init function
6. **Register in gameRegistry.ts** by importing and adding to the registry
7. **Update this documentation** with game details

## Integration with Multiplayer System

All templates are designed to work with the multiplayer system:
- Game state can be synchronized via WebSocket
- Player positions and actions can be broadcast
- Game data structure supports multiplayer state management
- Each template includes `gameData` and `setGameData` props for state management

## Development Guidelines

### Performance
- Use `useMemo` and `useState` to pre-calculate random values
- Avoid `Math.random()` in render loops
- Implement efficient collision detection
- Use object pooling for frequently created/destroyed objects

### Code Organization
- Keep game logic in the game file
- Use shared utilities in `client/src/lib/`
- Follow consistent naming conventions
- Comment complex physics calculations

### Controls
- Always provide multiple key options (WASD + arrows)
- Include ESC key handling for menu return
- Display controls in the UI
- Test controls for responsiveness

## Files Overview

```
client/src/
├── games/
│   ├── platformer.tsx     # Jump physics and platforms
│   ├── racing.tsx         # Car physics and racing track
│   ├── shooter.tsx        # Bullet system and combat
│   ├── puzzle.tsx         # Interactive objects and puzzles
│   ├── driving.tsx        # Original driving game
│   └── sandbox.tsx        # Creative sandbox mode
├── lib/
│   ├── gameRegistry.ts    # Central game registration
│   ├── controls.ts        # Shared control utilities
│   └── physics.ts         # Shared physics utilities
└── SimpleApp.tsx          # Open world demo and menu system
```

Each template is completely functional and can be extended or modified to create your own unique games!