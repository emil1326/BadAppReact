export type SimConfig = {
  cols: number
  rows: number
  spacing: number

  gravity: number
  friction: number
  iterations: number

  tearDistance: number
  mouseCut: number
  mouseInfluence: number

  windEnabled: boolean
  windStrength: number

  showTension: boolean

  pageRegenerate: boolean
}

export type Mouse = {
  x: number
  y: number
  px: number
  py: number
  down: boolean
  button: 0 | 2
}

export const defaultConfig: SimConfig = {
  cols: 60,
  rows: 30,
  spacing: 10,

  gravity: 400,
  friction: 0.99,
  iterations: 16,

  tearDistance: 60,
  mouseCut: 8,
  mouseInfluence: 36,

  windEnabled: false,
  windStrength: 80,

  showTension: true,

  pageRegenerate: true,
}

export const createMouse = (): Mouse => ({
  x: 0,
  y: 0,
  px: 0,
  py: 0,
  down: false,
  button: 0,
})
