import { useState, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { Controls } from "../lib/controls";
import Player from "../components/Player";
import MultiplayerManager from "../components/multiplayer/MultiplayerManager";

interface SandboxGameProps {
  gameData: any;
}

interface GameObject {
  id: string;
  position: [number, number, number];
  type: 'box' | 'sphere' | 'cylinder';
  color: string;
  size: [number, number, number];
}

function InteractiveObject({ object }: { object: GameObject }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const geometry = {
    box: <boxGeometry args={object.size} />,
    sphere: <sphereGeometry args={[object.size[0]]} />,
    cylinder: <cylinderGeometry args={[object.size[0], object.size[1], object.size[2]]} />
  };

  return (
    <mesh
      ref={meshRef}
      position={object.position}
      castShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (meshRef.current) {
          // Simple interaction - make object bounce
          meshRef.current.position.y += 2;
          setTimeout(() => {
            if (meshRef.current) {
              meshRef.current.position.y = object.position[1];
            }
          }, 500);
        }
      }}
    >
      {geometry[object.type]}
      <meshLambertMaterial 
        color={hovered ? '#FFD700' : object.color} 
        transparent={hovered}
        opacity={hovered ? 0.8 : 1.0}
      />
    </mesh>
  );
}

export default function SandboxGame({ gameData }: SandboxGameProps) {
  const { camera } = useThree();
  const [objects, setObjects] = useState<GameObject[]>([
    {
      id: '1',
      position: [5, 1, 5],
      type: 'box',
      color: '#4ECDC4',
      size: [2, 2, 2]
    },
    {
      id: '2',
      position: [-5, 1, -5],
      type: 'sphere',
      color: '#FF6B6B',
      size: [1, 1, 1]
    },
    {
      id: '3',
      position: [0, 1, -8],
      type: 'cylinder',
      color: '#95E1D3',
      size: [1, 3, 8]
    }
  ]);

  const [subscribe, getState] = useKeyboardControls<Controls>();

  // Add new objects on key press
  useFrame(() => {
    const controls = getState();
    
    // Example: Press 'Q' to add a random object (you'd map this to Controls enum)
    // This is just a demonstration of dynamic object creation
  });

  const addRandomObject = () => {
    const types: ('box' | 'sphere' | 'cylinder')[] = ['box', 'sphere', 'cylinder'];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    const newObject: GameObject = {
      id: Date.now().toString(),
      position: [
        (Math.random() - 0.5) * 20,
        2,
        (Math.random() - 0.5) * 20
      ],
      type: types[Math.floor(Math.random() * types.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size: [
        1 + Math.random() * 2,
        1 + Math.random() * 2,
        1 + Math.random() * 2
      ]
    };
    
    setObjects(prev => [...prev, newObject]);
  };

  const removeLastObject = () => {
    setObjects(prev => prev.slice(0, -1));
  };

  return (
    <>
      {/* Render all interactive objects */}
      {objects.map(object => (
        <InteractiveObject key={object.id} object={object} />
      ))}
      
      {/* Local player */}
      <Player isLocalPlayer={true} position={[0, 1, 0]} color="#4A90E2" />
      
      {/* Other players */}
      <MultiplayerManager />
    </>
  );
}

export const sandboxGameConfig = {
  name: "Sandbox Builder",
  description: "Build and interact with 3D objects in an open world",
  component: SandboxGame,
  init: () => ({
    maxObjects: 50,
    allowPhysics: true,
    buildMode: true
  })
};
