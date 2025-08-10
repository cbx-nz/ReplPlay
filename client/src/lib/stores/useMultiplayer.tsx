import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface PlayerData {
  position: [number, number, number];
  rotation: [number, number, number];
  color?: string;
  name?: string;
}

interface MultiplayerState {
  socket: WebSocket | null;
  isConnected: boolean;
  playerId: string | null;
  otherPlayers: { [playerId: string]: PlayerData };
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  sendPlayerUpdate: (data: Partial<PlayerData>) => void;
  sendGameEvent: (event: string, data: any) => void;
}

export const useMultiplayer = create<MultiplayerState>()(
  subscribeWithSelector((set, get) => ({
    socket: null,
    isConnected: false,
    playerId: null,
    otherPlayers: {},
    
    connect: () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      try {
        const socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
          console.log("Connected to multiplayer server");
          set({ socket, isConnected: true });
        };
        
        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
              case 'player_joined':
                set({ playerId: message.playerId });
                break;
                
              case 'player_update':
                set((state) => ({
                  otherPlayers: {
                    ...state.otherPlayers,
                    [message.playerId]: message.data
                  }
                }));
                break;
                
              case 'player_left':
                set((state) => {
                  const newPlayers = { ...state.otherPlayers };
                  delete newPlayers[message.playerId];
                  return { otherPlayers: newPlayers };
                });
                break;
                
              case 'game_event':
                // Handle game-specific events
                console.log("Game event:", message.event, message.data);
                break;
            }
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };
        
        socket.onclose = () => {
          console.log("Disconnected from multiplayer server");
          set({ socket: null, isConnected: false, playerId: null, otherPlayers: {} });
        };
        
        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
        
      } catch (error) {
        console.error("Failed to connect to multiplayer server:", error);
      }
    },
    
    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.close();
      }
    },
    
    sendPlayerUpdate: (data) => {
      const { socket, isConnected } = get();
      if (socket && isConnected) {
        socket.send(JSON.stringify({
          type: 'player_update',
          data
        }));
      }
    },
    
    sendGameEvent: (event, data) => {
      const { socket, isConnected } = get();
      if (socket && isConnected) {
        socket.send(JSON.stringify({
          type: 'game_event',
          event,
          data
        }));
      }
    }
  }))
);
