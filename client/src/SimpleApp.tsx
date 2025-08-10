import { Canvas, useFrame } from "@react-three/fiber";
import { useState, useRef, useEffect } from "react";
import { KeyboardControls, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { UserLogin, UserProfile } from './components/UserSystem';
import { ChatSystem, QuickChat } from './components/ChatSystem';
import { CarCustomizationPanel } from './components/CarCustomization';
import { WorldBuilder } from './components/WorldBuilder';
import { GameRenderer, GameInfo } from './components/GameRenderer';
import { User, ChatMessage, CarCustomization, CustomWorld } from '../../shared/types';

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
export function OpenWorldTerrain() {
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
export function SimpleCar({ 
  raceState, 
  customization, 
  user 
}: { 
  raceState: any; 
  customization?: CarCustomization;
  user?: User;
}) {
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

  const defaultCustomization: CarCustomization = {
    bodyColor: '#FF6B6B',
    roofColor: '#CC5555',
    wheelColor: '#333333',
    bodyType: 'sedan',
    upgrades: { engine: 1, brakes: 1, handling: 1, nitro: 0 }
  };

  const carCustomization = customization || defaultCustomization;

  return (
    <group ref={carRef} position={[0, 0.5, 0]}>
      {/* Player name tag */}
      {user && (
        <mesh position={[0, 3, 0]}>
          <planeGeometry args={[3, 0.5]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          {/* Text would need a text library like troika-three-text */}
        </mesh>
      )}
      
      {/* Car body */}
      <mesh castShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshLambertMaterial color={carCustomization.bodyColor} />
      </mesh>
      
      {/* Car roof */}
      <mesh position={[0, 0.8, -0.5]} castShadow>
        <boxGeometry args={[1.8, 0.6, 2]} />
        <meshLambertMaterial color={carCustomization.roofColor} />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[-1.2, -0.3, 1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color={carCustomization.wheelColor} />
      </mesh>
      <mesh position={[1.2, -0.3, 1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color={carCustomization.wheelColor} />
      </mesh>
      <mesh position={[-1.2, -0.3, -1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color={carCustomization.wheelColor} />
      </mesh>
      <mesh position={[1.2, -0.3, -1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color={carCustomization.wheelColor} />
      </mesh>
      
      {/* Upgrade indicators - visual cues for upgrades */}
      {carCustomization.upgrades.nitro > 0 && (
        <mesh position={[0, 0.2, -2.2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.6]} />
          <meshLambertMaterial color="#FF4500" />
        </mesh>
      )}
    </group>
  );
}

// Main menu
function SimpleMenu({ 
  onStartGame, 
  onSelectGame, 
  selectedGame 
}: { 
  onStartGame: () => void;
  onSelectGame: (gameId: string) => void;
  selectedGame: string;
}) {
  const gameTemplates = [
    {
      id: "openworld",
      name: "Open World Explorer",
      description: "Large open world with camera controls and free exploration",
      color: "bg-green-500 hover:bg-green-600",
      status: "playable"
    },
    {
      id: "platformer",
      name: "Platformer Adventure",
      description: "Jump and explore platforms with physics-based movement",
      color: "bg-purple-500 hover:bg-purple-600",
      status: "playable"
    },
    {
      id: "racing",
      name: "Circuit Racing",
      description: "High-speed racing with drift physics and lap timing",
      color: "bg-red-500 hover:bg-red-600",
      status: "playable"
    },
    {
      id: "shooter",
      name: "Arena Shooter",
      description: "Top-down combat with bullets and enemy AI",
      color: "bg-orange-500 hover:bg-orange-600",
      status: "playable"
    },
    {
      id: "puzzle",
      name: "Puzzle Chamber",
      description: "Solve puzzles with switches, boxes, and interactive objects",
      color: "bg-cyan-500 hover:bg-cyan-600",
      status: "playable"
    },
    {
      id: "sandbox",
      name: "Sandbox Mode",
      description: "Creative mode for building and experimenting",
      color: "bg-yellow-500 hover:bg-yellow-600",
      status: "playable"
    }
  ];

  const selectedTemplate = gameTemplates.find(g => g.id === selectedGame);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-600 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-sm shadow-2xl p-6 rounded-lg max-w-5xl w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">3D Game Framework</h1>
          <p className="text-gray-600 text-lg">Multiple game templates with modular architecture</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {gameTemplates.map((game) => (
            <div 
              key={game.id} 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGame === game.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300'
              }`}
              onClick={() => onSelectGame(game.id)}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">{game.name}</h3>
              <p className="text-sm text-gray-600 mb-3 min-h-[40px]">{game.description}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  game.status === 'playable' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {game.status === 'playable' ? '✓ Playable' : 'Template'}
                </span>
                {selectedGame === game.id && (
                  <span className="text-xs text-blue-600 font-medium">Selected</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Selected Game Info & Play Button */}
        {selectedTemplate && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-bold text-blue-800 mb-2">
              Ready to Play: {selectedTemplate.name}
            </h3>
            <p className="text-blue-700 mb-4">{selectedTemplate.description}</p>
            <button
              onClick={onStartGame}
              className={`w-full text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors ${selectedTemplate.color}`}
            >
              Start {selectedTemplate.name}
            </button>
          </div>
        )}
        
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
  const [gameState, setGameState] = useState<"login" | "menu" | "playing">("login");
  const [selectedGame, setSelectedGame] = useState<string>("openworld");
  const [user, setUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [carCustomization, setCarCustomization] = useState<CarCustomization>({
    bodyColor: '#FF6B6B',
    roofColor: '#CC5555', 
    wheelColor: '#333333',
    bodyType: 'sedan',
    upgrades: { engine: 1, brakes: 1, handling: 1, nitro: 0 }
  });
  const [showCustomization, setShowCustomization] = useState(false);
  const [showWorldBuilder, setShowWorldBuilder] = useState(false);
  const [customWorlds, setCustomWorlds] = useState<CustomWorld[]>([]);
  const raceState = useRaceState();

  // Check for saved user on load
  useEffect(() => {
    const savedUser = localStorage.getItem('gameUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
        setGameState("menu");
      } catch (error) {
        console.error('Error loading saved user:', error);
      }
    }
  }, []);

  // Check for saved car customization
  useEffect(() => {
    if (user) {
      const savedCustomization = localStorage.getItem(`carCustomization_${user.id}`);
      if (savedCustomization) {
        try {
          setCarCustomization(JSON.parse(savedCustomization));
        } catch (error) {
          console.error('Error loading car customization:', error);
        }
      }
    }
  }, [user]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setGameState("menu");
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: 'system',
      username: 'System',
      message: `Welcome ${newUser.username}! Use the chat to communicate with other players.`,
      timestamp: new Date(),
      type: 'system'
    };
    setChatMessages([welcomeMessage]);
  };

  const handleLogout = () => {
    localStorage.removeItem('gameUser');
    setUser(null);
    setGameState("login");
    setChatMessages([]);
  };

  const handleSendMessage = (message: string) => {
    if (!user) return;
    
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      userId: user.id,
      username: user.username,
      message,
      timestamp: new Date(),
      type: 'chat'
    };
    
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleCustomizationChange = (newCustomization: CarCustomization) => {
    setCarCustomization(newCustomization);
    if (user) {
      localStorage.setItem(`carCustomization_${user.id}`, JSON.stringify(newCustomization));
    }
  };

  const handleSaveWorld = (world: CustomWorld) => {
    setCustomWorlds(prev => {
      const existing = prev.find(w => w.id === world.id);
      if (existing) {
        return prev.map(w => w.id === world.id ? world : w);
      } else {
        return [...prev, world];
      }
    });
    
    // Save to localStorage (in real app, this would be server)
    localStorage.setItem('customWorlds', JSON.stringify([...customWorlds, world]));
  };

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
      
      {/* User Login Screen */}
      {gameState === 'login' && (
        <UserLogin onLogin={handleLogin} />
      )}
      
      <KeyboardControls map={gameControls}>
        {/* Main Menu */}
        {gameState === 'menu' && user && (
          <>
            <SimpleMenu 
              onStartGame={() => setGameState("playing")} 
              onSelectGame={setSelectedGame}
              selectedGame={selectedGame}
            />
            <UserProfile user={user} onLogout={handleLogout} />
            
            {/* Menu Actions */}
            <div className="absolute bottom-4 right-4 space-y-2">
              <button
                onClick={() => setShowCustomization(true)}
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Customize Car
              </button>
              <button
                onClick={() => setShowWorldBuilder(true)}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                World Builder
              </button>
            </div>
          </>
        )}
        
        {/* Game View */}
        {gameState === 'playing' && user && (
          <>
            <GameRenderer
              gameType={selectedGame}
              user={user}
              customization={carCustomization}
              raceState={raceState}
            />
            
            {/* User Profile in Game */}
            <UserProfile user={user} onLogout={handleLogout} />
            
            {/* Chat System */}
            <ChatSystem
              user={user}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
            />
            
            {/* Quick Chat */}
            <QuickChat onSendMessage={handleSendMessage} />
            
            {/* Game HUD */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded">
              <div className="text-sm space-y-1">
                <div className="font-bold text-yellow-300 mb-2">Controls:</div>
                <div>W/S: Move Forward/Backward</div>
                <div>A/D: Move Left/Right</div>
                <div>Space: Brake</div>
                <div className="font-bold text-blue-300 mt-2 mb-1">Camera:</div>
                <div>I/K: Look Up/Down</div>
                <div>J/L: Look Left/Right</div>
                <div className="mt-2 text-xs text-gray-300">ESC: Menu</div>
              </div>
              
              <div className="mt-4 pt-2 border-t border-gray-500">
                <button
                  onClick={() => setShowCustomization(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded mb-1 transition-colors"
                >
                  Customize Car
                </button>
                <button
                  onClick={() => setShowWorldBuilder(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
                >
                  World Builder
                </button>
              </div>
            </div>
            
            {/* Game Info HUD */}
            <GameInfo gameType={selectedGame} user={user} />
            
            {/* Car Stats HUD - only show for car-based games */}
            {(selectedGame === 'openworld' || selectedGame === 'racing') && (
              <div className="absolute top-80 right-4 bg-black/70 text-white p-3 rounded">
                <div className="text-lg font-bold mb-2 text-purple-300">
                  {user.username}'s Car
                </div>
                <div className="text-sm space-y-1">
                  <div>Body: <span style={{color: carCustomization.bodyColor}}>●</span></div>
                  <div>Type: {carCustomization.bodyType}</div>
                  <div>Engine: Level {carCustomization.upgrades.engine}</div>
                  <div>Brakes: Level {carCustomization.upgrades.brakes}</div>
                  <div>Handling: Level {carCustomization.upgrades.handling}</div>
                  <div>Nitro: Level {carCustomization.upgrades.nitro}</div>
                </div>
              </div>
            )}
          </>
        )}
      </KeyboardControls>
      
      {/* Car Customization Panel */}
      <CarCustomizationPanel
        customization={carCustomization}
        onChange={handleCustomizationChange}
        onClose={() => setShowCustomization(false)}
        isOpen={showCustomization}
      />
      
      {/* World Builder */}
      <WorldBuilder
        user={user}
        onSave={handleSaveWorld}
        onClose={() => setShowWorldBuilder(false)}
        isOpen={showWorldBuilder}
      />
    </div>
  );
}