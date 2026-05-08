import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../store/api';

/**
 * Single canonical "logout then go to /login" flow. The logout mutation's
 * `onQueryStarted` already resets auth state on both success and failure, so
 * navigation is unconditional.
 */
export function useLogoutAndRedirect() {
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();

  const logoutAndRedirect = async () => {
    await logout();
    navigate('/login');
  };

  return { logoutAndRedirect, isLoggingOut: isLoading };
}
