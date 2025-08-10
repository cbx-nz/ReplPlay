import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function GameCanvas() {
  const meshRef = useRef<THREE.Mesh>(null);
  const grassTexture = useTexture("/textures/grass.png");
  
  // Configure texture
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(20, 20);

  return (
    <>
      {/* Ground plane */}
      <mesh 
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial map={grassTexture} />
      </mesh>

      {/* Some basic environment objects */}
      <mesh position={[10, 1, 10]} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      <mesh position={[-10, 1, -10]} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshLambertMaterial color="#FF6B6B" />
      </mesh>

      <mesh position={[0, 1, -15]} castShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshLambertMaterial color="#4ECDC4" />
      </mesh>
    </>
  );
}
