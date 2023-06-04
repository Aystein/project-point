import { IRectangle } from '../WebGL/Math/Rectangle';
import { VectorLike } from '../Interfaces';
export declare function runLayout<T>(params: T, worker: Worker): Promise<VectorLike[]>;
export declare function runCondenseLayout(n: number, area: IRectangle): Promise<VectorLike[]>;
export declare function runGroupLayout(X: any, area: IRectangle, feature: string): Promise<VectorLike[]>;
export declare function runUMAPLayout(X: any, N: any, D: any, area: any): Promise<VectorLike[]>;
