import { VectorLike } from '../../Interfaces'

export class Rectangle {
  x: number

  y: number

  width: number

  height: number

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  within(vector: VectorLike) {
    return (
      vector.x > this.x &&
      vector.x < this.x + this.width &&
      vector.y > this.y &&
      vector.y < this.y + this.height
    )
  }
}
