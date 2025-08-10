const http = require('http');

const game = {
  name: 'Rainbow Cubes',
  description: 'A colorful display of animated cubes',
  gameCode: `export default function RainbowCubes() {
  const cubes = [
    { pos: [-2, 1, 0], color: '#ff0000' },
    { pos: [0, 1, 0], color: '#00ff00' },
    { pos: [2, 1, 0], color: '#0000ff' },
    { pos: [-1, 1, 2], color: '#ffff00' },
    { pos: [1, 1, 2], color: '#ff00ff' }
  ];
  
  return React.createElement('group', null,
    React.createElement('mesh', {
      position: [0, 0, 0],
      receiveShadow: true
    },
      React.createElement('planeGeometry', { args: [10, 10] }),
      React.createElement('meshStandardMaterial', { color: '#e0e0e0' })
    ),
    ...cubes.map((cube, index) =>
      React.createElement('mesh', {
        key: index,
        position: cube.pos,
        castShadow: true
      },
        React.createElement('boxGeometry', { args: [0.8, 0.8, 0.8] }),
        React.createElement('meshStandardMaterial', { color: cube.color })
      )
    ),
    React.createElement('ambientLight', { intensity: 0.5 }),
    React.createElement('directionalLight', {
      position: [5, 5, 5],
      intensity: 1,
      castShadow: true
    })
  );
}`,
  gameConfig: {
    name: 'Rainbow Cubes',
    description: 'Enjoy colorful cubes',
    maxPlayers: 1,
    gameMode: 'singleplayer',
    controls: { 'Look': 'Look around with mouse' },
    objectives: ['Enjoy the colorful display']
  },
  isPublic: true,
  tags: ['colorful', 'art', 'relaxing'],
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
    'x-user-id': 'demo_creator_rainbow'
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  res.on('end', () => console.log('Rainbow Cubes game created:', responseData));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
