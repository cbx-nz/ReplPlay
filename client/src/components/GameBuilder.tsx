import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface GameBuilderProps {
  onSave: (gameData: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const defaultGameCode = `// Welcome to the Game Builder!
// This is a basic game template. You can modify this code to create your own game.

import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';

export default function CustomGame() {
  const meshRef = useRef();
  const [position, setPosition] = useState([0, 1, 0]);

  useFrame((state, delta) => {
    // Game loop - runs every frame
    if (meshRef.current) {
      meshRef.current.rotation.y += delta;
    }
  });

  const handleClick = () => {
    // Handle player interaction
    setPosition([
      Math.random() * 10 - 5,
      1,
      Math.random() * 10 - 5
    ]);
  };

  return (
    <group>
      {/* Ground */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>

      {/* Interactive object */}
      <mesh
        ref={meshRef}
        position={position}
        onClick={handleClick}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
      />
    </group>
  );
}
`;

const defaultGameConfig = {
  name: 'My Custom Game',
  description: 'A custom game created with the Game Builder',
  maxPlayers: 4,
  gameMode: 'multiplayer' as const,
  controls: {
    'WASD': 'Move',
    'Space': 'Jump',
    'Mouse': 'Look around',
    'Click': 'Interact'
  },
  objectives: [
    'Click the spinning cube to move it',
    'Explore the world',
    'Have fun!'
  ],
  settings: {
    gravity: 9.8,
    jumpHeight: 5,
    moveSpeed: 5
  }
};

export function GameBuilder({ onSave, onCancel, initialData }: GameBuilderProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [gameCode, setGameCode] = useState(initialData?.gameCode || defaultGameCode);
  const [gameConfig, setGameConfig] = useState(initialData?.gameConfig || defaultGameConfig);
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');
  const [activeTab, setActiveTab] = useState('info');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfigChange = (field: string, value: any) => {
    setGameConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleControlsChange = (key: string, value: string) => {
    setGameConfig(prev => ({
      ...prev,
      controls: {
        ...prev.controls,
        [key]: value
      }
    }));
  };

  const handleSettingsChange = (key: string, value: any) => {
    setGameConfig(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnail(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateAndSave = () => {
    if (!name.trim()) {
      alert('Please enter a game name');
      return;
    }

    if (!gameCode.trim()) {
      alert('Please enter game code');
      return;
    }

    try {
      // Basic syntax check for the game code
      new Function(gameCode);
    } catch (error) {
      alert('Game code has syntax errors. Please check your code.');
      return;
    }

    const gameData = {
      name: name.trim(),
      description: description.trim(),
      gameCode: gameCode.trim(),
      gameConfig: {
        ...gameConfig,
        name: name.trim(),
        description: description.trim()
      },
      isPublic,
      tags,
      thumbnail,
      version: '1.0.0'
    };

    onSave(gameData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Game Builder</h2>
            <div className="space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={validateAndSave}>
                Save Game
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Basic Info</TabsTrigger>
              <TabsTrigger value="config">Game Config</TabsTrigger>
              <TabsTrigger value="code">Game Code</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Game Information</CardTitle>
                  <CardDescription>
                    Basic information about your game
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Game Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter game name..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your game..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Thumbnail</label>
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Thumbnail
                      </Button>
                      {thumbnail && (
                        <img
                          src={thumbnail}
                          alt="Thumbnail"
                          className="w-32 h-24 object-cover rounded border"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button onClick={addTag}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-xs"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <label htmlFor="isPublic">Make this game public</label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Game Configuration</CardTitle>
                  <CardDescription>
                    Configure game settings and controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Players</label>
                      <Input
                        type="number"
                        min="1"
                        max="16"
                        value={gameConfig.maxPlayers}
                        onChange={(e) => handleConfigChange('maxPlayers', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Game Mode</label>
                      <Select
                        value={gameConfig.gameMode}
                        onValueChange={(value) => handleConfigChange('gameMode', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="singleplayer">Singleplayer</SelectItem>
                          <SelectItem value="multiplayer">Multiplayer</SelectItem>
                          <SelectItem value="coop">Co-op</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Controls</label>
                    <div className="space-y-2">
                      {Object.entries(gameConfig.controls).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <Input
                            value={key}
                            onChange={(e) => {
                              const newControls = { ...gameConfig.controls };
                              delete newControls[key];
                              newControls[e.target.value] = value;
                              handleConfigChange('controls', newControls);
                            }}
                            className="w-32"
                          />
                          <Input
                            value={value}
                            onChange={(e) => handleControlsChange(key, e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Game Settings</label>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(gameConfig.settings || {}).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-xs font-medium mb-1">{key}</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={value}
                            onChange={(e) => handleSettingsChange(key, parseFloat(e.target.value))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Game Code</CardTitle>
                  <CardDescription>
                    Write your game logic using React and Three.js
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded">
                    <textarea
                      value={gameCode}
                      onChange={(e) => setGameCode(e.target.value)}
                      className="w-full h-96 p-4 font-mono text-sm border rounded"
                      placeholder="Enter your game code here..."
                    />
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p><strong>Tips:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Use React hooks like useState and useRef for state management</li>
                      <li>Use useFrame from @react-three/fiber for game loops</li>
                      <li>Create interactive 3D objects with onClick handlers</li>
                      <li>Use Three.js geometries and materials for 3D graphics</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Game Preview</CardTitle>
                  <CardDescription>
                    Preview how your game will appear in the library
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex gap-4">
                      {thumbnail && (
                        <img
                          src={thumbnail}
                          alt={name}
                          className="w-24 h-18 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{name || 'Untitled Game'}</h3>
                        <p className="text-gray-600 mb-2">{description || 'No description'}</p>
                        <div className="flex gap-2 mb-2">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span>Mode: {gameConfig.gameMode}</span>
                          <span className="mx-2">•</span>
                          <span>Max Players: {gameConfig.maxPlayers}</span>
                          <span className="mx-2">•</span>
                          <span>{isPublic ? 'Public' : 'Private'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
