import React from 'react';
import { Canvas } from '@react-three/fiber';
import { User, CarCustomization } from '../../../shared/types';

// Open world components (existing)
import { OpenWorldTerrain, SimpleCar } from '../SimpleApp';

// Temporary placeholder games - will be replaced with actual game templates
function PlatformerGame({ user }: { user: any }) {
  return (
    <>
      {/* Simple platformer environment */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <boxGeometry args={[100, 1, 100]} />
        <meshLambertMaterial color="#8FBC8F" />
      </mesh>
      
      {/* Platforms */}
      <mesh position={[5, 2, 0]} castShadow>
        <boxGeometry args={[3, 0.5, 3]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      <mesh position={[-5, 4, 0]} castShadow>
        <boxGeometry args={[3, 0.5, 3]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      
      {/* Player placeholder */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshLambertMaterial color="#FF6B6B" />
      </mesh>
    </>
  );
}

function RacingGame({ user, customization }: { user: any; customization?: any }) {
  return (
    <>
      {/* Racing track */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[20, 20, 0.2, 32]} />
        <meshLambertMaterial color="#2F2F2F" />
      </mesh>
      
      {/* Track barriers */}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const x = Math.cos(angle) * 25;
        const z = Math.sin(angle) * 25;
        return (
          <mesh key={i} position={[x, 1, z]} castShadow>
            <boxGeometry args={[2, 2, 1]} />
            <meshLambertMaterial color="#FF0000" />
          </mesh>
        );
      })}
      
      {/* Player car */}
      <SimpleCar raceState={{}} customization={customization} user={user} />
    </>
  );
}

function ShooterGame({ user }: { user: any }) {
  return (
    <>
      {/* Arena floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[50, 1, 50]} />
        <meshLambertMaterial color="#404040" />
      </mesh>
      
      {/* Cover objects */}
      <mesh position={[10, 1, 10]} castShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-10, 1, -10]} castShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Player */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 1, 2]} />
        <meshLambertMaterial color="#4169E1" />
      </mesh>
    </>
  );
}

