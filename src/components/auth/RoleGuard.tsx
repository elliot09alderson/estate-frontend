import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<'user' | 'agent' | 'admin'>;
  fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="flex flex-col items-center p-6">
          <ShieldX className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground text-center">
            Please log in to access this content.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="flex flex-col items-center p-6">
          <ShieldX className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground text-center">
            You don't have permission to access this content.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Required roles: {allowedRoles.join(', ')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;