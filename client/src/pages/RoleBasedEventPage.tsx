import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEventStore } from '@/stores/eventStore';
import { UserRoleBadge } from '@/components/UserRoleBadge';
import { RoleBasedButton } from '@/components/RoleBasedButton';
import { UserRoleManager } from '@/components/UserRoleManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Event, UserRole } from '@shared/schema';

export function RoleBasedEventPage() {
  const { eventId } = useParams();
  const { currentEvent, setCurrentEvent, updateEvent, deleteEvent } = useEventStore();
  const { toast } = useToast();

  useEffect(() => {
    if (eventId) {
      // Fetch event data
      fetch(`/api/events/${eventId}`)
        .then(res => res.json())
        .then((data: Event) => setCurrentEvent(data))
        .catch(error => {
          toast({
            title: 'Error',
            description: 'Failed to load event',
            variant: 'destructive',
          });
        });
    }
  }, [eventId, setCurrentEvent, toast]);

  if (!currentEvent) {
    return <div>Loading...</div>;
  }

  const currentUserId = 'current-user-id'; // This should come from your auth context
  const currentRole = currentEvent.userRoles[currentUserId] as UserRole;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{currentEvent.name}</h1>
          <p className="text-muted-foreground">{currentEvent.description}</p>
        </div>
        <UserRoleBadge role={currentRole} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Event Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <RoleBasedButton
              permission="canEditItems"
              currentRole={currentRole}
              onClick={() => {
                updateEvent(currentEvent.id.toString(), { name: 'Updated Event Name' });
              }}
            >
              Edit Event
            </RoleBasedButton>

            <RoleBasedButton
              permission="canManageUsers"
              currentRole={currentRole}
              onClick={() => {
                // Handle manage users
              }}
            >
              Manage Users
            </RoleBasedButton>

            <RoleBasedButton
              permission="canManageSettings"
              currentRole={currentRole}
              onClick={() => {
                deleteEvent(currentEvent.id.toString());
              }}
              variant="destructive"
            >
              Delete Event
            </RoleBasedButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <UserRoleManager
              eventId={currentEvent.id.toString()}
              currentUserRole={currentRole}
              userRoles={currentEvent.userRoles}
              onRoleChange={(userId, newRole) => {
                // Role change will be handled by the component
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 