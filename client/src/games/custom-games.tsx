import React, { useState, useEffect } from 'react';
import { GameBuilder } from '../components/GameBuilder';

interface CustomGame {
  id: string;
  name: string;
  description: string;
  creator: string;
  isPublic: boolean;
  thumbnail?: string;
  gameCode?: string;
  gameConfig: {
    name: string;
    description: string;
    maxPlayers: number;
    gameMode: 'singleplayer' | 'multiplayer' | 'coop';
    controls: { [key: string]: string };
    objectives?: string[];
    settings?: { [key: string]: any };
  };
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  likes: number;
  downloads: number;
  version: string;
}

export default function CustomGamesPage() {
  const [games, setGames] = useState<CustomGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentGame, setCurrentGame] = useState<CustomGame | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'library' | 'my-games' | 'playing'>('library');

  const userId = localStorage.getItem('gameUser') ? 
    JSON.parse(localStorage.getItem('gameUser') || '{}').id : null;

  useEffect(() => {
    loadGames();
  }, [searchTerm, selectedTags, viewMode]);

  const loadGames = async () => {
    try {
      setLoading(true);
      let url = '/api/custom-games';
      
      if (viewMode === 'my-games' && userId) {
        url = `/api/custom-games/user/${userId}`;
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGame = async (gameData: any) => {
    try {
      const response = await fetch('/api/custom-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(gameData)
      });

      if (response.ok) {
        setShowBuilder(false);
        loadGames();
        alert('Game saved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save game: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Failed to save game');
    }
  };

  const playGame = async (game: CustomGame) => {
    try {
      // Download the full game code if needed
      const response = await fetch(`/api/custom-games/${game.id}?download=true`, {
        headers: {
          'x-user-id': userId
        }
      });
      
      if (response.ok) {
        const fullGame = await response.json();
        setCurrentGame(fullGame);
        setViewMode('playing');
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  const likeGame = async (gameId: string) => {
    try {
      await fetch(`/api/custom-games/${gameId}/like`, {
        method: 'POST',
        headers: {
          'x-user-id': userId
        }
      });
      loadGames();
    } catch (error) {
      console.error('Error liking game:', error);
    }
  };

  const CustomGameRenderer = ({ game }: { game: CustomGame }) => {
    try {
      // Create a dynamic component from the game code
      const gameComponent = new Function('React', 'useState', 'useRef', 'useFrame', game.gameCode || '');
      const GameComponent = gameComponent(React, useState, React.useRef, () => {});
      
      return (
        <div className="w-full h-full">
          <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded z-10">
            <h3 className="font-bold">{game.name}</h3>
            <div className="text-sm">
              {Object.entries(game.gameConfig.controls).map(([key, action]) => (
                <div key={key}>{key}: {action}</div>
              ))}
            </div>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setViewMode('library')}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Back to Library
            </button>
          </div>
          {React.createElement(GameComponent)}
        </div>
      );
    } catch (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-xl font-bold text-red-600 mb-2">Game Error</h3>
            <p className="text-gray-600">Failed to load game code</p>
            <button
              onClick={() => setViewMode('library')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Back to Library
            </button>
          </div>
        </div>
      );
    }
  };

  if (viewMode === 'playing' && currentGame) {
    return <CustomGameRenderer game={currentGame} />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Custom Games Library</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('library')}
            className={`px-4 py-2 rounded ${
              viewMode === 'library' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Public Library
          </button>
          <button
            onClick={() => setViewMode('my-games')}
            className={`px-4 py-2 rounded ${
              viewMode === 'my-games' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            My Games
          </button>
          <button
            onClick={() => setShowBuilder(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Create Game
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <select
          value=""
          onChange={(e) => {
            if (e.target.value && !selectedTags.includes(e.target.value)) {
              setSelectedTags([...selectedTags, e.target.value]);
            }
          }}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Add filter tag...</option>
          <option value="puzzle">Puzzle</option>
          <option value="action">Action</option>
          <option value="adventure">Adventure</option>
          <option value="strategy">Strategy</option>
          <option value="arcade">Arcade</option>
        </select>
      </div>

      {selectedTags.length > 0 && (
        <div className="mb-4 flex gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading games...</div>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">
            {viewMode === 'my-games' ? 'You haven\'t created any games yet.' : 'No games found.'}
          </div>
          {viewMode === 'my-games' && (
            <button
              onClick={() => setShowBuilder(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Create Your First Game
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {game.thumbnail && (
                <img
                  src={game.thumbnail}
                  alt={game.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{game.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {game.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  <div>By: {game.creator}</div>
                  <div>Mode: {game.gameConfig.gameMode}</div>
                  <div>Max Players: {game.gameConfig.maxPlayers}</div>
                  <div>Version: {game.version}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>❤️ {game.likes}</span>
                    <span>⬇️ {game.downloads}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => likeGame(game.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Like
                    </button>
                    <button
                      onClick={() => playGame(game)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Play
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBuilder && (
        <GameBuilder
          onSave={saveGame}
          onCancel={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
}
