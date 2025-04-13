import { ReactNode } from 'react';
import { UserRole, ROLE_PERMISSIONS } from '@shared/schema';

interface RoleBasedAccessProps {
  children: ReactNode;
  requiredRole: UserRole;
  currentRole: UserRole;
  fallback?: ReactNode;
}

export function RoleBasedAccess({
  children,
  requiredRole,
  currentRole,
  fallback = null,
}: RoleBasedAccessProps) {
  const currentPermissions = ROLE_PERMISSIONS[currentRole];
  const requiredPermissions = ROLE_PERMISSIONS[requiredRole];

  // Check if current role has all required permissions
  const hasAccess = Object.entries(requiredPermissions).every(
    ([permission, value]) => currentPermissions[permission as keyof typeof currentPermissions] === value
  );

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

interface PermissionBasedAccessProps {
  children: ReactNode;
  permission: keyof typeof ROLE_PERMISSIONS.owner;
  currentRole: UserRole;
  fallback?: ReactNode;
}

export function PermissionBasedAccess({
  children,
  permission,
  currentRole,
  fallback = null,
}: PermissionBasedAccessProps) {
  const hasPermission = ROLE_PERMISSIONS[currentRole][permission];
  return hasPermission ? <>{children}</> : <>{fallback}</>;
} 