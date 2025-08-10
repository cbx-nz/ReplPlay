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
  const [buildMode, setBuildMode] = useState(true);

  const [subscribe, getState] = useKeyboardControls<Controls>();

  // Add functionality to the building tools
  useFrame(() => {
    const controls = getState();
    
    // Key shortcuts for building (you'd map these properly in the Controls enum)
    // Q = Add object, R = Remove last object
  });

  const addRandomObject = () => {
    const types: ('box' | 'sphere' | 'cylinder')[] = ['box', 'sphere', 'cylinder'];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98'];
    
    const newObject: GameObject = {
      id: Date.now().toString(),
      position: [
        (Math.random() - 0.5) * 20,
        2 + Math.random() * 3,
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

  const clearAllObjects = () => {
    setObjects([]);
  };

  // Handle click on ground to place objects
  const handleGroundClick = (event: any) => {
    if (!buildMode) return;
    
    const intersectionPoint = event.point;
    if (intersectionPoint) {
      const types: ('box' | 'sphere' | 'cylinder')[] = ['box', 'sphere', 'cylinder'];
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
      
      const newObject: GameObject = {
        id: Date.now().toString(),
        position: [intersectionPoint.x, intersectionPoint.y + 1, intersectionPoint.z],
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: [1, 1, 1]
      };
      
      setObjects(prev => [...prev, newObject]);
    }
  };

  return (
    <>
      {/* Ground plane for placing objects */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
        onClick={handleGroundClick}
      >
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial color="#90EE90" transparent opacity={0.8} />
      </mesh>
      
      {/* Render all interactive objects */}
      {objects.map(object => (
        <InteractiveObject key={object.id} object={object} />
      ))}
      
      {/* Building tools UI elements - these will be controlled by the buttons in App.tsx */}
      {buildMode && (
        <group>
          {/* Visual indicators for build mode */}
          <mesh position={[0, 10, 0]}>
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </group>
      )}
      
      {/* Local player */}
      <Player isLocalPlayer={true} position={[0, 1, 0]} color="#4A90E2" />
      
      {/* Other players */}
      <MultiplayerManager />
      
      {/* Expose functions to parent component for button controls */}
      {typeof window !== 'undefined' && (
        <>
          {(window as any).sandboxControls = {
            addRandomObject,
            removeLastObject,
            clearAllObjects,
            toggleBuildMode: () => setBuildMode(!buildMode),
            objectCount: objects.length
          }}
        </>
      )}
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
