export abstract class FluidPlugin {
    constructor(public type: string, public requiredColumns: string[]) { }

    hasLayout(header: string[]) {
        const set = new Set(header);

        return this.requiredColumns.every((value) => set.has(value))
    }

    abstract createFingerprint(filter: number[])
}