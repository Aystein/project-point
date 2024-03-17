import { ChessPlugin } from "./Chess/ChessPlugin";

const plugins = [new ChessPlugin()];

export function getPlugins() {
    return plugins;
}