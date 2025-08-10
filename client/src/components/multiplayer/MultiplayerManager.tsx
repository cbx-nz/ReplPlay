import { useEffect } from "react";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import Player from "../Player";

export default function MultiplayerManager() {
  const { otherPlayers, isConnected } = useMultiplayer();

  if (!isConnected) {
    return null;
  }

  return (
    <>
      {Object.entries(otherPlayers).map(([playerId, playerData]) => (
        <Player
          key={playerId}
          isLocalPlayer={false}
          position={playerData.position}
          color={playerData.color || "#FF6B6B"}
          playerId={playerId}
        />
      ))}
    </>
  );
}
