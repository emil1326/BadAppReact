import { Point } from './Point'
import { Constraint } from './Constraint'
import type { Mouse, SimConfig } from './types'

export class Cloth {
  points: Point[] = []
  constraints: Constraint[] = []

  cols: number
  rows: number

  constructor(cfg: SimConfig, width: number, _height: number) {
    this.cols = cfg.cols
    this.rows = cfg.rows
    this.build(cfg, width)
  }

  private build(cfg: SimConfig, width: number) {
    const { cols, rows, spacing } = cfg

    const startX = width * 0.5 - (cols * spacing) * 0.5
    const startY = spacing * 2

    const grid: Point[] = []

    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= cols; x++) {
        const px = startX + x * spacing
        const py = startY + y * spacing
        const point = new Point(px, py)
        if (y === 0) point.pin(px, py)
        if (x !== 0) {
          this.constraints.push(new Constraint(point, grid[grid.length - 1]))
        }
        if (y !== 0) {
          this.constraints.push(
            new Constraint(point, grid[x + (y - 1) * (cols + 1)]),
          )
        }
        grid.push(point)
      }
    }

    this.points = grid
  }

  update(
    dt: number,
    cfg: SimConfig,
    mouse: Mouse,
    width: number,
    height: number,
  ) {
    const wind = cfg.windEnabled
      ? cfg.windStrength * (0.6 + 0.4 * Math.sin(performance.now() * 0.001))
      : 0

    for (const p of this.points) {
      p.update(dt, cfg.gravity, wind, cfg.friction)
      p.constrainTo(width, height)
    }

    for (let i = 0; i < cfg.iterations; i++) {
      this.constraints = this.constraints.filter((c) =>
        c.solve(cfg.tearDistance),
      )
    }

    this.applyMouse(mouse, cfg)
  }

  private applyMouse(mouse: Mouse, cfg: SimConfig) {
    if (!mouse.down) return

    if (mouse.button === 0) {
      // Tear: remove constraints whose midpoint is within mouseCut radius.
      const r2 = cfg.mouseCut * cfg.mouseCut
      this.constraints = this.constraints.filter((c) => {
        const mx = (c.p1.x + c.p2.x) * 0.5
        const my = (c.p1.y + c.p2.y) * 0.5
        const dx = mx - mouse.x
        const dy = my - mouse.y
        return dx * dx + dy * dy > r2
      })
    } else {
      // Drag: nudge nearest non-pinned point within influence by the cursor delta.
      const r2 = cfg.mouseInfluence * cfg.mouseInfluence
      const dxm = mouse.x - mouse.px
      const dym = mouse.y - mouse.py

      let nearest: Point | null = null
      let nearestDist = Infinity

      for (const p of this.points) {
        if (p.isPinned()) continue
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d = dx * dx + dy * dy
        if (d < r2 && d < nearestDist) {
          nearest = p
          nearestDist = d
        }
      }

      if (nearest) {
        nearest.prevX = nearest.x - dxm
        nearest.prevY = nearest.y - dym
      }
    }
  }

  /**
   * A page is detached when no surviving constraint connects a pinned
   * (binding) point to a non-pinned (body) point. The body has been
   * fully ripped free of the binding.
   */
  isDetached(): boolean {
    for (const c of this.constraints) {
      if (c.p1.isPinned() !== c.p2.isPinned()) return false
    }
    return true
  }

  /**
   * Drop pinned points and any constraint touching one. Used on a torn
   * page so the body can fall freely without leaving a static binding
   * remnant that would overlap the next page's binding.
   */
  releaseBinding() {
    this.constraints = this.constraints.filter(
      (c) => !c.p1.isPinned() && !c.p2.isPinned(),
    )
    this.points = this.points.filter((p) => !p.isPinned())
  }

  /**
   * Renders the cloth. `tint` (0 = front/active, 1 = deepest in stack)
   * fades the stroke so back pages look further away.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: SimConfig,
    mouse: Mouse,
    tint: number = 0,
  ) {
    ctx.lineWidth = 1

    const dim = 1 - Math.min(1, Math.max(0, tint)) * 0.55

    if (cfg.showTension) {
      // Hue ramps cyan (relaxed) -> magenta (about to tear) by stretch ratio.
      for (const c of this.constraints) {
        const t = Math.min(1, Math.max(0, (c.tension - 1) / 0.6))
        const h = 200 + t * 120
        const l = (55 + (1 - t) * 5) * dim
        ctx.strokeStyle = `hsl(${h.toFixed(1)} 70% ${l.toFixed(1)}%)`
        ctx.beginPath()
        ctx.moveTo(c.p1.x, c.p1.y)
        ctx.lineTo(c.p2.x, c.p2.y)
        ctx.stroke()
      }
    } else {
      const l = 60 * dim
      ctx.strokeStyle = `hsl(220 10% ${l.toFixed(1)}%)`
      ctx.beginPath()
      for (const c of this.constraints) {
        ctx.moveTo(c.p1.x, c.p1.y)
        ctx.lineTo(c.p2.x, c.p2.y)
      }
      ctx.stroke()
    }

    if (mouse.down) {
      const r = mouse.button === 0 ? cfg.mouseCut : cfg.mouseInfluence
      ctx.strokeStyle =
        mouse.button === 0 ? 'rgba(255, 90, 120, 0.55)' : 'rgba(120, 200, 255, 0.55)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}
