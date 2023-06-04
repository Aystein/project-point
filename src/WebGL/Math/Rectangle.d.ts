import { VectorLike } from '../../Interfaces';
export interface IRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare class Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
    within(vector: VectorLike): boolean;
    serialize(): IRectangle;
    get centerX(): number;
    get centerY(): number;
    static deserialize(dump: IRectangle): Rectangle;
}
