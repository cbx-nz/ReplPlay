import React, { useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { WorldBlock, CustomWorld, User } from '../../../shared/types';

interface WorldBuilderProps {
  user: User | null;
  world?: CustomWorld;
  onSave: (world: CustomWorld) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface BlockPalette {
  type: WorldBlock['type'];
  name: string;
  color: string;
  icon: string;
}

const blockPalette: BlockPalette[] = [
  { type: 'ground', name: 'Ground', color: '#8FBC8F', icon: '🟫' },
  { type: 'building', name: 'Building', color: '#D3D3D3', icon: '🏢' },
  { type: 'tree', name: 'Tree', color: '#228B22', icon: '🌳' },
  { type: 'rock', name: 'Rock', color: '#696969', icon: '🪨' },
  { type: 'road', name: 'Road', color: '#2F4F4F', icon: '🛣️' },
  { type: 'ramp', name: 'Ramp', color: '#DAA520', icon: '📐' },
  { type: 'custom', name: 'Custom', color: '#FF69B4', icon: '⭐' }
];

function WorldBlock3D({ block, isSelected, onClick }: { 
  block: WorldBlock; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  const getGeometry = () => {
    switch (block.type) {
      case 'ground':
        return <boxGeometry args={[block.scale[0], 0.2, block.scale[2]]} />;
      case 'building':
        return <boxGeometry args={block.scale} />;
      case 'tree':
        return (
          <group>
            <cylinderGeometry args={[0.2, 0.3, block.scale[1] * 0.7]} />
            <sphereGeometry args={[block.scale[0] * 0.6]} />
          </group>
        );
      case 'rock':
        return <sphereGeometry args={[block.scale[0] * 0.6]} />;
      case 'road':
        return <boxGeometry args={[block.scale[0], 0.1, block.scale[2]]} />;
      case 'ramp':
        return <boxGeometry args={block.scale} />;
      default:
        return <boxGeometry args={block.scale} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={block.position}
      rotation={block.rotation}
      onClick={onClick}
    >
      {getGeometry()}
      <meshLambertMaterial 
        color={block.color || blockPalette.find(p => p.type === block.type)?.color || '#FFFFFF'} 
        wireframe={isSelected}
      />
    </mesh>
  );
}

function WorldEditor({ 
  blocks, 
  selectedBlockType,
  onAddBlock,
  onSelectBlock,
  selectedBlockId
}: {
  blocks: WorldBlock[];
  selectedBlockType: WorldBlock['type'];
  onAddBlock: (position: [number, number, number]) => void;
  onSelectBlock: (id: string) => void;
  selectedBlockId: string | null;
}) {
  const { camera, raycaster } = useThree();
  const [groundPlane] = useState(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  const handleClick = (event: THREE.Event) => {
    event.stopPropagation();
    
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersection);
    
    if (intersection) {
      // Snap to grid
      const gridSize = 2;
      const snappedX = Math.round(intersection.x / gridSize) * gridSize;
      const snappedZ = Math.round(intersection.z / gridSize) * gridSize;
      
      onAddBlock([snappedX, 1, snappedZ]);
    }
  };

  return (
    <>
      <OrbitControls enablePan enableZoom enableRotate />
      
      {/* Grid floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleClick}>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#E0E0E0" transparent opacity={0.5} />
      </mesh>
      
      {/* Grid lines */}
      <gridHelper args={[100, 50, '#C0C0C0', '#E0E0E0']} />
      
      {/* World blocks */}
      {blocks.map((block) => (
        <WorldBlock3D
          key={block.id}
          block={block}
          isSelected={selectedBlockId === block.id}
          onClick={() => onSelectBlock(block.id)}
        />
      ))}
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}

export function WorldBuilder({ user, world, onSave, onClose, isOpen }: WorldBuilderProps) {
  const [currentWorld, setCurrentWorld] = useState<CustomWorld>(
    world || {
      id: `world_${Date.now()}`,
      name: 'My Custom World',
      description: 'A custom world created with the world builder',
      creatorId: user?.id || 'guest',
      blocks: [],
      spawnPoints: [[0, 2, 0]],
      isPublic: false,
      maxPlayers: 8,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  );
  
  const [selectedBlockType, setSelectedBlockType] = useState<WorldBlock['type']>('ground');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [mode, setMode] = useState<'build' | 'edit' | 'test'>('build');

  const addBlock = (position: [number, number, number]) => {
    if (mode !== 'build') return;

    const newBlock: WorldBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: selectedBlockType,
      position,
      rotation: [0, 0, 0],
      scale: [2, 2, 2],
      color: blockPalette.find(p => p.type === selectedBlockType)?.color
    };

    setCurrentWorld(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      updatedAt: new Date()
    }));
  };

  const selectBlock = (id: string) => {
    setSelectedBlockId(id);
  };

  const deleteSelectedBlock = () => {
    if (selectedBlockId) {
      setCurrentWorld(prev => ({
        ...prev,
        blocks: prev.blocks.filter(block => block.id !== selectedBlockId),
        updatedAt: new Date()
      }));
      setSelectedBlockId(null);
    }
  };

  const clearWorld = () => {
    setCurrentWorld(prev => ({
      ...prev,
      blocks: [],
      updatedAt: new Date()
    }));
    setSelectedBlockId(null);
  };

  const saveWorld = () => {
    onSave(currentWorld);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/90 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white/95 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">World Builder</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* World Info */}
        <div className="mb-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              World Name
            </label>
            <input
              type="text"
              value={currentWorld.name}
              onChange={(e) => setCurrentWorld(prev => ({ 
                ...prev, 
                name: e.target.value,
                updatedAt: new Date()
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={currentWorld.description}
              onChange={(e) => setCurrentWorld(prev => ({ 
                ...prev, 
                description: e.target.value,
                updatedAt: new Date()
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={200}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={currentWorld.isPublic}
                onChange={(e) => setCurrentWorld(prev => ({ 
                  ...prev, 
                  isPublic: e.target.checked,
                  updatedAt: new Date()
                }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Public World</span>
            </label>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-2">Mode</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['build', 'edit', 'test'] as const).map((modeOption) => (
              <button
                key={modeOption}
                onClick={() => setMode(modeOption)}
                className={`p-2 rounded font-medium capitalize transition-colors ${
                  mode === modeOption
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {modeOption}
              </button>
            ))}
          </div>
        </div>

        {/* Block Palette */}
        {mode === 'build' && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Block Palette</h3>
            <div className="grid grid-cols-2 gap-2">
              {blockPalette.map((palette) => (
                <button
                  key={palette.type}
                  onClick={() => setSelectedBlockType(palette.type)}
                  className={`p-3 rounded border-2 transition-colors ${
                    selectedBlockType === palette.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="text-lg mb-1">{palette.icon}</div>
                  <div className="text-xs font-medium">{palette.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {selectedBlockId && (
            <button
              onClick={deleteSelectedBlock}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Delete Selected Block
            </button>
          )}
          
          <button
            onClick={clearWorld}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Clear World
          </button>
          
          <button
            onClick={saveWorld}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Save World
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-bold text-gray-800 mb-2">World Stats</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Blocks: {currentWorld.blocks.length}</div>
            <div>Max Players: {currentWorld.maxPlayers}</div>
            <div>Creator: {user.username}</div>
            <div>Public: {currentWorld.isPublic ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas
          camera={{ position: [10, 10, 10], fov: 60 }}
          style={{ background: '#87CEEB' }}
        >
          <WorldEditor
            blocks={currentWorld.blocks}
            selectedBlockType={selectedBlockType}
            onAddBlock={addBlock}
            onSelectBlock={selectBlock}
            selectedBlockId={selectedBlockId}
          />
        </Canvas>
        
        {/* Instructions */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded-lg max-w-sm">
          <h4 className="font-bold mb-2">Instructions</h4>
          <div className="text-sm space-y-1">
            {mode === 'build' && (
              <>
                <div>• Click on the ground to place blocks</div>
                <div>• Select block type from the palette</div>
                <div>• Blocks snap to a 2x2 grid</div>
              </>
            )}
            {mode === 'edit' && (
              <>
                <div>• Click blocks to select them</div>
                <div>• Use delete button to remove blocks</div>
                <div>• Selected blocks are highlighted</div>
              </>
            )}
            {mode === 'test' && (
              <>
                <div>• Navigate around your world</div>
                <div>• Test the layout and design</div>
                <div>• Use mouse to orbit the camera</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}