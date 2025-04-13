import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { UserRole, ROLE_PERMISSIONS } from '@shared/schema';
import { useEventStore } from '@/stores/eventStore';

interface UserRoleManagerProps {
  eventId: string;
  currentUserRole: UserRole;
  userRoles: Record<string, UserRole>;
  onRoleChange: (userId: string, newRole: UserRole) => void;
}

export function UserRoleManager({
  eventId,
  currentUserRole,
  userRoles,
  onRoleChange,
}: UserRoleManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateUserRole } = useEventStore();

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setIsLoading(true);
      await updateUserRole(eventId, userId, newRole);
      onRoleChange(userId, newRole);
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canManageUsers = ROLE_PERMISSIONS[currentUserRole].canManageUsers;

  if (!canManageUsers) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage User Roles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(userRoles).map(([userId, role]) => (
            <div key={userId} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{userId}</p>
                <p className="text-sm text-muted-foreground">Current role: {role}</p>
              </div>
              <Select
                value={role}
                onValueChange={(value) => handleRoleChange(userId, value as UserRole)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UserRole).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 