import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/inter";

import GameEngine from "./components/GameEngine";
import GameMenu from "./components/GameMenu";
import FPSCounter from "./components/FPSCounter";
import MultiplayerStatus from "./components/MultiplayerStatus";
import MultiplayerChat from "./components/MultiplayerChat";
import { useGameEngine } from "./lib/stores/useGameEngine";
import { useMultiplayer } from "./lib/stores/useMultiplayer";
import { gameControls } from "./lib/controls";

const queryClient = new QueryClient();

function GameApp() {
  const { currentGame, gameState, setGameState } = useGameEngine();
  const { connect, disconnect } = useMultiplayer();
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    setShowCanvas(true);
    // Connect to multiplayer server
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle ESC key to return to menu
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape" && gameState === "playing") {
        setGameState("menu");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, setGameState]);

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gray-900">
      <FPSCounter />
      <MultiplayerStatus />
      
      {showCanvas && (
        <KeyboardControls map={gameControls}>
          {gameState === 'menu' && <GameMenu />}
          
          {gameState === 'playing' && currentGame && (
            <>
              <Canvas
                shadows
                camera={{
                  position: [0, 5, 10],
                  fov: 45,
                  near: 0.1,
                  far: 1000
                }}
                gl={{
                  antialias: true,
                  powerPreference: "default"
                }}
              >
                <color attach="background" args={["#87CEEB"]} />
                
                {/* Basic lighting */}
                <ambientLight intensity={0.3} />
                <directionalLight
                  position={[10, 10, 5]}
                  intensity={1}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  shadow-camera-far={50}
                  shadow-camera-left={-10}
                  shadow-camera-right={10}
                  shadow-camera-top={10}
                  shadow-camera-bottom={-10}
                />

                <Suspense fallback={null}>
                  <GameEngine />
                </Suspense>
              </Canvas>
              
              {/* Multiplayer Chat */}
              <MultiplayerChat />
              
              {/* Game HUD Overlay */}
              {currentGame === 'driving' && (
                <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded">
                  <div className="text-sm">
                    <div>WASD: Steer & Accelerate</div>
                    <div>Space: Brake</div>
                    <div>ESC: Return to Menu</div>
                  </div>
                </div>
              )}
              
              {currentGame === 'sandbox' && (
                <>
                  <div className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded">
                    <div className="text-lg font-bold mb-2">Sandbox Tools</div>
                    <div className="space-y-2">
                      <button className="block w-full bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">
                        Add Object
                      </button>
                      <button className="block w-full bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">
                        Remove Last
                      </button>
                    </div>
                    <div className="text-xs mt-3 text-gray-300">
                      <div>Click objects to interact</div>
                      <div>WASD: Move</div>
                      <div>Space: Jump</div>
                      <div>ESC: Menu</div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded text-sm">
                    Objects: 3
                  </div>
                </>
              )}
            </>
          )}
        </KeyboardControls>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameApp />
    </QueryClientProvider>
  );
}

export default App;
