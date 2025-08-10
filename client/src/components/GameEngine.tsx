import { useEffect } from "react";
import { useGameEngine } from "../lib/stores/useGameEngine";
import { gameRegistry } from "../lib/gameRegistry";
import GameCanvas from "./GameCanvas";

export default function GameEngine() {
  const { currentGame, gameData, setGameData } = useGameEngine();

  useEffect(() => {
    if (currentGame && gameRegistry[currentGame]) {
      const gameModule = gameRegistry[currentGame];
      if (gameModule.init) {
        const initialData = gameModule.init();
        setGameData(initialData);
      }
    }
  }, [currentGame, setGameData]);

  if (!currentGame || !gameRegistry[currentGame]) {
    return null;
  }

  const GameComponent = gameRegistry[currentGame].component;

  return (
    <>
      <GameCanvas />
      <GameComponent gameData={gameData} />
    </>
  );
}
