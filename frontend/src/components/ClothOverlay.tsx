import { useEffect, useRef } from 'react'
import { useClothSimulation } from '../hooks/useClothSimulation'
import type { PageStack } from '../sim/cloth/PageStack'
import { createMouse, defaultConfig, type SimConfig } from '../sim/cloth/types'
import styles from './ClothOverlay.module.css'

const config: SimConfig = {
  ...defaultConfig,
  cols: 75,
  rows: 40,
  spacing: 10,
  gravity: 400,
  friction: 0.99,
  iterations: 16,
  tearDistance: 60,
  mouseCut: 8,
  mouseInfluence: 36,
  windEnabled: false,
  showTension: true,
  pageRegenerate: true,
}

export function ClothOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseRef = useRef(createMouse())
  const configRef = useRef(config)
  const stackRef = useRef<PageStack | null>(null)

  useClothSimulation({ canvasRef, configRef, mouseRef, stackRef, rebuildKey: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const localPos = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect()
      return { x: clientX - r.left, y: clientY - r.top }
    }

    // Returns true if any cloth constraint midpoint is within mouseCut radius.
    // Used to decide whether a click should interact with cloth or pass through.
    const hasClothAt = (x: number, y: number): boolean => {
      const active = stackRef.current?.active
      if (!active) return false
      const r2 = config.mouseCut * config.mouseCut
      for (const c of active.constraints) {
        const mx = (c.p1.x + c.p2.x) * 0.5
        const my = (c.p1.y + c.p2.y) * 0.5
        const dx = mx - x
        const dy = my - y
        if (dx * dx + dy * dy < r2) return true
      }
      return false
    }

    const onDown = (e: MouseEvent) => {
      const { x, y } = localPos(e.clientX, e.clientY)

      if (!hasClothAt(x, y)) {
        // Torn gap under cursor — pass click through to the element below.
        canvas.style.pointerEvents = 'none'
        const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
        canvas.style.pointerEvents = ''
        target?.click()
        return
      }

      e.preventDefault()
      const m = mouseRef.current
      m.px = x; m.py = y; m.x = x; m.y = y
      m.down = true
      m.button = e.button === 2 ? 2 : 0
    }

    const onMove = (e: MouseEvent) => {
      const { x, y } = localPos(e.clientX, e.clientY)
      const m = mouseRef.current
      m.px = m.x; m.py = m.y; m.x = x; m.y = y
    }

    const onUp = () => { mouseRef.current.down = false }
    const onLeave = () => { mouseRef.current.down = false }
    const onContext = (e: MouseEvent) => e.preventDefault()

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches.length) return
      e.preventDefault()
      const t = e.touches[0]
      const { x, y } = localPos(t.clientX, t.clientY)

      if (!hasClothAt(x, y)) {
        canvas.style.pointerEvents = 'none'
        const target = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null
        canvas.style.pointerEvents = ''
        target?.click()
        return
      }

      const m = mouseRef.current
      m.px = x; m.py = y; m.x = x; m.y = y
      m.down = true
      m.button = 0
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return
      e.preventDefault()
      const t = e.touches[0]
      const { x, y } = localPos(t.clientX, t.clientY)
      const m = mouseRef.current
      m.px = m.x; m.py = m.y; m.x = x; m.y = y
    }

    const onTouchEnd = () => { mouseRef.current.down = false }

    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('contextmenu', onContext)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
    canvas.addEventListener('touchcancel', onTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('contextmenu', onContext)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} />
}
