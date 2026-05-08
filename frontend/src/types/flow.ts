export type Flow = {
  endTime: number | null;
  latestCodeSvg: string | null;
};

const defaultFlow: Flow = {
  endTime: null,
  latestCodeSvg: null,
};

export function createFlow(overrides: Partial<Flow> = {}): Flow {
  return { ...defaultFlow, ...overrides };
}
