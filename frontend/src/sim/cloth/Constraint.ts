import type { Point } from './Point'

export class Constraint {
  p1: Point
  p2: Point
  restLength: number
  /** Last computed length / restLength, used for tension visualization. */
  tension: number = 1

  constructor(p1: Point, p2: Point) {
    this.p1 = p1
    this.p2 = p2
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    this.restLength = Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Pull the two endpoints toward `restLength`. Returns false when the
   * constraint is overstretched and should be removed (a tear).
   */
  solve(tearDistance: number): boolean {
    const dx = this.p1.x - this.p2.x
    const dy = this.p1.y - this.p2.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001

    if (dist > tearDistance) return false

    this.tension = dist / this.restLength

    const diff = (this.restLength - dist) / dist
    const offsetX = dx * diff * 0.5
    const offsetY = dy * diff * 0.5

    const p1Pinned = this.p1.isPinned()
    const p2Pinned = this.p2.isPinned()

    if (!p1Pinned && !p2Pinned) {
      this.p1.x += offsetX
      this.p1.y += offsetY
      this.p2.x -= offsetX
      this.p2.y -= offsetY
    } else if (!p1Pinned) {
      this.p1.x += offsetX * 2
      this.p1.y += offsetY * 2
    } else if (!p2Pinned) {
      this.p2.x -= offsetX * 2
      this.p2.y -= offsetY * 2
    }

    return true
  }
}
