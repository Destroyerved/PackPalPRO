import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole, ROLE_PERMISSIONS } from '@shared/schema';
import { useEventStore } from '@/stores/eventStore';

interface RoleBasedRouteProps {
  children: ReactNode;
  requiredRole: UserRole;
  fallbackPath?: string;
}

export function RoleBasedRoute({
  children,
  requiredRole,
  fallbackPath = '/',
}: RoleBasedRouteProps) {
  const location = useLocation();
  const { currentEvent } = useEventStore();

  if (!currentEvent) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Get the current user's role from the event's userRoles
  const currentUserId = 'current-user-id'; // This should come from your auth context
  const currentRole = currentEvent.userRoles[currentUserId] as UserRole;
  
  if (!currentRole) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  const currentPermissions = ROLE_PERMISSIONS[currentRole];
  const requiredPermissions = ROLE_PERMISSIONS[requiredRole];

  const hasAccess = Object.entries(requiredPermissions).every(
    ([permission, value]) => currentPermissions[permission as keyof typeof currentPermissions] === value
  );

  if (!hasAccess) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 