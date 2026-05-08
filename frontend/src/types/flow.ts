export type Flow = {
  endTime: number | null;
};

const defaultFlow: Flow = {
  endTime: null,
};

export function createFlow(overrides: Partial<Flow> = {}): Flow {
  return { ...defaultFlow, ...overrides };
}
