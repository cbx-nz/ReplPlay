import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { KeyboardControls, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

// Shooter controls
enum ShooterControls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  shoot = 'shoot',
}

const shooterControls = [
  { name: ShooterControls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: ShooterControls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: ShooterControls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: ShooterControls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: ShooterControls.shoot, keys: ['Space'] },
];

// Bullet system
function Bullet({ position, direction, onHit }: any) {
  const bulletRef = useRef<THREE.Mesh>(null);
  const speed = 30;
  const lifetime = 3;
  const [age, setAge] = useState(0);

  useFrame((state, delta) => {
    if (!bulletRef.current) return;
    
    // Move bullet
    bulletRef.current.position.add(direction.clone().multiplyScalar(speed * delta));
    
    // Age bullet
    setAge(prev => prev + delta);
    if (age > lifetime) {
      onHit();
    }
    
    // Check bounds
    const pos = bulletRef.current.position;
    if (Math.abs(pos.x) > 50 || Math.abs(pos.z) > 50) {
      onHit();
    }
  });

  return (
    <mesh ref={bulletRef} position={position} castShadow>
      <sphereGeometry args={[0.1]} />
      <meshLambertMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={0.3} />
    </mesh>
  );
}

// Enemy system
function Enemy({ position, onDestroy }: any) {
  const enemyRef = useRef<THREE.Group>(null);
  const [health, setHealth] = useState(3);
  const speed = 2;

  useFrame((state, delta) => {
    if (!enemyRef.current) return;
    
    // Simple AI - move toward center
    const direction = new THREE.Vector3(0, 0, 0).sub(enemyRef.current.position);
    direction.y = 0;
    direction.normalize();
    
    enemyRef.current.position.add(direction.multiplyScalar(speed * delta));
    enemyRef.current.lookAt(0, enemyRef.current.position.y, 0);
  });

  if (health <= 0) {
    onDestroy();
    return null;
  }

  return (
    <group ref={enemyRef} position={position}>
      {/* Enemy body */}
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color="#FF4444" />
      </mesh>
      {/* Health indicator */}
      <mesh position={[0, 1, 0]}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial color={health > 1 ? "#00FF00" : "#FF0000"} />
      </mesh>
    </group>
  );
}

// Player for shooter
function ShooterPlayer({ gameData, setGameData }: any) {
  const playerRef = useRef<THREE.Group>(null);
  const [subscribe, getState] = useKeyboardControls<ShooterControls>();
  const lastShotTime = useRef(0);
  const [bullets, setBullets] = useState<any[]>([]);
  const speed = 8;
  const shotCooldown = 0.2;

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
      player.position.add(moveVector.multiplyScalar(speed * delta));
      player.lookAt(player.position.x + moveVector.x, player.position.y, player.position.z + moveVector.z);
    }

    // Shooting
    if (controls.shoot && state.clock.elapsedTime - lastShotTime.current > shotCooldown) {
      const bulletDir = new THREE.Vector3(0, 0, -1);
      bulletDir.applyQuaternion(player.quaternion);
      
      const newBullet = {
        id: Date.now(),
        position: player.position.clone().add(new THREE.Vector3(0, 0, 0)),
        direction: bulletDir
      };
      
      setBullets(prev => [...prev, newBullet]);
      lastShotTime.current = state.clock.elapsedTime;
    }

    // Keep in bounds
    player.position.x = Math.max(-25, Math.min(25, player.position.x));
    player.position.z = Math.max(-25, Math.min(25, player.position.z));

    // Camera follow
    const cameraTarget = new THREE.Vector3(
      player.position.x,
      player.position.y + 8,
      player.position.z + 12
    );
    state.camera.position.lerp(cameraTarget, 0.1);
    state.camera.lookAt(player.position);
  });

  const removeBullet = (bulletId: number) => {
    setBullets(prev => prev.filter(b => b.id !== bulletId));
  };

  return (
    <group>
      <group ref={playerRef} position={[0, 0.5, 0]}>
        {/* Player tank body */}
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.8, 2]} />
          <meshLambertMaterial color="#4CAF50" />
        </mesh>
        {/* Tank turret */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3]} />
          <meshLambertMaterial color="#2E7D32" />
        </mesh>
        {/* Tank barrel */}
        <mesh position={[0, 0.5, -1]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 1]} />
          <meshLambertMaterial color="#1B5E20" />
        </mesh>
      </group>
      
      {/* Render bullets */}
      {bullets.map(bullet => (
        <Bullet
          key={bullet.id}
          position={bullet.position}
          direction={bullet.direction}
          onHit={() => removeBullet(bullet.id)}
        />
      ))}
    </group>
  );
}

// Arena environment
function ShooterArena() {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      
      {/* Arena walls */}
      <mesh position={[0, 2, -30]} castShadow>
        <boxGeometry args={[60, 4, 1]} />
        <meshLambertMaterial color="#888888" />
      </mesh>
      <mesh position={[0, 2, 30]} castShadow>
        <boxGeometry args={[60, 4, 1]} />
        <meshLambertMaterial color="#888888" />
      </mesh>
      <mesh position={[-30, 2, 0]} castShadow>
        <boxGeometry args={[1, 4, 60]} />
        <meshLambertMaterial color="#888888" />
      </mesh>
      <mesh position={[30, 2, 0]} castShadow>
        <boxGeometry args={[1, 4, 60]} />
        <meshLambertMaterial color="#888888" />
      </mesh>
      
      {/* Cover objects */}
      {[
        { pos: [10, 1, 10], size: [3, 2, 3] },
        { pos: [-10, 1, -10], size: [3, 2, 3] },
        { pos: [15, 1, -15], size: [2, 2, 4] },
        { pos: [-15, 1, 15], size: [4, 2, 2] },
      ].map((cover, i) => (
        <mesh key={i} position={cover.pos} castShadow receiveShadow>
          <boxGeometry args={cover.size} />
          <meshLambertMaterial color="#666666" />
        </mesh>
      ))}
    </>
  );
}

function ShooterGame({ gameData, setGameData }: any) {
  return (
    <KeyboardControls map={shooterControls}>
      <ShooterArena />
      <ShooterPlayer gameData={gameData} setGameData={setGameData} />
    </KeyboardControls>
  );
}

export const shooterGameConfig = {
  name: "Arena Shooter",
  description: "Fight enemies in a top-down arena shooter",
  component: ShooterGame,
  init: () => ({
    score: 0,
    ammo: 100,
    health: 100,
    enemies: []
  })
};