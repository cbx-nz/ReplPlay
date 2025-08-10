import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { KeyboardControls, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

// Puzzle controls
enum PuzzleControls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  interact = 'interact',
}

const puzzleControls = [
  { name: PuzzleControls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: PuzzleControls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: PuzzleControls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: PuzzleControls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: PuzzleControls.interact, keys: ['KeyE', 'Space'] },
];

// Movable box component
function MovableBox({ position, onMove, id }: any) {
  const boxRef = useRef<THREE.Mesh>(null);
  const [isSelected, setIsSelected] = useState(false);

  return (
    <mesh 
      ref={boxRef} 
      position={position} 
      castShadow 
      receiveShadow
      onClick={() => setIsSelected(!isSelected)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial 
        color={isSelected ? "#FFD700" : "#8B4513"} 
        emissive={isSelected ? "#332200" : "#000000"}
      />
    </mesh>
  );
}

// Pressure plate component
function PressurePlate({ position, isActivated }: any) {
  return (
    <mesh position={[position[0], position[1] - 0.4, position[2]]} receiveShadow>
      <cylinderGeometry args={[0.8, 0.8, 0.2]} />
      <meshLambertMaterial 
        color={isActivated ? "#00FF00" : "#FF4444"}
        emissive={isActivated ? "#003300" : "#330000"}
      />
    </mesh>
  );
}

// Switch component
function Switch({ position, isActivated, onToggle }: any) {
  return (
    <group position={position}>
      {/* Switch base */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshLambertMaterial color="#666666" />
      </mesh>
      {/* Switch button */}
      <mesh 
        position={[0, 1.2, 0]} 
        castShadow
        onClick={onToggle}
      >
        <sphereGeometry args={[0.2]} />
        <meshLambertMaterial 
          color={isActivated ? "#00FF00" : "#FF0000"}
          emissive={isActivated ? "#003300" : "#330000"}
        />
      </mesh>
    </group>
  );
}

// Door component
function Door({ position, isOpen }: any) {
  const doorRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (doorRef.current) {
      const targetY = isOpen ? 3 : 0;
      doorRef.current.position.y = THREE.MathUtils.lerp(doorRef.current.position.y, targetY, 0.1);
    }
  });

  return (
    <group ref={doorRef} position={position}>
      <mesh castShadow>
        <boxGeometry args={[3, 3, 0.5]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

// Puzzle player
function PuzzlePlayer({ gameData, setGameData }: any) {
  const playerRef = useRef<THREE.Group>(null);
  const [subscribe, getState] = useKeyboardControls<PuzzleControls>();
  const speed = 5;

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const controls = getState();
    const player = playerRef.current;
    const moveVector = new THREE.Vector3();

    // Movement
    if (controls.forward) moveVector.z -= 1;
    if (controls.backward) moveVector.z += 1;
    if (controls.left) moveVector.x -= 1;
    if (controls.right) moveVector.x += 1;

    if (moveVector.length() > 0) {
      moveVector.normalize();
      const newPosition = player.position.clone().add(moveVector.multiplyScalar(speed * delta));
      
      // Simple wall collision (keep within room bounds)
      if (Math.abs(newPosition.x) < 12 && Math.abs(newPosition.z) < 12) {
        player.position.copy(newPosition);
      }
      
      // Face movement direction
      if (moveVector.length() > 0.1) {
        const targetRotation = Math.atan2(moveVector.x, moveVector.z);
        player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRotation, 5 * delta);
      }
    }

    // Camera follow
    const cameraTarget = new THREE.Vector3(
      player.position.x,
      player.position.y + 8,
      player.position.z + 8
    );
    state.camera.position.lerp(cameraTarget, 0.1);
    state.camera.lookAt(player.position);
  });

  return (
    <group ref={playerRef} position={[0, 0.5, 8]}>
      {/* Player body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.4, 1]} />
        <meshLambertMaterial color="#4CAF50" />
      </mesh>
      {/* Player head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.3]} />
        <meshLambertMaterial color="#FDB726" />
      </mesh>
    </group>
  );
}

// Puzzle room environment
function PuzzleRoom({ gameData, setGameData }: any) {
  const [switches, setSwitches] = useState([false, false, false]);
  const [boxes] = useState([
    { id: 1, position: [3, 0.5, 3] },
    { id: 2, position: [-3, 0.5, 3] },
    { id: 3, position: [0, 0.5, 6] },
  ]);

  const toggleSwitch = (index: number) => {
    setSwitches(prev => {
      const newSwitches = [...prev];
      newSwitches[index] = !newSwitches[index];
      return newSwitches;
    });
  };

  const allSwitchesActivated = switches.every(s => s);

  return (
    <>
      {/* Room floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshLambertMaterial color="#E0E0E0" />
      </mesh>
      
      {/* Room walls */}
      <mesh position={[0, 2.5, -13]} castShadow>
        <boxGeometry args={[26, 5, 1]} />
        <meshLambertMaterial color="#CCCCCC" />
      </mesh>
      <mesh position={[0, 2.5, 13]} castShadow>
        <boxGeometry args={[26, 5, 1]} />
        <meshLambertMaterial color="#CCCCCC" />
      </mesh>
      <mesh position={[-13, 2.5, 0]} castShadow>
        <boxGeometry args={[1, 5, 26]} />
        <meshLambertMaterial color="#CCCCCC" />
      </mesh>
      <mesh position={[13, 2.5, 0]} castShadow>
        <boxGeometry args={[1, 5, 26]} />
        <meshLambertMaterial color="#CCCCCC" />
      </mesh>
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshLambertMaterial color="#F0F0F0" />
      </mesh>
      
      {/* Movable boxes */}
      {boxes.map(box => (
        <MovableBox
          key={box.id}
          position={box.position}
          id={box.id}
        />
      ))}
      
      {/* Pressure plates */}
      <PressurePlate position={[5, 0, -5]} isActivated={switches[0]} />
      <PressurePlate position={[-5, 0, -5]} isActivated={switches[1]} />
      <PressurePlate position={[0, 0, -8]} isActivated={switches[2]} />
      
      {/* Switches */}
      <Switch 
        position={[8, 0, 8]} 
        isActivated={switches[0]} 
        onToggle={() => toggleSwitch(0)}
      />
      <Switch 
        position={[-8, 0, 8]} 
        isActivated={switches[1]} 
        onToggle={() => toggleSwitch(1)}
      />
      <Switch 
        position={[0, 0, 10]} 
        isActivated={switches[2]} 
        onToggle={() => toggleSwitch(2)}
      />
      
      {/* Exit door */}
      <Door position={[0, 1.5, -12.5]} isOpen={allSwitchesActivated} />
      
      {/* Goal indicator */}
      {allSwitchesActivated && (
        <mesh position={[0, 2, -10]} castShadow>
          <sphereGeometry args={[0.5]} />
          <meshLambertMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
        </mesh>
      )}
    </>
  );
}

function PuzzleGame({ gameData, setGameData }: any) {
  return (
    <KeyboardControls map={puzzleControls}>
      <PuzzleRoom gameData={gameData} setGameData={setGameData} />
      <PuzzlePlayer gameData={gameData} setGameData={setGameData} />
    </KeyboardControls>
  );
}

export const puzzleGameConfig = {
  name: "Puzzle Chamber",
  description: "Solve puzzles by activating switches and moving objects",
  component: PuzzleGame,
  init: () => ({
    switchesActivated: 0,
    totalSwitches: 3,
    puzzleSolved: false
  })
};