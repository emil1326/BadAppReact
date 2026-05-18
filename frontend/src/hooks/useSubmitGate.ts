import { useProfile } from '../store/hooks';

export function useSubmitGate() {
  const { mode } = useProfile();
  return {
    canSubmit: mode === 'SOUMISSION',
  };
}
