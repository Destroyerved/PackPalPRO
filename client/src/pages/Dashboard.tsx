import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Sidebar from "@/components/app/Sidebar";
import Header from "@/components/app/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/websocket";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import NewEventDialog from "@/components/app/NewEventDialog";
import JoinEventDialog from "@/components/app/JoinEventDialog";
import { Helmet } from "react-helmet-async";

export default function Dashboard() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { authenticate } = useWebSocket();
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [isJoinEventDialogOpen, setIsJoinEventDialogOpen] = useState(false);
  
  // Mock user data for direct access
  const mockUser = {
    id: 1,
    username: 'demo',
    password: 'demo123',
    email: 'demo@example.com',
    fullName: 'Demo User',
    profilePic: null,
    createdAt: new Date()
  };
  const user = mockUser;
  const isLoadingUser = false;
  const isUserError = false;
  
  // Mock events data
  const mockEvents = [
    {
      id: 1,
      name: 'Demo Event',
      description: 'A demo event for testing',
      createdAt: new Date(),
      startDate: new Date(),
      endDate: new Date(),
      location: 'Demo Location',
      createdBy: 1,
      userRoles: {}
    }
  ];

  // Use mock events data
  const events = mockEvents;
  const isLoadingEvents = false;
  const isEventsError = false;
  
  // Authenticate WebSocket connection
  useEffect(() => {
    if (user?.id) {
      authenticate(user.id);
    }
  }, [user, authenticate]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (isUserError) {
      toast({
        title: "Authentication required",
        description: "Please login to access the dashboard",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isUserError, navigate, toast]);
  
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
  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Helmet>
        <title>Dashboard - PackPal</title>
      </Helmet>
      
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} activePage="dashboard" events={events || []} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Header 
          title="Dashboard" 
          user={user}
          onNewItem={() => setIsNewEventDialogOpen(true)}
          newItemLabel="New Event"
        />
        
        <main className="p-6">
          {/* Events Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Events</h2>
              <Button onClick={() => setIsNewEventDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Event
              </Button>
            </div>
            
            {isLoadingEvents ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-0">
                      <div className="p-6">
                        <Skeleton className="h-6 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-4" />
                        <div className="flex items-center">
                          <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <Card 
                    key={event.id} 
                    className="hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/app/event/${event.id}`)}
                  >
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-1">{event.name}</h3>
                      <p className="text-sm text-slate-500 mb-3">
                        {event.location && `${event.location} • `}
                        {event.startDate && (
                          event.endDate 
                            ? `${format(new Date(event.startDate), 'MMM d')} - ${format(new Date(event.endDate), 'MMM d, yyyy')}`
                            : format(new Date(event.startDate), 'MMM d, yyyy')
                        )}
                      </p>
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {event.startDate 
                            ? format(new Date(event.startDate), 'MMMM yyyy')
                            : 'No date set'
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4 text-slate-400">
                  <Calendar className="h-12 w-12 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">No events found</h3>
                </div>
                <p className="text-slate-500 mb-4">Create your first event to get started</p>
                <Button onClick={() => setIsNewEventDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Event
                </Button>
              </div>
            )}
          </div>
          
          {/* Quick Links Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="hover:shadow-md transition cursor-pointer"
                onClick={() => setIsNewEventDialogOpen(true)}
              >
                <CardContent className="p-6 flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Create New Event</h3>
                    <p className="text-sm text-slate-500">Start planning your next trip or event</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="hover:shadow-md transition cursor-pointer"
                onClick={() => setIsJoinEventDialogOpen(true)}
              >
                <CardContent className="p-6 flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Join Event</h3>
                    <p className="text-sm text-slate-500">Join an event with invite code</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="hover:shadow-md transition cursor-pointer"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Templates feature will be available in the next update",
                  });
                }}
              >
                <CardContent className="p-6 flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Templates</h3>
                    <p className="text-sm text-slate-500">View and use packing templates</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      {/* New Event Dialog */}
      <NewEventDialog
        open={isNewEventDialogOpen}
        onOpenChange={setIsNewEventDialogOpen}
      />
      
      {/* Join Event Dialog */}
      <JoinEventDialog
        open={isJoinEventDialogOpen}
        onOpenChange={setIsJoinEventDialogOpen}
      />
    </div>
  );
}
