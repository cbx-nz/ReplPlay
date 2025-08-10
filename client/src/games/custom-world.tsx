import { useState, useEffect } from "react";
import SimpleWorldBuilder, { WorldObject } from "../components/SimpleWorldBuilder";
import MultiplayerManager from "../components/multiplayer/MultiplayerManager";
import Player from "../components/Player";

interface CustomWorldGameProps {
  gameData: any;
}

interface SavedWorld {
  id: string;
  name: string;
  description: string;
  objects: WorldObject[];
  creator: string;
  isPublic: boolean;
  likes: number;
  downloads: number;
  createdAt: string;
}

export default function CustomWorldGame({ gameData }: CustomWorldGameProps) {
  const [currentWorld, setCurrentWorld] = useState<SavedWorld | null>(null);
  const [worldObjects, setWorldObjects] = useState<WorldObject[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("cube");
  const [showLibrary, setShowLibrary] = useState(false);
  const [worlds, setWorlds] = useState<SavedWorld[]>([]);
  const [worldName, setWorldName] = useState("");
  const [worldDescription, setWorldDescription] = useState("");

  const tools = [
    { id: "cube", name: "Cube", icon: "⬛" },
    { id: "sphere", name: "Sphere", icon: "🔵" },
    { id: "cylinder", name: "Cylinder", icon: "🥫" },
    { id: "plane", name: "Plane", icon: "⬜" },
    { id: "cone", name: "Cone", icon: "🔺" }
  ];

  // Generate a simple user ID (in a real app, this would come from authentication)
  const userId = `user_${Math.random().toString(36).substr(2, 9)}`;

  // Fetch public worlds from the API
  const fetchWorlds = async () => {
    try {
      const response = await fetch('/api/worlds');
      const data = await response.json();
      setWorlds(data.worlds || []);
    } catch (error) {
      console.error('Error fetching worlds:', error);
    }
  };

  // Load a specific world
  const loadWorld = async (worldId: string) => {
    try {
      const response = await fetch(`/api/worlds/${worldId}`, {
        headers: {
          'x-user-id': userId
        }
      });
      
      if (response.ok) {
        const world = await response.json();
        setCurrentWorld(world);
        setWorldObjects(world.objects || []);
        setShowLibrary(false);
        
        // Track download
        await fetch(`/api/worlds/${worldId}/download`, {
          method: 'POST',
          headers: {
            'x-user-id': userId
          }
        });
      }
    } catch (error) {
      console.error('Error loading world:', error);
    }
  };

  // Save the current world
  const saveWorld = async () => {
    if (!worldName.trim()) {
      alert('Please enter a world name');
      return;
    }

    try {
      const worldData = {
        name: worldName,
        description: worldDescription,
        objects: worldObjects,
        isPublic: true,
        tags: ['custom', 'community']
      };

      const response = await fetch('/api/worlds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(worldData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('World saved successfully!');
        setWorldName("");
        setWorldDescription("");
        fetchWorlds(); // Refresh the library
      } else {
        alert('Failed to save world');
      }
    } catch (error) {
      console.error('Error saving world:', error);
      alert('Error saving world');
    }
  };

  // Like a world
  const likeWorld = async (worldId: string) => {
    try {
      await fetch(`/api/worlds/${worldId}/like`, {
        method: 'POST',
        headers: {
          'x-user-id': userId
        }
      });
      fetchWorlds(); // Refresh to get updated likes
    } catch (error) {
      console.error('Error liking world:', error);
    }
  };

  useEffect(() => {
    fetchWorlds();
  }, []);

  if (showLibrary) {
    return (
      <div className="absolute inset-0 bg-black/90 text-white overflow-y-auto">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">World Library</h1>
            <button
              onClick={() => setShowLibrary(false)}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
            >
              Back to Game
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.map((world) => (
              <div key={world.id} className="bg-gray-800 rounded-lg p-4">
                <div className="aspect-video bg-gray-700 rounded mb-3 flex items-center justify-center">
                  <span className="text-4xl">🌍</span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{world.name}</h3>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {world.description}
                </p>
                
                <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
                  <span>By {world.creator}</span>
                  <span>{world.objects?.length || 0} objects</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4 text-sm">
                    <button
                      onClick={() => likeWorld(world.id)}
                      className="flex items-center space-x-1 hover:text-red-400"
                    >
                      <span>❤️</span>
                      <span>{world.likes}</span>
                    </button>
                    <span className="flex items-center space-x-1">
                      <span>⬇️</span>
                      <span>{world.downloads}</span>
                    </span>
                  </div>
                  
                  <button
                    onClick={() => loadWorld(world.id)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                  >
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>

          {worlds.length === 0 && (
            <div className="text-center text-gray-400 mt-12">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-xl mb-2">No worlds yet</h3>
              <p>Be the first to create and share a custom world!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* World Builder */}
      <SimpleWorldBuilder
        objects={worldObjects}
        onObjectsChange={setWorldObjects}
        isBuilding={isBuilding}
        selectedTool={selectedTool}
      />

      {/* Players */}
      <Player isLocalPlayer={true} />
      <MultiplayerManager />

      {/* Build Tools Panel */}
      {isBuilding && (
        <div className="absolute top-4 left-4 bg-black/80 p-4 rounded-lg">
          <h3 className="text-white font-bold mb-3">Build Tools</h3>
          <div className="space-y-2 mb-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`w-full p-2 rounded text-sm font-medium transition-colors ${
                  selectedTool === tool.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {tool.icon} {tool.name}
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                setWorldObjects([]);
              }}
              className="w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Clear All
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            Objects: {worldObjects.length}
          </div>
        </div>
      )}

      {/* Save World Panel */}
      {isBuilding && worldObjects.length > 0 && (
        <div className="absolute top-4 right-4 bg-black/80 p-4 rounded-lg">
          <h3 className="text-white font-bold mb-3">Save World</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="World name"
              value={worldName}
              onChange={(e) => setWorldName(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              maxLength={50}
            />
            <textarea
              placeholder="Description"
              value={worldDescription}
              onChange={(e) => setWorldDescription(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
              maxLength={200}
            />
            <button
              onClick={saveWorld}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded text-sm"
            >
              Save to Library
            </button>
          </div>
        </div>
      )}

      {/* Current World Info */}
      {currentWorld && (
        <div className="absolute bottom-20 left-4 bg-black/80 p-3 rounded-lg text-white">
          <h4 className="font-bold">{currentWorld.name}</h4>
          <p className="text-sm text-gray-300">{currentWorld.description}</p>
          <div className="text-xs text-gray-400 mt-1">
            By {currentWorld.creator} • {currentWorld.objects?.length || 0} objects
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="absolute bottom-4 left-4 bg-black/80 p-3 rounded-lg text-white">
        <div className="space-y-2">
          <button
            onClick={() => setIsBuilding(!isBuilding)}
            className={`w-full p-2 rounded text-sm font-medium transition-colors ${
              isBuilding
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isBuilding ? "Stop Building" : "Start Building"}
          </button>
          
          <button
            onClick={() => setShowLibrary(true)}
            className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium"
          >
            🌍 World Library
          </button>
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          <div>WASD: Move</div>
          <div>Space: Jump</div>
          <div>ESC: Menu</div>
          {isBuilding && <div>Click: Place {selectedTool}</div>}
        </div>
      </div>
    </>
  );
}

export const customWorldGameConfig = {
  name: "Custom World",
  description: "Play in custom created worlds",
  component: CustomWorldGame,
  init: () => ({
    mode: "play",
    allowBuilding: true
  })
};
