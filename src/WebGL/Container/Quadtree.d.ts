import { Rectangle } from "./Rectangle";
export declare class Quadtree {
    constructor(data: any);
    find(x: number, y: number, radius: number): void;
    findInRect(bounds: Rectangle): void;
}
