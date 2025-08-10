import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, Text } from "@react-three/drei";
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
  const nameTagRef = useRef<THREE.Group>(null);
  const [subscribe, getState] = useKeyboardControls<Controls>();
  const { sendPlayerUpdate, otherPlayers } = useMultiplayer();
  
  const velocity = useRef(new THREE.Vector3());
  const isGrounded = useRef(true);
  const moveSpeed = 8;
  const jumpForce = 10;

  // For non-local players, update position from multiplayer data
  useEffect(() => {
    if (!isLocalPlayer && meshRef.current && playerId && otherPlayers[playerId]) {
      const playerData = otherPlayers[playerId];
      meshRef.current.position.set(...playerData.position);
      meshRef.current.rotation.set(...playerData.rotation);
    }
  }, [isLocalPlayer, playerId, otherPlayers]);

  useEffect(() => {
    if (meshRef.current && isLocalPlayer) {
      meshRef.current.position.set(...position);
    }
  }, [position, isLocalPlayer]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Only handle controls for local player
    if (isLocalPlayer) {
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
      sendPlayerUpdate({
        position: [mesh.position.x, mesh.position.y, mesh.position.z],
        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]
      });
    }

    // Update name tag to always face camera
    if (nameTagRef.current && state.camera) {
      nameTagRef.current.lookAt(state.camera.position);
    }
  });

  const playerName = isLocalPlayer 
    ? "You" 
    : (playerId ? `Player ${playerId.slice(0, 4)}` : "Player");

  return (
    <group>
      <mesh ref={meshRef} position={position} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshLambertMaterial color={color} />
        
        {/* Head indicator for local player */}
        {isLocalPlayer && (
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.3]} />
            <meshLambertMaterial color="#FFD700" />
          </mesh>
        )}
        
        {/* Name tag for all players */}
        <group ref={nameTagRef} position={[0, 2.5, 0]}>
          <Text
            color={isLocalPlayer ? "#FFD700" : "#FFFFFF"}
            fontSize={0.4}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign="center"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZxhiA.woff"
            anchorX="center"
            anchorY="middle"
          >
            {playerName}
          </Text>
        </group>

        {/* Online indicator for other players */}
        {!isLocalPlayer && (
          <mesh position={[0, 2.8, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshLambertMaterial color="#00FF00" />
          </mesh>
        )}
      </mesh>
    </group>
  );
}
