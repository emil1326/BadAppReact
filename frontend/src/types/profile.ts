export type ProfileMode = 'OBSERVATION' | 'SOUMISSION';

export type Profile = {
  mode: ProfileMode;
  studentNumber: string | null;
};

const defaultProfile: Profile = {
  mode: 'OBSERVATION',
  studentNumber: null,
};

export function createProfile(overrides: Partial<Profile> = {}): Profile {
  return { ...defaultProfile, ...overrides };
}
