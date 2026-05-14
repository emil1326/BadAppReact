import type { GameState } from '../state/store.js';

/**
 * Generates a numeric 6-digit 2FA code (e.g., "482759").
 */
function generate2FACode(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString();
}

/**
 * Generates an alphanumeric code (uppercase letters + digits, ~10 chars).
 * Used for Code A and Code B.
 */
function generateAlphanumericCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes ambiguous chars (0,O,1,I)
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Initializes the 2FA flow: generates a 2FA code and stores it in the game state.
 * Returns the code to be sent via email.
 */
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

/**
 * Verifies the 2FA code provided by the user. If valid, generates Code A
 * and marks the 2FA code as used.
 */
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

  // Generate Code A
  const codeA = generateAlphanumericCode();
  state.emailCodes.codeA = codeA;
  state.emailCodes.used2FA = true;

  return { ok: true, codeA };
}

type ExchangeCodeAResult =
  | { ok: true; codeB: string }
  | { ok: false; reason: 'NO_CODE' | 'INVALID_CODE' | 'ALREADY_USED' };

/**
 * Exchanges Code A for Code B. Code A is marked as used after successful exchange.
 */
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

  // Generate Code B
  const codeB = generateAlphanumericCode();
  state.emailCodes.codeB = codeB;
  state.emailCodes.usedA = true;

  return { ok: true, codeB };
}

/**
 * Validates that Code B is correct for final submission.
 */
export function validateCodeB(state: GameState, providedCodeB: string): boolean {
  return state.emailCodes?.codeB === providedCodeB.trim();
}
