import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import Sidebar from "@/components/app/Sidebar";
import Header from "@/components/app/Header";
import EventOverview from "@/components/app/EventOverview";
import CategoryList from "@/components/app/CategoryList";
import { useWebSocket } from "@/lib/websocket";
import NewItemDialog from "@/components/app/NewItemDialog";
import { Helmet } from "react-helmet-async";
import { useParams } from 'react-router-dom';
import { useEventStore } from '@/stores/eventStore';
import { UserRoleBadge } from '@/components/UserRoleBadge';
import { RoleBasedButton } from '@/components/RoleBasedButton';
import { UserRoleManager } from '@/components/UserRoleManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event } from '@shared/schema';

export default function EventPage() {
  const [_, navigate] = useLocation();
  const [match, params] = useRoute("/app/event/:id");
  const { toast } = useToast();
  const { authenticate, subscribe, unsubscribe } = useWebSocket();
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const { eventId } = useParams();
  const { currentEvent, setCurrentEvent, updateEvent, deleteEvent } = useEventStore();
  
  const eventIdParsed = parseInt(params?.id || "0");
  
  // Fetch current user data
  const { data: user, isLoading: isLoadingUser, isError: isUserError } = useQuery({ 
    queryKey: ['/api/auth/me'] 
  });
  
  // Fetch user's events for sidebar
  const { data: events } = useQuery({ 
    queryKey: ['/api/events'],
    enabled: !!user, // Only fetch events if user is loaded
  });
  
  // Fetch current event
  const { 
    data: event, 
    isLoading: isLoadingEvent, 
    isError: isEventError 
  } = useQuery({ 
    queryKey: [`/api/events/${eventIdParsed}`],
    enabled: !!user && eventIdParsed > 0,
  });
  
  // Fetch event categories
  const { 
    data: categories
  } = useQuery({ 
    queryKey: [`/api/events/${eventIdParsed}/categories`],
    enabled: !!event,
  });
  
  // Fetch event items
  const { 
    data: items
  } = useQuery({ 
    queryKey: [`/api/events/${eventIdParsed}/items`],
    enabled: !!event,
  });
  
  // Fetch event members
  const { 
    data: members
  } = useQuery({ 
    queryKey: [`/api/events/${eventIdParsed}/members`],
    enabled: !!event,
  });
  
  // Authenticate WebSocket connection
  useEffect(() => {
    if (user?.id) {
      authenticate(user.id);
      
      if (eventIdParsed) {
        subscribe(eventIdParsed);
      }
    }
    
    return () => {
      if (eventIdParsed) {
        unsubscribe(eventIdParsed);
      }
    };
  }, [user, eventIdParsed, authenticate, subscribe, unsubscribe]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (isUserError) {
      toast({
        title: "Authentication required",
        description: "Please login to access this event",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isUserError, navigate, toast]);
  
  // Handle event loading error
  useEffect(() => {
    if (isEventError) {
      toast({
        title: "Event not found",
        description: "The event you're looking for doesn't exist or you don't have access",
        variant: "destructive",
      });
      navigate("/app");
    }
  }, [isEventError, navigate, toast]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    }
  };
  
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
  
  if (isLoadingUser || isLoadingEvent) {
    return <div className="flex h-screen justify-center items-center">Loading...</div>;
  }
  
  if (!currentEvent) {
    return <div>Loading...</div>;
  }

  const currentUserId = 'current-user-id'; // This should come from your auth context
  const currentRole = currentEvent.userRoles[currentUserId] as UserRole;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Helmet>
        <title>{currentEvent?.name ? `${currentEvent.name} - PackPal` : 'Event - PackPal'}</title>
      </Helmet>
      
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        activePage="event" 
        activeEventId={eventIdParsed}
        events={events || []} 
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Header 
          title={currentEvent?.name || "Event"}
          user={user}
          onNewItem={() => setIsNewItemDialogOpen(true)}
          newItemLabel="New Item"
        />
        
        <main className="p-6">
          {/* Event Overview */}
          <EventOverview 
            event={currentEvent}
            items={items || []}
            members={members || []}
          />
          
          {/* Categories and Items */}
          <CategoryList 
            categories={categories || []}
            items={items || []}
            members={members || []}
            eventId={eventIdParsed}
          />

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
        </main>
      </div>
      
      {/* New Item Dialog */}
      <NewItemDialog
        open={isNewItemDialogOpen}
        onOpenChange={setIsNewItemDialogOpen}
        categories={categories || []}
        eventId={eventIdParsed}
        members={members || []}
      />
    </div>
  );
}

// Import here to avoid circular dependency
import { apiRequest } from "@/lib/queryClient";
