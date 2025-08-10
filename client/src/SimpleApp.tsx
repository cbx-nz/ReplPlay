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
}

const gameControls = [
  { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: Controls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.leftward, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.rightward, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.jump, keys: ['Space'] },
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

// Racing track with ground
function RaceTrack() {
  return (
    <>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#2d5016" />
      </mesh>
      
      {/* Track surface - circular track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]} receiveShadow>
        <ringGeometry args={[8, 25, 32]} />
        <meshLambertMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Track markings - center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
        <ringGeometry args={[16, 17, 32]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      
      {/* Inner barriers */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const radius = 6;
        return (
          <mesh 
            key={`inner-${i}`}
            position={[
              Math.cos(angle) * radius, 
              0.5, 
              Math.sin(angle) * radius
            ]}
            castShadow
          >
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshLambertMaterial color="#ff4444" />
          </mesh>
        );
      })}
      
      {/* Outer barriers */}
      {Array.from({ length: 32 }, (_, i) => {
        const angle = (i / 32) * Math.PI * 2;
        const radius = 27;
        return (
          <mesh 
            key={`outer-${i}`}
            position={[
              Math.cos(angle) * radius, 
              0.5, 
              Math.sin(angle) * radius
            ]}
            castShadow
          >
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshLambertMaterial color="#ff4444" />
          </mesh>
        );
      })}
      
      {/* Starting line */}
      <mesh position={[0, -0.46, 16.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 1]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      
      {/* Grandstand */}
      <mesh position={[35, 2, 0]} castShadow>
        <boxGeometry args={[8, 4, 20]} />
        <meshLambertMaterial color="#4a90e2" />
      </mesh>
      
      {/* Pit building */}
      <mesh position={[-35, 1.5, 0]} castShadow>
        <boxGeometry args={[6, 3, 15]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Some trees around the track */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 40;
        return (
          <group key={`tree-${i}`} position={[
            Math.cos(angle) * radius, 
            0, 
            Math.sin(angle) * radius
          ]}>
            {/* Tree trunk */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.5, 3]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
            {/* Tree foliage */}
            <mesh position={[0, 3.5, 0]} castShadow>
              <sphereGeometry args={[2]} />
              <meshLambertMaterial color="#228B22" />
            </mesh>
          </group>
        );
      })}
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
    
    // Acceleration/Deceleration
    if (controls.forward) {
      speedRef.current = Math.min(maxSpeed, speedRef.current + acceleration * delta);
    } else if (controls.backward) {
      speedRef.current = Math.max(-maxSpeed / 2, speedRef.current - acceleration * delta);
    } else {
      // Natural deceleration
      if (speedRef.current > 0) {
        speedRef.current = Math.max(0, speedRef.current - deceleration * delta);
      } else if (speedRef.current < 0) {
        speedRef.current = Math.min(0, speedRef.current + deceleration * delta);
      }
    }

    // Braking
    if (controls.jump) { // Space for brake
      speedRef.current *= 0.9;
    }

    // Steering (only when moving)
    if (Math.abs(speedRef.current) > 0.1) {
      if (controls.leftward) {
        car.rotation.y += turnSpeed * delta * (speedRef.current / maxSpeed);
      }
      if (controls.rightward) {
        car.rotation.y -= turnSpeed * delta * (speedRef.current / maxSpeed);
      }
    }

    // Apply movement
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(car.quaternion);
    forward.multiplyScalar(speedRef.current * delta);
    car.position.add(forward);

    // Keep car on track (circular track collision)
    const distanceFromCenter = Math.sqrt(car.position.x * car.position.x + car.position.z * car.position.z);
    const innerRadius = 8;
    const outerRadius = 25;
    
    if (distanceFromCenter < innerRadius) {
      // Hit inner barrier - push out
      const angle = Math.atan2(car.position.z, car.position.x);
      car.position.x = Math.cos(angle) * innerRadius;
      car.position.z = Math.sin(angle) * innerRadius;
      speedRef.current *= 0.3; // Reduce speed on collision
    } else if (distanceFromCenter > outerRadius) {
      // Hit outer barrier - push in
      const angle = Math.atan2(car.position.z, car.position.x);
      car.position.x = Math.cos(angle) * outerRadius;
      car.position.z = Math.sin(angle) * outerRadius;
      speedRef.current *= 0.3; // Reduce speed on collision
    }

    // Lap detection logic
    const currentAngle = Math.atan2(car.position.z, car.position.x);
    const angleDiff = currentAngle - lastAngle.current;
    
    // Handle angle wrap-around
    let normalizedDiff = angleDiff;
    if (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI;
    if (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;
    
    totalRotation.current += normalizedDiff;
    lastAngle.current = currentAngle;
    
    // Check for completed lap (one full rotation)
    if (Math.abs(totalRotation.current) >= 2 * Math.PI) {
      const lapTime = Date.now() - lapStartTime.current;
      raceState.setLapCount((prev: number) => prev + 1);
      
      if (!raceState.bestLapTime || lapTime < raceState.bestLapTime) {
        raceState.setBestLapTime(lapTime);
      }
      
      totalRotation.current = 0;
      lapStartTime.current = Date.now();
    }

    // Update camera to follow car
    const cameraTarget = new THREE.Vector3(
      car.position.x,
      car.position.y + 5,
      car.position.z + 10
    );
    state.camera.position.lerp(cameraTarget, 0.1);
    state.camera.lookAt(car.position);
  });

  return (
    <group ref={carRef} position={[0, 0.5, 16]}>
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
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-600">
      <div className="bg-white/90 backdrop-blur-sm shadow-2xl p-8 rounded-lg max-w-md w-full mx-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">3D Game Framework</h1>
        <p className="text-gray-600 mb-6">A simple Roblox-like game framework</p>
        
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Driving Game</h3>
            <p className="text-sm text-gray-600 mb-3">Drive a car around a track with realistic physics</p>
            <button 
              onClick={onStartGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Play Game
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          WASD to move • Space to jump • ESC to return to menu
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

              <RaceTrack />
              <SimpleCar raceState={raceState} />
            </Canvas>
            
            {/* Game HUD */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded">
              <div className="text-sm">
                <div>W/S: Accelerate/Reverse</div>
                <div>A/D: Steer Left/Right</div>
                <div>Space: Brake</div>
                <div>ESC: Return to Menu</div>
              </div>
            </div>
            
            {/* Race Info HUD */}
            <div className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded">
              <div className="text-lg font-bold mb-2">Race Info</div>
              <div className="text-sm space-y-1">
                <div>Laps: {raceState.lapCount}</div>
                <div>Best Time: {raceState.bestLapTime ? `${(raceState.bestLapTime / 1000).toFixed(2)}s` : 'N/A'}</div>
                <div className="mt-2 text-xs text-gray-300">Complete laps by driving around the track!</div>
              </div>
            </div>
          </>
        )}
      </KeyboardControls>
    </div>
  );
}