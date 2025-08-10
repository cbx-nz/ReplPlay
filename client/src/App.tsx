import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/inter";

import GameEngine from "./components/GameEngine";
import GameMenu from "./components/GameMenu";
import FPSCounter from "./components/FPSCounter";
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
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#111111'
    }}>
      <FPSCounter />
      
      {showCanvas && (
        <KeyboardControls map={gameControls}>
          {gameState === 'menu' && <GameMenu />}
          
          {gameState === 'playing' && currentGame && (
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
