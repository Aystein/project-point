import { ChessPlugin } from "./Chess/ChessPlugin";
import { FluidPlugin } from "./Plugin";
import { RubikPlugin } from "./Rubik/RubikPlugin";

const plugins = [new ChessPlugin(), new RubikPlugin()];

export function getPlugins(): FluidPlugin[] {
    return plugins;
}