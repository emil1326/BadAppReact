import svgCaptcha from 'svg-captcha';
import type { FlowState, GameState } from '../state/store.js';

const FLOW_DURATION_MS = 3 * 60 * 1000; // 3 minutes

function generateCaptcha(): { text: string; data: string } {
  return svgCaptcha.create({
    size: 6,
    charPreset: '0123456789',
    noise: 4,
    color: true,
    background: '#f7efd9',
    width: 280,
    height: 88,
  });
}

type FlowGuard =
  | { ok: true; flow: FlowState }
  | { ok: false; reason: 'NO_ACTIVE_FLOW' | 'FLOW_EXPIRED' };

export function getActiveFlow(state: GameState): FlowGuard {
  if (!state.flow) return { ok: false, reason: 'NO_ACTIVE_FLOW' };
  if (state.flow.endTime <= Date.now()) return { ok: false, reason: 'FLOW_EXPIRED' };
  return { ok: true, flow: state.flow };
}

export function startFlow(state: GameState): { endTime: number; codeSvg: string } {
  const endTime = Date.now() + FLOW_DURATION_MS;
  const captcha = generateCaptcha();
  state.flow = { endTime };
  state.codes = { active: captcha.text };
  return { endTime, codeSvg: captcha.data };
}

export function regenerateCode(state: GameState): { codeSvg: string } {
  const captcha = generateCaptcha();
  state.codes.active = captcha.text;
  return { codeSvg: captcha.data };
}

type BurnResult =
  | { ok: true; remainingMs: number }
  | { ok: false; reason: 'NO_ACTIVE_FLOW' | 'FLOW_EXPIRED' | 'INVALID_CODE' };

export function burnCode(state: GameState, providedCode: string): BurnResult {
  const active = getActiveFlow(state);
  if (!active.ok) return active;
  if (state.codes.active !== providedCode) return { ok: false, reason: 'INVALID_CODE' };
  state.codes.active = null;
  return { ok: true, remainingMs: active.flow.endTime - Date.now() };
}
