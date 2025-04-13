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

export default function EventPage() {
  const [_, navigate] = useLocation();
  const [match, params] = useRoute("/app/event/:id");
  const { toast } = useToast();
  const { authenticate, subscribe, unsubscribe } = useWebSocket();
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  
  const eventId = parseInt(params?.id || "0");
  
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
    queryKey: [`/api/events/${eventId}`],
    enabled: !!user && eventId > 0,
  });
  
  // Fetch event categories
  const { 
    data: categories
  } = useQuery({ 
    queryKey: [`/api/events/${eventId}/categories`],
    enabled: !!event,
  });
  
  // Fetch event items
  const { 
    data: items
  } = useQuery({ 
    queryKey: [`/api/events/${eventId}/items`],
    enabled: !!event,
  });
  
  // Fetch event members
  const { 
    data: members
  } = useQuery({ 
    queryKey: [`/api/events/${eventId}/members`],
    enabled: !!event,
  });
  
  // Authenticate WebSocket connection
  useEffect(() => {
    if (user?.id) {
      authenticate(user.id);
      
      if (eventId) {
        subscribe(eventId);
      }
    }
    
    return () => {
      if (eventId) {
        unsubscribe(eventId);
      }
    };
  }, [user, eventId, authenticate, subscribe, unsubscribe]);
  
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
  
  if (isLoadingUser || isLoadingEvent) {
    return <div className="flex h-screen justify-center items-center">Loading...</div>;
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Helmet>
        <title>{event?.name ? `${event.name} - PackPal` : 'Event - PackPal'}</title>
      </Helmet>
      
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        activePage="event" 
        activeEventId={eventId}
        events={events || []} 
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Header 
          title={event?.name || "Event"}
          user={user}
          onNewItem={() => setIsNewItemDialogOpen(true)}
          newItemLabel="New Item"
        />
        
        <main className="p-6">
          {/* Event Overview */}
          <EventOverview 
            event={event}
            items={items || []}
            members={members || []}
          />
          
          {/* Categories and Items */}
          <CategoryList 
            categories={categories || []}
            items={items || []}
            members={members || []}
            eventId={eventId}
          />
        </main>
      </div>
      
      {/* New Item Dialog */}
      <NewItemDialog
        open={isNewItemDialogOpen}
        onOpenChange={setIsNewItemDialogOpen}
        categories={categories || []}
        eventId={eventId}
        members={members || []}
      />
    </div>
  );
}

// Import here to avoid circular dependency
import { apiRequest } from "@/lib/queryClient";
