import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StartCampaign() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?type=fundraiser&redirect=/create-campaign" replace />;
  }

  if (user.role === 'customer' || user.role === 'donor') {
    return <Navigate to="/auth?type=fundraiser&redirect=/create-campaign" replace />;
  }

  return <Navigate to="/create-campaign" replace />;
}
