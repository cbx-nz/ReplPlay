const gameData = {
  name: 'Simple Clicker',
  description: 'Click the cube to score points',
  gameCode: `import React, { useState } from 'react';

export default function SimpleClicker() {
  const [score, setScore] = useState(0);
  
  const handleClick = () => {
    setScore(prev => prev + 1);
  };

  return (
    <group>
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#90EE90" />
      </mesh>
      
      <mesh 
        position={[0, 1, 0]} 
        onClick={handleClick}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
    </group>
  );
}`,
  gameConfig: {
    name: 'Simple Clicker',
    description: 'Click the cube to score points',
    maxPlayers: 1,
    gameMode: 'singleplayer',
    controls: { 'Mouse Click': 'Click the cube' },
    objectives: ['Click the red cube to score points']
  },
  isPublic: true,
  tags: ['clicker', 'simple', 'casual'],
  version: '1.0.0'
};

fetch('http://localhost:5000/api/custom-games', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'demo_creator_1'
  },
  body: JSON.stringify(gameData)
}).then(res => res.json()).then(data => console.log('Created:', data)).catch(err => console.error('Error:', err));
