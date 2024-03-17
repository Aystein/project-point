import { FluidPlugin } from "../Plugin";
import { ChessFingerprint } from "./ChessFingerprint";

export class ChessPlugin extends FluidPlugin {
    constructor() {
        const requiredColumns = [];

        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach((c) => {
            [1, 2, 3, 4, 5, 6, 7, 8].forEach((n) => {
                requiredColumns.push(`${c}${n}`);
            });
        });

        super('chess', requiredColumns);
    }

    createFingerprint(filter: number[]) {
        return <ChessFingerprint filter={filter} />;
    }
}