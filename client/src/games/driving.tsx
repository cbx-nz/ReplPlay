import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useTexture, Text } from "@react-three/drei";
import * as THREE from "three";
import { Controls } from "../lib/controls";
import MultiplayerManager from "../components/multiplayer/MultiplayerManager";
import { useMultiplayer } from "../lib/stores/useMultiplayer";

interface DrivingGameProps {
  gameData: any;
}

function Car({ isPlayer = false, position = [0, 0.5, 0], color = "#FF6B6B", playerId }: { 
  isPlayer?: boolean; 
  position?: [number, number, number];
  color?: string;
  playerId?: string;
}) {
  const carRef = useRef<THREE.Group>(null);
  const nameTagRef = useRef<THREE.Group>(null);
  const [subscribe, getState] = useKeyboardControls<Controls>();
  const { sendPlayerUpdate, otherPlayers } = useMultiplayer();
  
  const velocity = useRef(new THREE.Vector3());
  const speed = useRef(0);
  const maxSpeed = 20;
  const acceleration = 15;
  const deceleration = 10;
  const turnSpeed = 2;

  // Update non-player cars from multiplayer data
  useEffect(() => {
    if (!isPlayer && carRef.current && playerId && otherPlayers[playerId]) {
      const playerData = otherPlayers[playerId];
      carRef.current.position.set(...playerData.position);
      carRef.current.rotation.set(...playerData.rotation);
    }
  }, [isPlayer, playerId, otherPlayers]);

  useFrame((state, delta) => {
    if (!carRef.current) return;

    // Only handle controls for player car
    if (isPlayer) {
      const controls = getState();
      const car = carRef.current;
      
      // Acceleration/Deceleration
      if (controls.forward) {
        speed.current = Math.min(maxSpeed, speed.current + acceleration * delta);
      } else if (controls.backward) {
        speed.current = Math.max(-maxSpeed / 2, speed.current - acceleration * delta);
      } else {
        // Natural deceleration
        if (speed.current > 0) {
          speed.current = Math.max(0, speed.current - deceleration * delta);
        } else if (speed.current < 0) {
          speed.current = Math.min(0, speed.current + deceleration * delta);
        }
      }

      // Braking
      if (controls.jump) { // Space for brake
        speed.current *= 0.95;
      }

      // Steering (only when moving)
      if (Math.abs(speed.current) > 0.1) {
        if (controls.leftward) {
          car.rotation.y += turnSpeed * delta * (speed.current / maxSpeed);
        }
        if (controls.rightward) {
          car.rotation.y -= turnSpeed * delta * (speed.current / maxSpeed);
        }
      }

      // Apply movement
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(car.quaternion);
      forward.multiplyScalar(speed.current * delta);
      car.position.add(forward);

      // Keep car on track (boundary collision)
      car.position.x = Math.max(-40, Math.min(40, car.position.x));
      car.position.z = Math.max(-40, Math.min(40, car.position.z));

      // Send car position to multiplayer server
      sendPlayerUpdate({
        position: [car.position.x, car.position.y, car.position.z],
        rotation: [car.rotation.x, car.rotation.y, car.rotation.z]
      });

      // Update camera to follow car
      state.camera.position.lerp(
        new THREE.Vector3(
          car.position.x,
          car.position.y + 5,
          car.position.z + 10
        ),
        0.1
      );
      state.camera.lookAt(car.position);
    }

    // Update name tag to always face camera
    if (nameTagRef.current && state.camera) {
      nameTagRef.current.lookAt(state.camera.position);
    }
  });

  const playerName = isPlayer 
    ? "You" 
    : (playerId ? `Player ${playerId.slice(0, 4)}` : "Player");

  return (
    <group ref={carRef} position={position}>
      {/* Car body */}
      <mesh castShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshLambertMaterial color={color} />
      </mesh>
      
      {/* Car roof */}
      <mesh position={[0, 0.8, -0.5]} castShadow>
        <boxGeometry args={[1.8, 0.6, 2]} />
        <meshLambertMaterial color={color} />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[-1.2, -0.3, 1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[1.2, -0.3, 1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[-1.2, -0.3, -1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[1.2, -0.3, -1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>

      {/* Player name tag */}
      <group ref={nameTagRef} position={[0, 2, 0]}>
        <Text
          color={isPlayer ? "#FFD700" : "#FFFFFF"}
          fontSize={0.5}
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
      {!isPlayer && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshLambertMaterial color="#00FF00" />
        </mesh>
      )}
    </group>
  );
}

function MultiplayerCars() {
  const { otherPlayers } = useMultiplayer();

  return (
    <>
      {Object.entries(otherPlayers).map(([playerId, playerData]) => (
        <Car
          key={playerId}
          isPlayer={false}
          position={playerData.position}
          color={playerData.color || "#4ECDC4"}
          playerId={playerId}
        />
      ))}
    </>
  );
}

function RaceTrack() {
  const asphaltTexture = useTexture("/textures/asphalt.png");
  asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(10, 10);

  return (
    <>
      {/* Main track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <ringGeometry args={[10, 35, 32]} />
        <meshLambertMaterial map={asphaltTexture} />
      </mesh>
      
      {/* Track barriers */}
      {Array.from({ length: 32 }, (_, i) => {
        const angle = (i / 32) * Math.PI * 2;
        const innerRadius = 8;
        const outerRadius = 37;
        
        return (
          <group key={i}>
            {/* Inner barrier */}
            <mesh 
              position={[
                Math.cos(angle) * innerRadius, 
                0.5, 
                Math.sin(angle) * innerRadius
              ]}
              castShadow
            >
              <boxGeometry args={[0.5, 1, 0.5]} />
              <meshLambertMaterial color="#FF0000" />
            </mesh>
            
            {/* Outer barrier */}
            <mesh 
              position={[
                Math.cos(angle) * outerRadius, 
                0.5, 
                Math.sin(angle) * outerRadius
              ]}
              castShadow
            >
              <boxGeometry args={[0.5, 1, 0.5]} />
              <meshLambertMaterial color="#FF0000" />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

export default function DrivingGame({ gameData }: DrivingGameProps) {
  return (
    <>
      <RaceTrack />
      <Car isPlayer={true} />
      <MultiplayerCars />
    </>
  );
}

export const drivingGameConfig = {
  name: "Racing Game",
  description: "Drive a car around a circular track with realistic physics",
  component: DrivingGame,
  init: () => ({
    trackType: "oval",
    laps: 3,
    bestTime: null
  })
};
