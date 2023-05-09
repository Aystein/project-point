export class ZoomTransform {
    k: number;

    x: number;

    y: number;

    constructor(k, x, y) {
        this.k = k;
        this.x = x;
        this.y = y;
    }

    invertX(x: number) {
        return (x - this.x) / this.k;
    }

    invertY(y: number) {
        return (y - this.y) / this.k;
    }

    rescaleX(x) {
        return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
    }

    rescaleY(y) {
        return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
    }
}