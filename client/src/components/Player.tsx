import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { Controls } from "../lib/controls";
import { useMultiplayer } from "../lib/stores/useMultiplayer";

interface PlayerProps {
  isLocalPlayer?: boolean;
  position?: [number, number, number];
  color?: string;
  playerId?: string;
}

export default function Player({ 
  isLocalPlayer = false, 
  position = [0, 1, 0], 
  color = "#4A90E2",
  playerId 
}: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [subscribe, getState] = useKeyboardControls<Controls>();
  const { sendPlayerUpdate } = useMultiplayer();
  
  const velocity = useRef(new THREE.Vector3());
  const isGrounded = useRef(true);
  const moveSpeed = 8;
  const jumpForce = 10;

  useEffect(() => {
    if (meshRef.current && isLocalPlayer) {
      meshRef.current.position.set(...position);
    }
  }, [position, isLocalPlayer]);

  useFrame((state, delta) => {
    if (!meshRef.current || !isLocalPlayer) return;

    const controls = getState();
    const mesh = meshRef.current;
    
    // Movement
    const moveVector = new THREE.Vector3();
    
    if (controls.forward) {
      moveVector.z -= 1;
    }
    if (controls.backward) {
      moveVector.z += 1;
    }
    if (controls.leftward) {
      moveVector.x -= 1;
    }
    if (controls.rightward) {
      moveVector.x += 1;
    }
    
    // Normalize movement vector
    if (moveVector.length() > 0) {
      moveVector.normalize();
      moveVector.multiplyScalar(moveSpeed * delta);
      mesh.position.add(moveVector);
    }
    
    // Jumping
    if (controls.jump && isGrounded.current) {
      velocity.current.y = jumpForce;
      isGrounded.current = false;
    }
    
    // Apply gravity
    velocity.current.y += -25 * delta; // gravity
    mesh.position.y += velocity.current.y * delta;
    
    // Ground collision
    if (mesh.position.y <= 1) {
      mesh.position.y = 1;
      velocity.current.y = 0;
      isGrounded.current = true;
    }
    
    // Boundary checks
    mesh.position.x = Math.max(-45, Math.min(45, mesh.position.x));
    mesh.position.z = Math.max(-45, Math.min(45, mesh.position.z));

    // Send position to multiplayer server
    if (isLocalPlayer) {
      sendPlayerUpdate({
        position: [mesh.position.x, mesh.position.y, mesh.position.z],
        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]
      });
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[1, 2, 1]} />
      <meshLambertMaterial color={color} />
      {isLocalPlayer && (
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.3]} />
          <meshLambertMaterial color="#FFD700" />
        </mesh>
      )}
    </mesh>
  );
}
