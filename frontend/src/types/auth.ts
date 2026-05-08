export type Auth = {
  sessionId: string | null;
  userName: string | null;
};

const defaultAuth: Auth = {
  sessionId: null,
  userName: null,
};

export function createAuth(overrides: Partial<Auth> = {}): Auth {
  return { ...defaultAuth, ...overrides };
}
