export type Flow = {
  endTime: number | null;
  latestCode: string | null;
};

const defaultFlow: Flow = {
  endTime: null,
  latestCode: null,
};

export function createFlow(overrides: Partial<Flow> = {}): Flow {
  return { ...defaultFlow, ...overrides };
}
