import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../store/api';

export function useLogoutAndRedirect() {
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();

  const logoutAndRedirect = async () => {
    await logout();
    navigate('/login');
  };

  return { logoutAndRedirect, isLoggingOut: isLoading };
}
