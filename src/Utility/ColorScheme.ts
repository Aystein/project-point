import { schemeSet2 } from "d3-scale-chromatic"
import { RGBColor, color } from 'd3-color';

export const DEFAULT_SCALE = schemeSet2;

export const DEFAULT_COLOR = DEFAULT_SCALE[0];

export function hexToInt(hex: string) {
    const value = color(hex).rgb();
    return (value.r << 24) | (value.g << 16) | (value.b << 8) | 255;
}

console.log(hexToInt(DEFAULT_COLOR));