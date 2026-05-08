import { useProfile } from '../store/hooks';

/**
 * Submit-side gate driven by the profile mode. Returns `canSubmit: false`
 * when the user is in `OBSERVATION` mode — buttons should grey themselves
 * out without surfacing a clear reason. The user has to figure out the link
 * to the profile mode toggle on their own.
 */
export function useSubmitGate() {
  const { mode } = useProfile();
  return {
    canSubmit: mode === 'SOUMISSION',
  };
}
