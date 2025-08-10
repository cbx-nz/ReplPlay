import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useGameEngine } from "../lib/stores/useGameEngine";
import { gameRegistry, GameInfo } from "../lib/gameRegistry";

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

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-600">
      <div className="max-w-4xl w-full mx-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-gray-800 mb-2">
              3D Game Framework
            </CardTitle>
            <p className="text-gray-600">Choose a game to play</p>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <Card 
                  key={game.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    selectedGame === game.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedGame(game.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-800">
                      {game.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {game.description}
                    </p>
                    
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayGame(game.id);
                      }}
                      className="w-full"
                    >
                      Play Game
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Use WASD to move • Space to jump • ESC to return to menu
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
