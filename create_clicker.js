const http = require('http');

const game = {
  name: 'Simple Clicker',
  description: 'Click the red cube to score points',
  gameCode: `export default function SimpleClicker() {
  const [score, setScore] = React.useState(0);
  
  return React.createElement('group', null,
    React.createElement('mesh', {
      position: [0, 0, 0],
      receiveShadow: true
    },
      React.createElement('planeGeometry', { args: [10, 10] }),
      React.createElement('meshStandardMaterial', { color: '#90EE90' })
    ),
    React.createElement('mesh', {
      position: [0, 1, 0],
      onClick: () => setScore(prev => prev + 1),
      castShadow: true
    },
      React.createElement('boxGeometry', { args: [1, 1, 1] }),
      React.createElement('meshStandardMaterial', { color: '#ff6b6b' })
    ),
    React.createElement('ambientLight', { intensity: 0.4 }),
    React.createElement('directionalLight', {
      position: [5, 5, 5],
      intensity: 1,
      castShadow: true
    })
  );
}`,
  gameConfig: {
    name: 'Simple Clicker',
    description: 'Click the cube to score points',
    maxPlayers: 1,
    gameMode: 'singleplayer',
    controls: { 'Mouse Click': 'Click the red cube' },
    objectives: ['Click the red cube to score points']
  },
  isPublic: true,
  tags: ['clicker', 'simple', 'casual'],
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
    'x-user-id': 'demo_creator_clicker'
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { 
    responseData += chunk; 
  });
  res.on('end', () => { 
    console.log('Simple Clicker game created:', responseData); 
  });
});

req.on('error', (e) => { 
  console.error('Error:', e.message); 
});

req.write(data);
req.end();
