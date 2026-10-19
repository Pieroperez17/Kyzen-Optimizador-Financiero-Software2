import { Navigate, Outlet } from 'react-router-dom';
import { useAuthentication } from '../context/AuthenticationContext.jsx';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthentication();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicRoute() {
  const { isAuthenticated } = useAuthentication();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
