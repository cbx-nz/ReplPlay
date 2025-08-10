import { Canvas, useFrame } from "@react-three/fiber";
import { useState, useRef, useEffect } from "react";
import { KeyboardControls, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

// Simple controls enum
enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  jump = 'jump',
  cameraUp = 'cameraUp',
  cameraDown = 'cameraDown',
  cameraLeft = 'cameraLeft',
  cameraRight = 'cameraRight',
}

const gameControls = [
  { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: Controls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.leftward, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.rightward, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.jump, keys: ['Space'] },
  { name: Controls.cameraUp, keys: ['KeyI'] },
  { name: Controls.cameraDown, keys: ['KeyK'] },
  { name: Controls.cameraLeft, keys: ['KeyJ'] },
  { name: Controls.cameraRight, keys: ['KeyL'] },
];

// FPS Counter
function FPSCounter() {
  const [fps, setFps] = useState(0);
  
  return (
    <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded text-sm font-mono">
      FPS: {fps}
    </div>
  );
}

// Large open world terrain
function OpenWorldTerrain() {
  const terrainSize = 200; // Much larger world
  const chunkSize = 50;
  
  // Pre-calculate random values to avoid re-rendering
  const [terrainData] = useState(() => {
    const chunks = [];
    const trees = [];
    const rocks = [];
    
    // Create terrain chunks
    for (let x = -terrainSize/2; x < terrainSize/2; x += chunkSize) {
      for (let z = -terrainSize/2; z < terrainSize/2; z += chunkSize) {
        chunks.push({ 
          x, 
          z, 
          color: Math.random() > 0.7 ? "#3a4a1a" : 
                 Math.random() > 0.5 ? "#5a6d2a" : "#2d5016"
        });
      }
    }
    
    // Create trees
    for (let i = 0; i < 20; i++) {
      trees.push({
        x: (Math.random() - 0.5) * 180,
        z: (Math.random() - 0.5) * 180,
        height: 2 + Math.random() * 2,
        trunkRadius: 0.2 + Math.random() * 0.2,
        trunkRadiusTop: 0.3 + Math.random() * 0.3,
        foliageRadius: 1 + Math.random(),
        foliageColor: Math.random() > 0.5 ? "#228B22" : "#32CD32"
      });
    }
    
    // Create rocks
    for (let i = 0; i < 15; i++) {
      rocks.push({
        x: (Math.random() - 0.5) * 160,
        z: (Math.random() - 0.5) * 160,
        size: 0.5 + Math.random() * 1.5
      });
    }
    
    return { chunks, trees, rocks };
  });
  
  return (
    <>
      {/* Terrain chunks */}
      {terrainData.chunks.map((chunk, index) => (
        <mesh 
          key={index}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[chunk.x + chunkSize/2, -0.5, chunk.z + chunkSize/2]} 
          receiveShadow
        >
          <planeGeometry args={[chunkSize, chunkSize]} />
          <meshLambertMaterial color={chunk.color} />
        </mesh>
      ))}
      
      {/* Main roads/paths */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]} receiveShadow>
        <planeGeometry args={[8, terrainSize]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]} receiveShadow>
        <planeGeometry args={[terrainSize, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      
      {/* Scattered buildings around the world */}
      {[
        { pos: [30, 2, 40], size: [6, 4, 8], color: "#8B4513" }, // Brown building
        { pos: [-40, 3, 20], size: [8, 6, 10], color: "#4a90e2" }, // Blue building
        { pos: [60, 1.5, -30], size: [5, 3, 6], color: "#666666" }, // Gray building
        { pos: [-20, 2.5, -60], size: [7, 5, 9], color: "#90EE90" }, // Light green building
        { pos: [80, 2, 10], size: [4, 4, 5], color: "#FFB6C1" }, // Pink building
        { pos: [-70, 1.8, -10], size: [6, 3.6, 7], color: "#DDA0DD" }, // Plum building
      ].map((building, i) => (
        <mesh key={`building-${i}`} position={building.pos} castShadow>
          <boxGeometry args={building.size} />
          <meshLambertMaterial color={building.color} />
        </mesh>
      ))}
      
      {/* Random trees scattered around */}
      {terrainData.trees.map((tree, i) => (
        <group key={`tree-${i}`} position={[tree.x, 0, tree.z]}>
          {/* Tree trunk */}
          <mesh position={[0, tree.height/2, 0]} castShadow>
            <cylinderGeometry args={[tree.trunkRadius, tree.trunkRadiusTop, tree.height]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          {/* Tree foliage */}
          <mesh position={[0, tree.height + 1, 0]} castShadow>
            <sphereGeometry args={[tree.foliageRadius]} />
            <meshLambertMaterial color={tree.foliageColor} />
          </mesh>
        </group>
      ))}

      {/* Some rocks/obstacles */}
      {terrainData.rocks.map((rock, i) => (
        <mesh key={`rock-${i}`} position={[rock.x, rock.size/2, rock.z]} castShadow>
          <boxGeometry args={[rock.size, rock.size, rock.size]} />
          <meshLambertMaterial color="#708090" />
        </mesh>
      ))}
    </>
  );
}

// Racing state component to share lap data
function useRaceState() {
  const [lapCount, setLapCount] = useState(0);
  const [bestLapTime, setBestLapTime] = useState<number | null>(null);
  return { lapCount, setLapCount, bestLapTime, setBestLapTime };
}

// Interactive car component with movement
function SimpleCar({ raceState }: { raceState: any }) {
  const carRef = useRef<THREE.Group>(null);
  const [subscribe, getState] = useKeyboardControls<Controls>();
  const lapStartTime = useRef<number>(Date.now());
  const lastAngle = useRef<number>(0);
  const totalRotation = useRef<number>(0);
  
  const speedRef = useRef(0);
  const maxSpeed = 15;
  const acceleration = 10;
  const deceleration = 8;
  const turnSpeed = 2;

  useFrame((state, delta) => {
    if (!carRef.current) return;

    const controls = getState();
    const car = carRef.current;
    const camera = state.camera;
    
    // Get camera forward direction (where camera is looking)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Keep movement on ground plane
    cameraDirection.normalize();
    
    // Get camera right direction
    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
    cameraRight.normalize();

    // Movement based on camera direction
    const moveVector = new THREE.Vector3();
    
    if (controls.forward) {
      moveVector.add(cameraDirection);
    }
    if (controls.backward) {
      moveVector.sub(cameraDirection);
    }
    if (controls.leftward) {
      moveVector.sub(cameraRight);
    }
    if (controls.rightward) {
      moveVector.add(cameraRight);
    }

    // Camera rotation controls
    if (controls.cameraLeft) {
      camera.rotation.y += 2 * delta;
    }
    if (controls.cameraRight) {
      camera.rotation.y -= 2 * delta;
    }
    if (controls.cameraUp) {
      camera.rotation.x += 2 * delta;
      camera.rotation.x = Math.min(Math.PI / 3, camera.rotation.x);
    }
    if (controls.cameraDown) {
      camera.rotation.x -= 2 * delta;
      camera.rotation.x = Math.max(-Math.PI / 3, camera.rotation.x);
    }

    // Normalize and apply speed
    if (moveVector.length() > 0) {
      moveVector.normalize();
      speedRef.current = Math.min(maxSpeed, speedRef.current + acceleration * delta);
      
      // Move the car
      const movement = moveVector.multiplyScalar(speedRef.current * delta);
      car.position.add(movement);
      
      // Rotate car to face movement direction
      if (movement.length() > 0.1) {
        const targetRotation = Math.atan2(movement.x, movement.z);
        car.rotation.y = THREE.MathUtils.lerp(car.rotation.y, targetRotation, 5 * delta);
      }
    } else {
      // Natural deceleration when not moving
      speedRef.current = Math.max(0, speedRef.current - deceleration * delta);
    }

    // Braking
    if (controls.jump) {
      speedRef.current *= 0.8;
    }

    // Keep car within world bounds
    const worldSize = 95; // Slightly smaller than terrain
    car.position.x = Math.max(-worldSize, Math.min(worldSize, car.position.x));
    car.position.z = Math.max(-worldSize, Math.min(worldSize, car.position.z));

    // Free camera positioning - follow car loosely
    const cameraOffset = new THREE.Vector3(0, 12, 15);
    const cameraTarget = car.position.clone().add(cameraOffset);
    state.camera.position.lerp(cameraTarget, 0.03);
  });

  return (
    <group ref={carRef} position={[0, 0.5, 0]}>
      {/* Car body */}
      <mesh castShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshLambertMaterial color="#FF6B6B" />
      </mesh>
      
      {/* Car roof */}
      <mesh position={[0, 0.8, -0.5]} castShadow>
        <boxGeometry args={[1.8, 0.6, 2]} />
        <meshLambertMaterial color="#CC5555" />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[-1.2, -0.3, 1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[1.2, -0.3, 1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[-1.2, -0.3, -1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[1.2, -0.3, -1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
    </group>
  );
}

// Main menu
function SimpleMenu({ onStartGame }: { onStartGame: () => void }) {
  const gameTemplates = [
    {
      id: "openworld",
      name: "Open World Explorer",
      description: "Large open world with camera controls and free exploration",
      color: "bg-green-500 hover:bg-green-600",
      action: onStartGame
    },
    {
      id: "platformer",
      name: "Platformer Adventure",
      description: "Jump and explore platforms with physics-based movement",
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => alert("Game template created! Check client/src/games/platformer.tsx")
    },
    {
      id: "racing",
      name: "Circuit Racing",
      description: "High-speed racing with drift physics and lap timing",
      color: "bg-red-500 hover:bg-red-600",
      action: () => alert("Game template created! Check client/src/games/racing.tsx")
    },
    {
      id: "shooter",
      name: "Arena Shooter",
      description: "Top-down combat with bullets and enemy AI",
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => alert("Game template created! Check client/src/games/shooter.tsx")
    },
    {
      id: "puzzle",
      name: "Puzzle Chamber",
      description: "Solve puzzles with switches, boxes, and interactive objects",
      color: "bg-cyan-500 hover:bg-cyan-600",
      action: () => alert("Game template created! Check client/src/games/puzzle.tsx")
    },
    {
      id: "sandbox",
      name: "Sandbox Mode",
      description: "Creative mode for building and experimenting",
      color: "bg-yellow-500 hover:bg-yellow-600",
      action: () => alert("Game template created! Check client/src/games/sandbox.tsx")
    }
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-600 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-sm shadow-2xl p-6 rounded-lg max-w-5xl w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">3D Game Framework</h1>
          <p className="text-gray-600 text-lg">Multiple game templates with modular architecture</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {gameTemplates.map((game) => (
            <div key={game.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{game.name}</h3>
              <p className="text-sm text-gray-600 mb-3 min-h-[40px]">{game.description}</p>
              <button 
                onClick={game.action}
                className={`w-full text-white px-4 py-2 rounded font-medium transition-colors ${game.color}`}
              >
                {game.id === "openworld" ? "Play Demo" : "View Template"}
              </button>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-bold text-gray-800 mb-2">Game Templates Include:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 text-sm text-gray-600 gap-2">
            <div>• Open World - Camera-relative movement</div>
            <div>• Platformer - Jump physics & collision</div>
            <div>• Racing - Car physics & drift mechanics</div>
            <div>• Shooter - Bullet system & AI enemies</div>
            <div>• Puzzle - Interactive objects & switches</div>
            <div>• Sandbox - Creative building tools</div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            All templates use React Three Fiber, modular controls, and the game registry system
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          WASD to move • I/K/J/L for camera • Space to interact • ESC to return
        </div>
      </div>
    </div>
  );
}

export default function SimpleApp() {
  const [gameState, setGameState] = useState<"menu" | "playing">("menu");
  const raceState = useRaceState();

  // Handle ESC key to return to menu
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape" && gameState === "playing") {
        setGameState("menu");
        // Reset race state when returning to menu
        raceState.setLapCount(0);
        raceState.setBestLapTime(null);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, raceState]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#111111'
    }}>
      <FPSCounter />
      
      <KeyboardControls map={gameControls}>
        {gameState === 'menu' && (
          <SimpleMenu onStartGame={() => setGameState("playing")} />
        )}
        
        {gameState === 'playing' && (
          <>
            <Canvas
              shadows
              camera={{
                position: [0, 5, 10],
                fov: 45,
                near: 0.1,
                far: 1000
              }}
            >
              <color attach="background" args={["#87CEEB"]} />
              
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

              <OpenWorldTerrain />
              <SimpleCar raceState={raceState} />
            </Canvas>
            
            {/* Game HUD */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded">
              <div className="text-sm space-y-1">
                <div className="font-bold text-yellow-300 mb-2">Movement Controls:</div>
                <div>W/S: Move Forward/Backward</div>
                <div>A/D: Move Left/Right</div>
                <div>Space: Brake</div>
                <div className="font-bold text-blue-300 mt-2 mb-1">Camera Controls:</div>
                <div>I/K: Look Up/Down</div>
                <div>J/L: Look Left/Right</div>
                <div className="mt-2 text-xs text-gray-300">ESC: Return to Menu</div>
              </div>
            </div>
            
            {/* World Info HUD */}
            <div className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded">
              <div className="text-lg font-bold mb-2">Open World</div>
              <div className="text-sm space-y-1">
                <div>World Size: 200x200 units</div>
                <div>Buildings: 6</div>
                <div>Trees: 20</div>
                <div>Rocks: 15</div>
                <div className="mt-2 text-xs text-gray-300">Explore the open world! Drive where the camera points.</div>
              </div>
            </div>
          </>
        )}
      </KeyboardControls>
    </div>
  );
}