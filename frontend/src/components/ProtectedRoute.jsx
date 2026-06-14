import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const roleAliases = {
    customer: ['customer', 'donor'],
    donor: ['customer', 'donor'],
    manager: ['manager', 'fundraiser'],
    fundraiser: ['manager', 'fundraiser'],
    admin: ['admin'],
  };
  const allowedRoles = roles?.flatMap((role) => roleAliases[role] || [role]);

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
