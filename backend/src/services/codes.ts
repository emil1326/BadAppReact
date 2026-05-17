import type { GameState } from '../state/store.js';

function generate2FACode(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString();
}

function generateAlphanumericCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function init2FA(state: GameState): { code2FA: string } {
  const code = generate2FACode();
  if (!state.emailCodes) {
    state.emailCodes = { code2FA: null, codeA: null, codeB: null, used2FA: false, usedA: false };
  }
  state.emailCodes.code2FA = code;
  state.emailCodes.used2FA = false;
  return { code2FA: code };
}

type Verify2FAResult =
  | { ok: true; codeA: string }
  | { ok: false; reason: 'NO_CODE' | 'INVALID_CODE' | 'ALREADY_USED' };

export function verify2FA(state: GameState, providedCode: string): Verify2FAResult {
  if (!state.emailCodes?.code2FA) {
    return { ok: false, reason: 'NO_CODE' };
  }
  if (state.emailCodes.used2FA) {
    return { ok: false, reason: 'ALREADY_USED' };
  }
  if (state.emailCodes.code2FA !== providedCode.trim()) {
    return { ok: false, reason: 'INVALID_CODE' };
  }

  const codeA = generateAlphanumericCode();
  state.emailCodes.codeA = codeA;
  state.emailCodes.used2FA = true;

  return { ok: true, codeA };
}

type ExchangeCodeAResult =
  | { ok: true; codeB: string }
  | { ok: false; reason: 'NO_CODE' | 'INVALID_CODE' | 'ALREADY_USED' };

export function exchangeCodeA(state: GameState, providedCodeA: string): ExchangeCodeAResult {
  if (!state.emailCodes?.codeA) {
    return { ok: false, reason: 'NO_CODE' };
  }
  if (state.emailCodes.usedA) {
    return { ok: false, reason: 'ALREADY_USED' };
  }
  if (state.emailCodes.codeA !== providedCodeA.trim()) {
    return { ok: false, reason: 'INVALID_CODE' };
  }

  const codeB = generateAlphanumericCode();
  state.emailCodes.codeB = codeB;
  state.emailCodes.usedA = true;

  return { ok: true, codeB };
}

export function validateCodeB(state: GameState, providedCodeB: string): boolean {
  return state.emailCodes?.codeB === providedCodeB.trim();
}
