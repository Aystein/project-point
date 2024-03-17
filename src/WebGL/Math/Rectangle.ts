import { VectorLike } from '../../Interfaces';

export interface IRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Rectangle {
  x: number;

  y: number;

  width: number;

  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  within(vector: VectorLike) {
    return (
      vector.x > this.x &&
      vector.x < this.x + this.width &&
      vector.y > this.y &&
      vector.y < this.y + this.height
    );
  }

  serialize(): IRectangle {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  percent(xp: number, yp: number) {
    return { x: this.x + this.width * xp,
      y: this.y + this.height * yp }
  }

  percentX(x: number) {
    return (x - this.x) / this.width
  }

  percentY(y: number) {
    return (y - this.y) / this.height
  }

  get centerX() {
    return this.x + this.width / 2;
  }

  get centerY() {
    return this.y + this.height / 2;
  }

  static deserialize(dump: IRectangle) {
    return new Rectangle(dump.x, dump.y, dump.width, dump.height);
  }
}
