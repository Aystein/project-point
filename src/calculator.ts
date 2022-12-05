export class Calculator {
    static version = '1'
    constructor() {}

    /**
     * @example new Calculator()... a.sum(5, 6 ) // prints 11
     * 
     * @param a a
     * @param b b
     * @returns sum of a and b
     */
    add(a: number, b: number) {
        console.log(`version ${Calculator.version}`)
        return a + b
    }
}

export function Test() {
    return 4;
}