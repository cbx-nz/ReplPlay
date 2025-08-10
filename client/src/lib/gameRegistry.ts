import { drivingGameConfig } from "../games/driving";
import { sandboxGameConfig } from "../games/sandbox";

export interface GameInfo {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  init?: () => any;
}

export const gameRegistry: { [key: string]: Omit<GameInfo, 'id'> } = {
  driving: drivingGameConfig,
  sandbox: sandboxGameConfig
};
