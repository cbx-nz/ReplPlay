const http = require('http');

const game = {
  name: 'Bouncing Ball',
  description: 'Watch a ball bounce around the scene',
  gameCode: `export default function BouncingBall() {
  const [ballPos, setBallPos] = React.useState([0, 3, 0]);
  const [velocity, setVelocity] = React.useState([0.1, 0, 0.05]);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setBallPos(prevPos => {
        setVelocity(prevVel => {
          let newVel = [...prevVel];
          let newPos = [
            prevPos[0] + newVel[0],
            prevPos[1] + newVel[1],
            prevPos[2] + newVel[2]
          ];
          
          // Gravity
          newVel[1] -= 0.02;
          
          // Bounce off ground
          if (newPos[1] <= 0.5) {
            newPos[1] = 0.5;
            newVel[1] = Math.abs(newVel[1]) * 0.8;
          }
          
          // Bounce off walls
          if (newPos[0] > 4 || newPos[0] < -4) {
            newVel[0] *= -0.9;
            newPos[0] = newPos[0] > 0 ? 4 : -4;
          }
          if (newPos[2] > 4 || newPos[2] < -4) {
            newVel[2] *= -0.9;
            newPos[2] = newPos[2] > 0 ? 4 : -4;
          }
          
          return newVel;
        });
        return [
          Math.max(-4, Math.min(4, prevPos[0] + velocity[0])),
          Math.max(0.5, prevPos[1] + velocity[1]),
          Math.max(-4, Math.min(4, prevPos[2] + velocity[2]))
        ];
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [velocity]);
  
  return React.createElement('group', null,
    React.createElement('mesh', {
      position: [0, 0, 0],
      receiveShadow: true
    },
      React.createElement('planeGeometry', { args: [10, 10] }),
      React.createElement('meshStandardMaterial', { color: '#90EE90' })
    ),
    React.createElement('mesh', {
      position: ballPos,
      castShadow: true
    },
      React.createElement('sphereGeometry', { args: [0.5, 16, 16] }),
      React.createElement('meshStandardMaterial', { color: '#ff4444' })
    ),
    React.createElement('ambientLight', { intensity: 0.4 }),
    React.createElement('directionalLight', {
      position: [5, 10, 5],
      intensity: 1,
      castShadow: true
    })
  );
}`,
  gameConfig: {
    name: 'Bouncing Ball',
    description: 'Physics simulation of a bouncing ball',
    maxPlayers: 1,
    gameMode: 'singleplayer',
    controls: { 'Watch': 'Observe the ball physics' },
    objectives: ['Watch the ball bounce with realistic physics']
  },
  isPublic: true,
  tags: ['physics', 'simulation', 'demo'],
  version: '1.0.0'
};

const data = JSON.stringify(game);
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/custom-games',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'demo_creator_physics'
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  res.on('end', () => console.log('Bouncing Ball game created:', responseData));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
