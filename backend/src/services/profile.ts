import type { GameState, ProfileMode } from '../state/store.js';

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
