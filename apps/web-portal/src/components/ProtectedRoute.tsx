import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  /** If provided, user must have at least one of these roles */
  roles?: string[];
}

export default function ProtectedRoute({ roles }: Props) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If specific roles are required and the user doesn't have one, show 403
  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-gray-500">
        <p className="text-2xl font-semibold">Access Denied</p>
        <p className="text-sm">You don't have permission to view this page.</p>
      </div>
    );
  }

  return <Outlet />;
}

