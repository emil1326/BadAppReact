import { Cloth } from './Cloth'
import type { Mouse, SimConfig } from './types'
import { createMouse } from './types'

const idleMouse: Mouse = createMouse()

/**
 * Owns at most ONE active page plus any pages currently falling after
 * being torn. Pages further "behind" are not pre-built or simulated --
 * a fresh page is materialized only after the active one tears free.
 */
export class PageStack {
  active: Cloth | null
  fallen: Cloth[] = []

  constructor(cfg: SimConfig, width: number, height: number) {
    this.active = new Cloth(cfg, width, height)
  }

  /** Manually retire the active page (e.g. a "Next page" button). */
  advance(cfg: SimConfig, width: number, height: number) {
    if (!this.active) return
    this.active.releaseBinding()
    this.fallen.push(this.active)
    this.active = cfg.pageRegenerate ? new Cloth(cfg, width, height) : null
  }

  update(
    dt: number,
    cfg: SimConfig,
    mouse: Mouse,
    width: number,
    height: number,
  ) {
    if (this.active) {
      this.active.update(dt, cfg, mouse, width, height)
      if (this.active.isDetached()) {
        this.active.releaseBinding()
        this.fallen.push(this.active)
        this.active = cfg.pageRegenerate ? new Cloth(cfg, width, height) : null
      }
    }

    for (const p of this.fallen) {
      p.update(dt, cfg, idleMouse, width, height)
    }

    this.fallen = this.fallen.filter((p) => !this.isFullyOffscreen(p, height))
  }

  draw(ctx: CanvasRenderingContext2D, cfg: SimConfig, mouse: Mouse) {
    // Active page sits behind the falling debris of previously torn pages.
    if (this.active) {
      this.active.draw(ctx, cfg, mouse, 0)
    }
    for (const p of this.fallen) {
      p.draw(ctx, cfg, idleMouse, 0)
    }
  }

  private isFullyOffscreen(cloth: Cloth, height: number) {
    if (cloth.points.length === 0) return true
    for (const p of cloth.points) {
      if (p.y < height + 80) return false
    }
    return true
  }
}
