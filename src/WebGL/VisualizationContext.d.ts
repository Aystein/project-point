import * as React from 'react';
import { Visualization } from './Visualization';
import { ScaleLinear } from 'd3-scale';
export declare const VisContext: React.Context<{
    vis: Visualization;
    ref: any;
    requestFrame: () => void;
    registerRenderFunction: (value: any) => void;
    xDomain: number[];
    yDomain: number[];
    width: number;
    height: number;
    zoom: {
        tx: number;
        ty: number;
        s: number;
    };
    setZoom: (zoom: React.SetStateAction<{
        tx: number;
        ty: number;
        s: number;
    }>) => void;
    scaledXDomain: ScaleLinear<number, number>;
    scaledYDomain: ScaleLinear<number, number>;
    world: (value: number) => number;
}>;
export declare const VisProvider: ({ children }: {
    children: any;
}) => import("react/jsx-runtime").JSX.Element;
export declare function useVisContext(): {
    vis: Visualization;
    ref: any;
    requestFrame: () => void;
    registerRenderFunction: (value: any) => void;
    xDomain: number[];
    yDomain: number[];
    width: number;
    height: number;
    zoom: {
        tx: number;
        ty: number;
        s: number;
    };
    setZoom: (zoom: React.SetStateAction<{
        tx: number;
        ty: number;
        s: number;
    }>) => void;
    scaledXDomain: ScaleLinear<number, number, never>;
    scaledYDomain: ScaleLinear<number, number, never>;
    world: (value: number) => number;
};
