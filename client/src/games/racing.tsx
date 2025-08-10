import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { KeyboardControls, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

// Racing controls
enum RacingControls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  brake = 'brake',
}

const racingControls = [
  { name: RacingControls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: RacingControls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: RacingControls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: RacingControls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: RacingControls.brake, keys: ['Space'] },
];

// Racing car component
function RacingCar({ gameData, setGameData }: any) {
  const carRef = useRef<THREE.Group>(null);
  const [subscribe, getState] = useKeyboardControls<RacingControls>();
  const speedRef = useRef(0);
  const velocityRef = useRef(new THREE.Vector3());
  
  const maxSpeed = 25;
  const acceleration = 15;
  const deceleration = 8;
  const turnSpeed = 2.5;
  const drift = 0.95;

  useFrame((state, delta) => {
    if (!carRef.current) return;

    const controls = getState();
    const car = carRef.current;
    const velocity = velocityRef.current;

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
    if (controls.brake) {
      speedRef.current *= 0.85;
    }

    // Steering (with speed-based responsiveness)
    if (Math.abs(speedRef.current) > 0.1) {
      const steerFactor = Math.min(1, Math.abs(speedRef.current) / 10);
      if (controls.left) {
        car.rotation.y += turnSpeed * steerFactor * delta;
      }
      if (controls.right) {
        car.rotation.y -= turnSpeed * steerFactor * delta;
      }
    }

    // Apply movement with drift physics
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(car.quaternion);
    forward.multiplyScalar(speedRef.current);
    
    // Add drift effect
    velocity.lerp(forward, 1 - Math.pow(drift, delta * 60));
    car.position.add(velocity.clone().multiplyScalar(delta));

    // Track boundaries (circular track)
    const distanceFromCenter = Math.sqrt(car.position.x * car.position.x + car.position.z * car.position.z);
    const innerRadius = 8;
    const outerRadius = 22;
    
    if (distanceFromCenter < innerRadius || distanceFromCenter > outerRadius) {
      const angle = Math.atan2(car.position.z, car.position.x);
      const targetRadius = distanceFromCenter < innerRadius ? innerRadius : outerRadius;
      car.position.x = Math.cos(angle) * targetRadius;
      car.position.z = Math.sin(angle) * targetRadius;
      speedRef.current *= 0.5; // Penalty for hitting barriers
      velocity.multiplyScalar(0.3); // Reduce velocity on collision
    }

    // Update camera for racing view
    const cameraOffset = new THREE.Vector3(0, 6, 12);
    cameraOffset.applyQuaternion(car.quaternion);
    const cameraTarget = car.position.clone().add(cameraOffset);
    
    state.camera.position.lerp(cameraTarget, 0.1);
    state.camera.lookAt(car.position.x, car.position.y + 1, car.position.z);
  });

  return (
    <group ref={carRef} position={[15, 0.3, 0]}>
      {/* Car body */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.8, 3.5]} />
        <meshLambertMaterial color="#FF6B6B" />
      </mesh>
      {/* Car hood */}
      <mesh position={[0, 0.1, -1.2]} castShadow>
        <boxGeometry args={[1.6, 0.3, 1]} />
        <meshLambertMaterial color="#CC5555" />
      </mesh>
      {/* Car roof */}
      <mesh position={[0, 0.6, 0.5]} castShadow>
        <boxGeometry args={[1.6, 0.6, 1.8]} />
        <meshLambertMaterial color="#AA4444" />
      </mesh>
      {/* Wheels */}
      <mesh position={[-1, -0.2, 1.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[1, -0.2, 1.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[-1, -0.2, -1.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[1, -0.2, -1.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      {/* Racing stripes */}
      <mesh position={[0, 0.81, 0]} castShadow>
        <planeGeometry args={[0.3, 3]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

// Racing track
function RaceTrack() {
  return (
    <>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshLambertMaterial color="#2d5016" />
      </mesh>
      
      {/* Track surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]} receiveShadow>
        <ringGeometry args={[8, 22, 64]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      
      {/* Track markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
        <ringGeometry args={[14.8, 15.2, 64]} />
        <meshLambertMaterial color="#FFFF00" />
      </mesh>
      
      {/* Start/finish line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, -0.46, 0]}>
        <planeGeometry args={[14, 1]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Checkered pattern for start line */}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[15 - 7 + i, -0.45, 0]}>
          <planeGeometry args={[1, 0.5]} />
          <meshLambertMaterial color={i % 2 === 0 ? "#000000" : "#FFFFFF"} />
        </mesh>
      ))}
      
      {/* Inner barriers */}
      {Array.from({ length: 32 }, (_, i) => {
        const angle = (i / 32) * Math.PI * 2;
        const radius = 7;
        return (
          <mesh 
            key={`inner-${i}`}
            position={[
              Math.cos(angle) * radius, 
              0.5, 
              Math.sin(angle) * radius
            ]}
            castShadow
          >
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshLambertMaterial color="#FF4444" />
          </mesh>
        );
      })}
      
      {/* Outer barriers */}
      {Array.from({ length: 48 }, (_, i) => {
        const angle = (i / 48) * Math.PI * 2;
        const radius = 23;
        return (
          <mesh 
            key={`outer-${i}`}
            position={[
              Math.cos(angle) * radius, 
              0.5, 
              Math.sin(angle) * radius
            ]}
            castShadow
          >
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshLambertMaterial color="#FF4444" />
          </mesh>
        );
      })}
      
      {/* Spectator stands */}
      <mesh position={[35, 3, 0]} castShadow>
        <boxGeometry args={[8, 6, 25]} />
        <meshLambertMaterial color="#4a90e2" />
      </mesh>
      <mesh position={[-35, 3, 0]} castShadow>
        <boxGeometry args={[8, 6, 25]} />
        <meshLambertMaterial color="#4a90e2" />
      </mesh>
      
      {/* Track-side objects */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 28;
        return (
          <group key={`trackside-${i}`} position={[
            Math.cos(angle) * radius, 
            0, 
            Math.sin(angle) * radius
          ]}>
            {/* Flag pole */}
            <mesh position={[0, 2.5, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 5]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
            {/* Flag */}
            <mesh position={[0.5, 4, 0]} castShadow>
              <planeGeometry args={[1, 0.6]} />
              <meshLambertMaterial color={i % 2 === 0 ? "#FF0000" : "#0000FF"} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function RacingGame({ gameData, setGameData }: any) {
  return (
    <KeyboardControls map={racingControls}>
      <RaceTrack />
      <RacingCar gameData={gameData} setGameData={setGameData} />
    </KeyboardControls>
  );
}

export const racingGameConfig = {
  name: "Circuit Racing",
  description: "High-speed racing on a professional circuit track",
  component: RacingGame,
  init: () => ({
    currentLap: 0,
    bestLapTime: null,
    currentLapStartTime: Date.now(),
    position: 1,
    totalLaps: 3
  })
};