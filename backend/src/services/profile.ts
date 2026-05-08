import type { GameState, ProfileMode } from '../state/store.js';

/**
 * Public view of the profile that respects the current mode:
 *   - OBSERVATION → student number visible
 *   - SOUMISSION  → student number returned as null (caller can't read it)
 *
 * The actual value is never lost server-side; flipping the mode reveals it
 * again. This is the bad-UX gate the user has to dance through to copy
 * their student number into the bourse form.
 */
export type PublicProfile = {
  mode: ProfileMode;
  studentNumber: string | null;
};

export function getPublicProfile(state: GameState): PublicProfile {
  const { mode, studentNumber } = state.profile;
  return {
    mode,
    studentNumber: mode === 'OBSERVATION' ? studentNumber : null,
  };
}

export function setProfileMode(state: GameState, mode: ProfileMode): PublicProfile {
  state.profile.mode = mode;
  return getPublicProfile(state);
}
