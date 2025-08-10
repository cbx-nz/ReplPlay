import { drivingGameConfig } from "../games/driving";
import { sandboxGameConfig } from "../games/sandbox";
import { platformerGameConfig } from "../games/platformer";
import { shooterGameConfig } from "../games/shooter";
import { puzzleGameConfig } from "../games/puzzle";
import { racingGameConfig } from "../games/racing";
import { customWorldGameConfig } from "../games/custom-world";
import CustomGamesPage from "../games/custom-games";

export interface GameInfo {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  init?: () => any;
}

export const gameRegistry: { [key: string]: Omit<GameInfo, 'id'> } = {
  driving: drivingGameConfig,
  sandbox: sandboxGameConfig,
  platformer: platformerGameConfig,
  shooter: shooterGameConfig,
  puzzle: puzzleGameConfig,
  racing: racingGameConfig,
  "custom-world": customWorldGameConfig,
  "custom-games": {
    name: "Custom Games Library",
    description: "Browse and play community-created games",
    component: CustomGamesPage
  }
};
