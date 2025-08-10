fetch('http://localhost:5000/api/worlds', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'demo_user_123'
  },
  body: JSON.stringify({
    name: 'Demo World',
    description: 'A demonstration world with basic objects',
    objects: [
      {
        id: 'obj_1',
        type: 'cube',
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        scale: [2, 2, 2],
        color: '#FF6B6B'
      },
      {
        id: 'obj_2',
        type: 'sphere', 
        position: [5, 1, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: '#4ECDC4'
      }
    ],
    isPublic: true,
    tags: ['demo', 'sample']
  })
}).then(res => res.json()).then(data => console.log('Created world:', data));
