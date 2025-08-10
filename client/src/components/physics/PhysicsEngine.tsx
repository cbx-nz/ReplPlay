import { createContext, useContext, ReactNode } from "react";
import * as THREE from "three";

interface PhysicsContextType {
  checkCollision: (pos1: THREE.Vector3, pos2: THREE.Vector3, size1: number, size2: number) => boolean;
  raycast: (origin: THREE.Vector3, direction: THREE.Vector3, maxDistance: number) => THREE.Vector3 | null;
}

const PhysicsContext = createContext<PhysicsContextType | null>(null);

export function usePhysics() {
  const context = useContext(PhysicsContext);
  if (!context) {
    throw new Error("usePhysics must be used within PhysicsProvider");
  }
  return context;
}

interface PhysicsProviderProps {
  children: ReactNode;
}

export function PhysicsProvider({ children }: PhysicsProviderProps) {
  const checkCollision = (pos1: THREE.Vector3, pos2: THREE.Vector3, size1: number, size2: number): boolean => {
    const distance = pos1.distanceTo(pos2);
    return distance < (size1 + size2) / 2;
  };

  const raycast = (origin: THREE.Vector3, direction: THREE.Vector3, maxDistance: number): THREE.Vector3 | null => {
    // Simple raycast implementation
    // In a real implementation, this would check against world geometry
    return null;
  };

  const value: PhysicsContextType = {
    checkCollision,
    raycast
  };

  return (
    <PhysicsContext.Provider value={value}>
      {children}
    </PhysicsContext.Provider>
  );
}
