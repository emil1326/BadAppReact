import svgCaptcha from 'svg-captcha';
import type { GameState } from '../state/store.js';

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

export function startFlow(state: GameState): { endTime: number; codeSvg: string } {
  const endTime = Date.now() + FLOW_DURATION_MS;
  const captcha = generateCaptcha();
  state.flow = { endTime };
  state.codes = { active: captcha.text, burned: [] };
  return { endTime, codeSvg: captcha.data };
}

export function regenerateCode(state: GameState): { codeSvg: string } {
  if (state.codes.active && !state.codes.burned.includes(state.codes.active)) {
    state.codes.burned.push(state.codes.active);
  }
  const captcha = generateCaptcha();
  state.codes.active = captcha.text;
  return { codeSvg: captcha.data };
}

type BurnResult =
  | { ok: true; remainingMs: number }
  | { ok: false; reason: 'NO_ACTIVE_FLOW' | 'FLOW_EXPIRED' | 'INVALID_CODE' };

export function burnCode(state: GameState, providedCode: string): BurnResult {
  if (!state.flow) return { ok: false, reason: 'NO_ACTIVE_FLOW' };
  if (state.flow.endTime <= Date.now()) return { ok: false, reason: 'FLOW_EXPIRED' };
  if (state.codes.active !== providedCode) return { ok: false, reason: 'INVALID_CODE' };

  state.codes.burned.push(providedCode);
  state.codes.active = null;

  return { ok: true, remainingMs: state.flow.endTime - Date.now() };
}

export type FlowSnapshot = {
  active: boolean;
  endTime: number | null;
  expired: boolean;
};

export function getFlowSnapshot(state: GameState): FlowSnapshot {
  if (!state.flow) {
    return { active: false, endTime: null, expired: false };
  }
  const now = Date.now();
  return {
    active: state.flow.endTime > now,
    endTime: state.flow.endTime,
    expired: state.flow.endTime <= now,
  };
}
