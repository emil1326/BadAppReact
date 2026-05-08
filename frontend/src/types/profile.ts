export type ProfileMode = 'OBSERVATION' | 'SOUMISSION';

export type Profile = {
  mode: ProfileMode;
  studentNumber: string | null;
};

const defaultProfile: Profile = {
  mode: 'SOUMISSION',
  studentNumber: null,
};

export function createProfile(overrides: Partial<Profile> = {}): Profile {
  return { ...defaultProfile, ...overrides };
}
