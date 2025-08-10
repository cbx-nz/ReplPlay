import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "menu" | "playing" | "paused";

interface GameEngineState {
  currentGame: string | null;
  gameState: GameState;
  gameData: any;
  
  // Actions
  setCurrentGame: (gameId: string | null) => void;
  setGameState: (state: GameState) => void;
  setGameData: (data: any) => void;
  resetGame: () => void;
}

export const useGameEngine = create<GameEngineState>()(
  subscribeWithSelector((set) => ({
    currentGame: null,
    gameState: "menu",
    gameData: null,
    
    setCurrentGame: (gameId) => set({ currentGame: gameId }),
    setGameState: (state) => set({ gameState: state }),
    setGameData: (data) => set({ gameData: data }),
    
    resetGame: () => set({
      currentGame: null,
      gameState: "menu",
      gameData: null
    })
  }))
);
