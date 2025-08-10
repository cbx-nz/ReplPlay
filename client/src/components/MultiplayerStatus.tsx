import { useMultiplayer } from "../lib/stores/useMultiplayer";

export default function MultiplayerStatus() {
  const { isConnected, playerId, otherPlayers } = useMultiplayer();
  const playerCount = Object.keys(otherPlayers).length + (isConnected ? 1 : 0);

  return (
    <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg border border-gray-600">
      <div className="flex items-center gap-2 mb-2">
        <div 
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-semibold">
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>
      
      {isConnected && (
        <>
          <div className="text-xs text-gray-300 mb-1">
            Player ID: {playerId?.slice(0, 6)}...
          </div>
          <div className="text-xs text-gray-300">
            Players Online: {playerCount}
          </div>
          
          {Object.keys(otherPlayers).length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">Other Players:</div>
              {Object.entries(otherPlayers).map(([id, data]) => (
                <div key={id} className="text-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{data.name || `Player ${id.slice(0, 4)}`}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
