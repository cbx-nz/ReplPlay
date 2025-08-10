export enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  jump = 'jump',
  action = 'action',
  brake = 'brake'
}

export const gameControls = [
  { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: Controls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.leftward, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.rightward, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.jump, keys: ['Space'] },
  { name: Controls.action, keys: ['KeyE'] },
  { name: Controls.brake, keys: ['KeyC'] }
];
