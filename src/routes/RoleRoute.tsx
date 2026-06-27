import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/user';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/ui/Button';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallback?: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles, fallback }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Handled by parent ProtectedRoute spinner
  }

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-surface border border-border-color rounded-2xl max-w-md mx-auto mt-12 shadow-sm">
        <div className="p-4 rounded-full bg-danger/10 border border-danger/20 text-danger mb-4 flex items-center justify-center">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-text-main mb-2 select-none">403 - Access Denied</h2>
        <p className="text-sm text-text-muted mb-6">
          You do not have permission to access this administration page.
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleRoute;
