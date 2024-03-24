import { FluidPlugin } from "../Plugin";
import { RubikFingerprint } from "./RubikFingerprint";

export class RubikPlugin extends FluidPlugin {
    constructor() {
        const requiredColumns = [];

        ['up', 'down', 'back', 'right', 'left', 'front'].forEach((c) => {
            ['00', '01', '02', '10', '11', '12', '20', '21', '22'].forEach((n) => {
                requiredColumns.push(`${c}${n}`);
            });
        });

        super('rubik', requiredColumns);
    }

    createFingerprint(filter: number[]) {
        return <RubikFingerprint filter={filter} />;
    }
}