import { Button, ButtonProps } from '@/components/ui/button';
import { PermissionBasedAccess } from './RoleBasedAccess';
import { UserRole, ROLE_PERMISSIONS } from '@shared/schema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

interface RoleBasedButtonProps extends ButtonProps {
  permission: keyof typeof ROLE_PERMISSIONS.owner;
  currentRole: UserRole;
  tooltip?: string;
}

export function RoleBasedButton({
  permission,
  currentRole,
  tooltip = 'You do not have permission to perform this action',
  children,
  ...props
}: RoleBasedButtonProps) {
  return (
    <PermissionBasedAccess
      currentRole={currentRole}
      permission={permission}
      fallback={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button disabled {...props}>
                <Lock className="mr-2 h-4 w-4" />
                {children}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    >
      <Button {...props}>{children}</Button>
    </PermissionBasedAccess>
  );
} 