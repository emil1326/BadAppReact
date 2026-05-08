import { useEffect, type RefObject } from 'react'
import { PageStack } from '../sim/cloth/PageStack'
import type { Mouse, SimConfig } from '../sim/cloth/types'

type Args = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  configRef: RefObject<SimConfig>
  mouseRef: RefObject<Mouse>
  stackRef?: RefObject<PageStack | null>
  rebuildKey: number
}

export function useClothSimulation({
  canvasRef,
  configRef,
  mouseRef,
  stackRef,
  rebuildKey,
}: Args) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = window.devicePixelRatio || 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = window.devicePixelRatio || 1
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    const stack = new PageStack(configRef.current, width, height)
    if (stackRef) stackRef.current = stack

    let resizePending = 0
    const observer = new ResizeObserver(() => {
      if (resizePending) return
      resizePending = requestAnimationFrame(() => {
        resizePending = 0
        resize()
      })
    })
    observer.observe(canvas)

    const fixedDt = 1 / 60
    let acc = 0
    let last = performance.now()
    let raf = 0

    const frame = (now: number) => {
      const elapsed = Math.min((now - last) / 1000, 0.05)
      last = now
      acc += elapsed

      while (acc >= fixedDt) {
        stack.update(fixedDt, configRef.current, mouseRef.current, width, height)
        acc -= fixedDt
      }

      ctx.clearRect(0, 0, width, height)
      stack.draw(ctx, configRef.current, mouseRef.current)

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      if (resizePending) cancelAnimationFrame(resizePending)
      observer.disconnect()
      if (stackRef) stackRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rebuildKey])
}
