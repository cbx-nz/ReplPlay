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

// Simple ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshLambertMaterial color="#4a5568" />
    </mesh>
  );
}

// Interactive car component with movement
function SimpleCar() {
  const carRef = useRef<THREE.Group>(null);
  const [subscribe, getState] = useKeyboardControls<Controls>();
  
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

    // Keep car in bounds
    car.position.x = Math.max(-45, Math.min(45, car.position.x));
    car.position.z = Math.max(-45, Math.min(45, car.position.z));

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

  // Handle ESC key to return to menu
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape" && gameState === "playing") {
        setGameState("menu");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState]);

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

              <Ground />
              <SimpleCar />
              
              {/* Some basic objects */}
              <mesh position={[10, 1, 10]} castShadow>
                <boxGeometry args={[2, 2, 2]} />
                <meshLambertMaterial color="#8B4513" />
              </mesh>

              <mesh position={[-10, 1, -10]} castShadow>
                <boxGeometry args={[2, 2, 2]} />
                <meshLambertMaterial color="#FF6B6B" />
              </mesh>
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
            
            <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded text-sm">
              3D Game Framework - Press ESC for menu
            </div>
          </>
        )}
      </KeyboardControls>
    </div>
  );
}