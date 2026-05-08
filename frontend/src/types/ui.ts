export type UiState = {
  logoutLocked: boolean;
};

const defaultUiState: UiState = {
  logoutLocked: false,
};

export function createUiState(overrides: Partial<UiState> = {}): UiState {
  return { ...defaultUiState, ...overrides };
}
