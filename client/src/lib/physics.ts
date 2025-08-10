import * as THREE from "three";

export interface PhysicsBody {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
  size: THREE.Vector3;
  isStatic: boolean;
}

export class SimplePhysics {
  private bodies: PhysicsBody[] = [];
  private gravity = new THREE.Vector3(0, -9.81, 0);

  addBody(body: PhysicsBody): void {
    this.bodies.push(body);
  }

  removeBody(body: PhysicsBody): void {
    const index = this.bodies.indexOf(body);
    if (index > -1) {
      this.bodies.splice(index, 1);
    }
  }

  update(deltaTime: number): void {
    for (const body of this.bodies) {
      if (!body.isStatic) {
        // Apply gravity
        body.velocity.add(this.gravity.clone().multiplyScalar(deltaTime));
        
        // Update position
        body.position.add(body.velocity.clone().multiplyScalar(deltaTime));
        
        // Simple ground collision
        if (body.position.y < body.size.y / 2) {
          body.position.y = body.size.y / 2;
          body.velocity.y = 0;
        }
      }
    }

    // Check collisions between bodies
    this.checkCollisions();
  }

  private checkCollisions(): void {
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bodyA = this.bodies[i];
        const bodyB = this.bodies[j];
        
        if (this.isColliding(bodyA, bodyB)) {
          this.resolveCollision(bodyA, bodyB);
        }
      }
    }
  }

  private isColliding(bodyA: PhysicsBody, bodyB: PhysicsBody): boolean {
    const distance = bodyA.position.distanceTo(bodyB.position);
    const minDistance = (bodyA.size.length() + bodyB.size.length()) / 4;
    return distance < minDistance;
  }

  private resolveCollision(bodyA: PhysicsBody, bodyB: PhysicsBody): void {
    // Simple elastic collision response
    const direction = bodyA.position.clone().sub(bodyB.position).normalize();
    const relativeVelocity = bodyA.velocity.clone().sub(bodyB.velocity);
    const speed = relativeVelocity.dot(direction);

    if (speed < 0) return; // Objects already separating

    const impulse = (2 * speed) / (bodyA.mass + bodyB.mass);
    
    bodyA.velocity.sub(direction.clone().multiplyScalar(impulse * bodyB.mass));
    bodyB.velocity.add(direction.clone().multiplyScalar(impulse * bodyA.mass));
  }

  getBodies(): PhysicsBody[] {
    return this.bodies;
  }
}
