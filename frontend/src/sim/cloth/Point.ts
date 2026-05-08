export class Point {
  x: number
  y: number
  prevX: number
  prevY: number
  pinX?: number
  pinY?: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.prevX = x
    this.prevY = y
  }

  pin(x: number, y: number) {
    this.pinX = x
    this.pinY = y
  }

  isPinned() {
    return this.pinX !== undefined && this.pinY !== undefined
  }

  update(dt: number, gravity: number, wind: number, friction: number) {
    if (this.isPinned()) {
      this.x = this.pinX as number
      this.y = this.pinY as number
      this.prevX = this.x
      this.prevY = this.y
      return
    }

    const vx = (this.x - this.prevX) * friction
    const vy = (this.y - this.prevY) * friction

    this.prevX = this.x
    this.prevY = this.y

    this.x += vx + wind * dt * dt
    this.y += vy + gravity * dt * dt
  }

  constrainTo(width: number, height: number) {
    if (this.x < 0) this.x = 0
    if (this.x > width) this.x = width
    if (this.y < 0) this.y = 0
    if (this.y > height) this.y = height
  }
}
