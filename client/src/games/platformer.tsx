import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { KeyboardControls, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

// Simple controls for platformer
enum PlatformerControls {
  left = 'left',
  right = 'right',
  jump = 'jump',
}

const platformerControls = [
  { name: PlatformerControls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: PlatformerControls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: PlatformerControls.jump, keys: ['Space', 'KeyW', 'ArrowUp'] },
];

// Player component with jump physics
function Player() {
  const playerRef = useRef<THREE.Group>(null);
  const [subscribe, getState] = useKeyboardControls<PlatformerControls>();
  const velocityRef = useRef({ x: 0, y: 0 });
  const isGroundedRef = useRef(true);
  
  const moveSpeed = 8;
  const jumpForce = 12;
  const gravity = -25;

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const controls = getState();
    const player = playerRef.current;
    const velocity = velocityRef.current;

    // Horizontal movement
    velocity.x = 0;
    if (controls.left) velocity.x = -moveSpeed;
    if (controls.right) velocity.x = moveSpeed;

    // Jumping
    if (controls.jump && isGroundedRef.current) {
      velocity.y = jumpForce;
      isGroundedRef.current = false;
    }

    // Apply gravity
    velocity.y += gravity * delta;

    // Update position
    player.position.x += velocity.x * delta;
    player.position.y += velocity.y * delta;

    // Ground collision (simple floor at y = 0.5)
    if (player.position.y <= 0.5) {
      player.position.y = 0.5;
      velocity.y = 0;
      isGroundedRef.current = true;
    }

    // Platform collision (simple collision with platforms)
    const platforms = [
      { x: 10, y: 3, width: 6, height: 1 },
      { x: -10, y: 5, width: 6, height: 1 },
      { x: 0, y: 8, width: 4, height: 1 },
      { x: 20, y: 6, width: 8, height: 1 },
    ];

    platforms.forEach(platform => {
      const distX = Math.abs(player.position.x - platform.x);
      const distY = Math.abs(player.position.y - platform.y);
      
      if (distX < platform.width/2 && distY < platform.height/2 + 0.5) {
        if (velocity.y <= 0 && player.position.y > platform.y) {
          player.position.y = platform.y + platform.height/2 + 0.5;
          velocity.y = 0;
          isGroundedRef.current = true;
        }
      }
    });

    // Keep player in bounds
    player.position.x = Math.max(-30, Math.min(30, player.position.x));

    // Update camera to follow player
    const cameraTarget = new THREE.Vector3(
      player.position.x,
      player.position.y + 3,
      15
    );
    state.camera.position.lerp(cameraTarget, 0.1);
    state.camera.lookAt(player.position.x, player.position.y + 2, 0);
  });

  return (
    <group ref={playerRef} position={[0, 0.5, 0]}>
      {/* Player body */}
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color="#4CAF50" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.2, 0.2, 0.5]} castShadow>
        <sphereGeometry args={[0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.2, 0.2, 0.5]} castShadow>
        <sphereGeometry args={[0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
    </group>
  );
}

// Platform world
function PlatformWorld() {
  const platforms = [
    { pos: [10, 3, 0], size: [6, 1, 2], color: "#8B4513" },
    { pos: [-10, 5, 0], size: [6, 1, 2], color: "#8B4513" },
    { pos: [0, 8, 0], size: [4, 1, 2], color: "#8B4513" },
    { pos: [20, 6, 0], size: [8, 1, 2], color: "#8B4513" },
    { pos: [-20, 4, 0], size: [5, 1, 2], color: "#8B4513" },
  ];

  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 20]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
      
      {/* Platforms */}
      {platforms.map((platform, i) => (
        <mesh key={i} position={platform.pos} castShadow receiveShadow>
          <boxGeometry args={platform.size} />
          <meshLambertMaterial color={platform.color} />
        </mesh>
      ))}
      
      {/* Collectibles */}
      {Array.from({ length: 8 }, (_, i) => {
        const positions = [
          [5, 2, 0], [15, 4, 0], [-5, 6, 0], [2, 9, 0], 
          [25, 7, 0], [-15, 6, 0], [-25, 5, 0], [18, 8, 0]
        ];
        return (
          <mesh key={`coin-${i}`} position={positions[i]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.1]} />
            <meshLambertMaterial color="#FFD700" />
          </mesh>
        );
      })}
      
      {/* Background elements */}
      <mesh position={[0, 10, -5]} castShadow>
        <sphereGeometry args={[2]} />
        <meshLambertMaterial color="#87CEEB" />
      </mesh>
    </>
  );
}

function PlatformerGame() {
  return (
    <KeyboardControls map={platformerControls}>
      <PlatformWorld />
      <Player />
    </KeyboardControls>
  );
}

export const platformerGameConfig = {
  name: "Platformer Adventure",
  description: "Jump and explore platforms in this side-scrolling adventure",
  component: PlatformerGame,
  init: () => ({
    score: 0,
    lives: 3,
    level: 1
  })
};