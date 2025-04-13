import { UserRole } from '@shared/schema';
import { cn } from '@/lib/utils';

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleColors = {
  owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  member: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        roleColors[role],
        className
      )}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
} 