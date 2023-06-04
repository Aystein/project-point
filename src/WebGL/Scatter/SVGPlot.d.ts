import { SpatialModel } from '../../Store/ModelSlice';
type ColumnTemp = {
    values: number[];
    domain: number[];
};
interface GlobalConfig {
    pointSize: number;
}
export declare function SVGPlot({ n, x, x2, y, model, globalConfig, hover, }: {
    n: number;
    x: number[];
    x2: string | ColumnTemp;
    y: number[];
    model: SpatialModel;
    globalConfig?: GlobalConfig;
    hover: number;
}): import("react/jsx-runtime").JSX.Element;
export {};
