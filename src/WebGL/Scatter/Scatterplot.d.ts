import { SpatialModel } from '../../Store/ModelSlice';
type ColumnTemp = {
    values: number[];
    domain: number[];
};
interface GlobalConfig {
    pointSize: number;
}
export declare function Scatterplot({ n, x, x2, y, model, color, size, opacity, globalConfig, hover, }: {
    n: number;
    x: number[];
    x2: string | ColumnTemp;
    y: number[];
    model: SpatialModel;
    color?: string | string[];
    size?: number[];
    opacity?: number[];
    globalConfig?: GlobalConfig;
    hover: number;
}): any;
export {};
