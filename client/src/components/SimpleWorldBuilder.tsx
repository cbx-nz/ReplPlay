import { useState, useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useKeyboardControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { Controls } from "../lib/controls";

export interface WorldObject {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  material?: string;
  metadata?: any;
}

interface SimpleWorldBuilderProps {
  objects: WorldObject[];
  onObjectsChange: (objects: WorldObject[]) => void;
  isBuilding: boolean;
  selectedTool: string;
}

interface ObjectTypeConfig {
  name: string;
  geometry: JSX.Element;
  defaultScale: [number, number, number];
}

const objectTypes: Record<string, ObjectTypeConfig> = {
  cube: {
    name: "Cube",
    geometry: <boxGeometry args={[1, 1, 1]} />,
    defaultScale: [1, 1, 1]
  },
  sphere: {
    name: "Sphere", 
    geometry: <sphereGeometry args={[0.5]} />,
    defaultScale: [1, 1, 1]
  },
  cylinder: {
    name: "Cylinder",
    geometry: <cylinderGeometry args={[0.5, 0.5, 1]} />,
    defaultScale: [1, 1, 1]
  },
  plane: {
    name: "Plane",
    geometry: <planeGeometry args={[2, 2]} />,
    defaultScale: [1, 1, 1]
  },
  cone: {
    name: "Cone",
    geometry: <coneGeometry args={[0.5, 1]} />,
    defaultScale: [1, 1, 1]
  }
};

const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F39C12", "#E74C3C", "#3498DB",
  "#2ECC71", "#9B59B6", "#F1C40F", "#E67E22", "#95A5A6"
];

function BuildableObject({ 
  object, 
  isSelected, 
  onSelect, 
  onDelete
}: { 
  object: WorldObject;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const config = objectTypes[object.type];
  if (!config) return null;

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      // Add a subtle pulsing effect for selected objects
      const time = state.clock.getElapsedTime();
      meshRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        {config.geometry}
        <meshLambertMaterial 
          color={hovered ? "#FFD700" : object.color}
          transparent={isSelected}
          opacity={isSelected ? 0.8 : 1.0}
        />
      </mesh>
      
      {isSelected && (
        <group position={object.position}>
          <Text
            position={[0, 2, 0]}
            fontSize={0.3}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
          >
            {config.name}
          </Text>
          
          {/* Delete button */}
          <mesh
            position={[0, 1.5, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <sphereGeometry args={[0.2]} />
            <meshLambertMaterial color="#FF0000" />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function SimpleWorldBuilder({ 
  objects, 
  onObjectsChange, 
  isBuilding, 
  selectedTool 
}: SimpleWorldBuilderProps) {
  const { camera, raycaster, pointer } = useThree();
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [previewObject, setPreviewObject] = useState<{
    position: [number, number, number];
    type: string;
  } | null>(null);

  // Handle ground click for placing objects
  const handleGroundClick = (event: any) => {
    if (!isBuilding || !selectedTool) return;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects([event.object]);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      
      const newObject: WorldObject = {
        id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: selectedTool,
        position: [point.x, point.y + 0.5, point.z],
        rotation: [0, 0, 0],
        scale: objectTypes[selectedTool]?.defaultScale || [1, 1, 1],
        color: colors[Math.floor(Math.random() * colors.length)],
        material: "standard"
      };
      
      onObjectsChange([...objects, newObject]);
    }
  };

  // Handle object selection
  const handleObjectSelect = (objectId: string) => {
    setSelectedObject(selectedObject === objectId ? null : objectId);
  };

  // Handle object deletion
  const handleObjectDelete = (objectId: string) => {
    onObjectsChange(objects.filter(obj => obj.id !== objectId));
    setSelectedObject(null);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedObject) {
        handleObjectDelete(selectedObject);
      } else if (event.key === 'Escape') {
        setSelectedObject(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedObject]);

  // Update preview object position
  useFrame(() => {
    if (isBuilding && selectedTool) {
      raycaster.setFromCamera(pointer, camera);
      
      // Create a temporary ground plane for raycasting
      const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
      groundGeometry.rotateX(-Math.PI / 2);
      const groundMesh = new THREE.Mesh(groundGeometry);
      groundMesh.position.y = 0;
      
      const intersects = raycaster.intersectObject(groundMesh);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        setPreviewObject({
          position: [point.x, point.y + 0.5, point.z],
          type: selectedTool
        });
      }
      
      groundGeometry.dispose();
    } else {
      setPreviewObject(null);
    }
  });

  return (
    <>
      {/* Ground plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
        onClick={handleGroundClick}
      >
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#90EE90" />
      </mesh>

      {/* Existing objects */}
      {objects.map((object) => (
        <BuildableObject
          key={object.id}
          object={object}
          isSelected={selectedObject === object.id}
          onSelect={() => handleObjectSelect(object.id)}
          onDelete={() => handleObjectDelete(object.id)}
        />
      ))}

      {/* Preview object */}
      {previewObject && isBuilding && (
        <mesh
          position={previewObject.position}
          scale={objectTypes[previewObject.type]?.defaultScale || [1, 1, 1]}
        >
          {objectTypes[previewObject.type]?.geometry}
          <meshLambertMaterial color="#FFFFFF" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Grid helper for building mode */}
      {isBuilding && (
        <gridHelper args={[50, 50, "#666666", "#444444"]} />
      )}
    </>
  );
}
