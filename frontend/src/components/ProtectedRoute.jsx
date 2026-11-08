import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Spinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Cargando">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
