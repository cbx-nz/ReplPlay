import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useGameEngine } from "../lib/stores/useGameEngine";
import { gameRegistry, GameInfo } from "../lib/gameRegistry";

// Game emojis and categories
const gameEmojis: Record<string, string> = {
  'driving': '🏎️',
  'racing': '🏁',
  'shooter': '🎯',
  'platformer': '🦘',
  'puzzle': '🧩',
  'sandbox': '🛠️',
  'custom-games': '🎨'
};

const gameCategories: Record<string, string> = {
  'driving': 'Racing',
  'racing': 'Racing',
  'shooter': 'Action',
  'platformer': 'Adventure',
  'puzzle': 'Logic',
  'sandbox': 'Creative',
  'custom-games': 'Community'
};

const gameFeatures: Record<string, string[]> = {
  'driving': ['Multiplayer', 'Physics', 'Real-time'],
  'racing': ['Single Player', 'Track Racing', 'Time Trials'],
  'shooter': ['Combat', 'Arena', 'Waves'],
  'platformer': ['Jumping', 'Collectibles', 'Side-scrolling'],
  'puzzle': ['Logic', 'Switches', 'Problem Solving'],
  'sandbox': ['Building', 'Creativity', 'Multiplayer'],
  'custom-games': ['User Created', 'Visual Editor', 'Share & Play']
};

export default function GameMenu() {
  const { setCurrentGame, setGameState } = useGameEngine();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games: GameInfo[] = Object.entries(gameRegistry).map(([id, game]) => ({
    id,
    ...game
  }));

  const handlePlayGame = (gameId: string) => {
    setCurrentGame(gameId);
    setGameState("playing");
  };

  const featuredGames = games.filter(game => game.id !== 'custom-games');
  const customGames = games.filter(game => game.id === 'custom-games');

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-y-auto">
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <div className="text-center py-12">
          <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
            🎮 ReplPlay
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Multiplayer 3D Games & Experiences
          </p>
          <p className="text-sm text-gray-400">
            Built with React Three Fiber • WebSocket Multiplayer • Real-time Physics
          </p>
        </div>

        <div className="flex-1 max-w-7xl mx-auto px-4 pb-8">
          {/* Featured Games Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              🌟 Featured Games
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGames.map((game) => (
                <Card 
                  key={game.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 ${
                    selectedGame === game.id ? 'ring-2 ring-yellow-400 scale-105' : ''
                  }`}
                  onClick={() => setSelectedGame(game.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">{gameEmojis[game.id] || '🎮'}</span>
                      <span className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded-full text-xs">
                        {gameCategories[game.id] || 'Game'}
                      </span>
                    </div>
                    <CardTitle className="text-xl text-white">
                      {game.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-300 mb-4 min-h-[2.5rem]">
                      {game.description}
                    </p>
                    
                    {/* Game Features */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(gameFeatures[game.id] || []).map((feature, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayGame(game.id);
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
                    >
                      🚀 Play Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Games Section */}
          {customGames.length > 0 && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                🛠️ Community Created
              </h2>
              {customGames.map((game) => (
                <Card 
                  key={game.id}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border-white/20 hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedGame(game.id)}
                >
                  <CardHeader className="text-center pb-3">
                    <div className="text-6xl mb-3">{gameEmojis[game.id]}</div>
                    <CardTitle className="text-2xl text-white mb-2">
                      {game.name}
                    </CardTitle>
                    <p className="text-gray-300">{game.description}</p>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">🎮 Play Games</h4>
                        <p className="text-gray-300 text-sm">Browse and play games created by the community</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">✨ Create Games</h4>
                        <p className="text-gray-300 text-sm">Use our visual editor to build your own games</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                      {(gameFeatures[game.id] || []).map((feature, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayGame(game.id);
                      }}
                      className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold px-8 py-3"
                    >
                      🎨 Explore & Create
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Controls Info */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-3">🎮 Game Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <span className="font-semibold text-white">Movement:</span> WASD or Arrow Keys
              </div>
              <div>
                <span className="font-semibold text-white">Action:</span> Space Bar or Mouse Click
              </div>
              <div>
                <span className="font-semibold text-white">Menu:</span> ESC to return here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
