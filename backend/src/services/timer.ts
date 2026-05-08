import type { GameState } from '../state/store.js';

const FLOW_DURATION_MS = 3 * 60 * 1000; // 3 minutes

function generate6DigitCode(): string {
  const value = Math.floor(Math.random() * 1_000_000);
  return value.toString().padStart(6, '0');
}

export function startFlow(state: GameState): { endTime: number; code: string } {
  const endTime = Date.now() + FLOW_DURATION_MS;
  const code = generate6DigitCode();
  state.flow = { endTime };
  state.codes = { active: code, burned: [] };
  return { endTime, code };
}

export function regenerateCode(state: GameState): string {
  if (state.codes.active && !state.codes.burned.includes(state.codes.active)) {
    state.codes.burned.push(state.codes.active);
  }
  const code = generate6DigitCode();
  state.codes.active = code;
  return code;
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