function PuzzleGame({ user }: { user: any }) {
  return (
    <>
      {/* Room floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <meshLambertMaterial color="#F5F5DC" />
      </mesh>
      
      {/* Puzzle elements */}
      <mesh position={[5, 0.5, 5]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color="#FF4500" />
      </mesh>
      <mesh position={[-5, 0.1, -5]} castShadow>
        <cylinderGeometry args={[1, 1, 0.2]} />
        <meshLambertMaterial color="#32CD32" />
      </mesh>
      
      {/* Player */}
      <mesh position={[0, 1, 0]} castShadow>
        <sphereGeometry args={[0.5]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
    </>
  );
}

function SandboxGame({ user }: { user: any }) {
  return (
    <>
      {/* Ground */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[100, 1, 100]} />
        <meshLambertMaterial color="#98FB98" />
      </mesh>
      
      {/* Sample objects */}
      <mesh position={[10, 2, 0]} castShadow>
        <sphereGeometry args={[2]} />
        <meshLambertMaterial color="#FF69B4" />
      </mesh>
      <mesh position={[-10, 1, 0]} castShadow>
        <coneGeometry args={[2, 4]} />
        <meshLambertMaterial color="#00CED1" />
      </mesh>
      
      {/* Player */}
      <mesh position={[0, 1, 0]} castShadow>
        <octahedronGeometry args={[1]} />
        <meshLambertMaterial color="#9370DB" />
      </mesh>
    </>
  );
}

interface GameRendererProps {
  gameType: string;
  user: User;
  customization: CarCustomization;
  raceState: any;
}

export function GameRenderer({ gameType, user, customization, raceState }: GameRendererProps) {
  const renderGame = () => {
    switch (gameType) {
      case 'openworld':
        return (
          <>
            <OpenWorldTerrain />
            <SimpleCar 
              raceState={raceState} 
              customization={customization}
              user={user}
            />
          </>
        );
      
      case 'platformer':
        return <PlatformerGame user={user} />;
      
      case 'racing':
        return <RacingGame user={user} customization={customization} />;
      
      case 'shooter':
        return <ShooterGame user={user} />;
      
      case 'puzzle':
        return <PuzzleGame user={user} />;
      
      case 'sandbox':
        return <SandboxGame user={user} />;
      
      default:
        return (
          <>
            <OpenWorldTerrain />
            <SimpleCar 
              raceState={raceState} 
              customization={customization}
              user={user}
            />
          </>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (gameType) {
      case 'openworld': return '#87CEEB'; // Sky blue
      case 'platformer': return '#E6F3FF'; // Light blue
      case 'racing': return '#B0E0E6'; // Powder blue
      case 'shooter': return '#2F2F2F'; // Dark gray
      case 'puzzle': return '#F0F8FF'; // Alice blue
      case 'sandbox': return '#98FB98'; // Pale green
      default: return '#87CEEB';
    }
  };

  return (
    <Canvas
      shadows
      camera={{
        position: [0, 5, 10],
        fov: 45,
        near: 0.1,
        far: 1000
      }}
    >
      <color attach="background" args={[getBackgroundColor()]} />
      
      {/* Basic lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {renderGame()}
    </Canvas>
  );
}

// Game info component for HUD
export function GameInfo({ gameType, user }: { gameType: string; user: User }) {
  const getGameInfo = () => {
    switch (gameType) {
      case 'openworld':
        return {
          title: 'Open World Explorer',
          stats: [
            'World Size: 200x200 units',
            'Buildings: 6',
            'Trees: 20',
            'Rocks: 15'
          ],
          tip: 'Explore the open world! Drive where the camera points.'
        };
      
      case 'platformer':
        return {
          title: 'Platformer Adventure',
          stats: [
            'Platforms: 8 levels',
            'Collectibles: 12 coins',
            'Jump Height: 3 units',
            'Gravity: Active'
          ],
          tip: 'Jump between platforms and collect all coins!'
        };
      
      case 'racing':
        return {
          title: 'Circuit Racing',
          stats: [
            'Track Length: 500m',
            'Lap Record: --:--',
            'Current Lap: 1',
            'Drift Mode: Enabled'
          ],
          tip: 'Race around the track! Drift for better handling.'
        };
      
      case 'shooter':
        return {
          title: 'Arena Shooter',
          stats: [
            'Arena Size: 50x50',
            'Ammo: Unlimited',
            'Enemies: 0 active',
            'Score: 0'
          ],
          tip: 'Shoot targets and avoid enemy fire!'
        };
      
      case 'puzzle':
        return {
          title: 'Puzzle Chamber',
          stats: [
            'Switches: 0/3 activated',
            'Boxes: 3 movable',
            'Doors: 1 locked',
            'Goal: Unlock exit'
          ],
          tip: 'Solve puzzles by activating all switches!'
        };
      
      case 'sandbox':
        return {
          title: 'Sandbox Mode',
          stats: [
            'Build Mode: Active',
            'Objects: Unlimited',
            'Terrain: Editable',
            'Physics: Real-time'
          ],
          tip: 'Create and experiment with objects!'
        };
      
      default:
        return {
          title: 'Game Mode',
          stats: ['Loading...'],
          tip: 'Enjoy the game!'
        };
    }
  };

  const info = getGameInfo();

  return (
    <div className="absolute top-20 right-4 bg-black/70 text-white p-3 rounded max-w-xs">
      <div className="text-lg font-bold mb-2 text-blue-300">
        {info.title}
      </div>
      <div className="text-sm space-y-1 mb-3">
        {info.stats.map((stat, index) => (
          <div key={index}>{stat}</div>
        ))}
      </div>
      <div className="text-xs text-gray-300 italic">
        {info.tip}
      </div>
    </div>
  );
}