import { Home, Calendar, List, Bell, Settings, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { User, Event } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  user?: User;
  onLogout: () => void;
  activePage: string;
  activeEventId?: number;
  events?: Event[];
}

export default function Sidebar({ user, onLogout, activePage, activeEventId, events = [] }: SidebarProps) {
  const [location, navigate] = useLocation();
  
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="w-64 bg-white shadow-md z-10 flex-shrink-0 hidden md:flex flex-col h-screen">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="text-primary text-xl font-bold">PackPal</a>
          </Link>
        </div>
      </div>
      
      {/* User Info */}
      {user && (
        <div className="p-4 border-b">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.fullName} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-primary">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-medium">{user.fullName}</p>
              <p className="text-sm text-slate-500">Free Plan</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="p-4 flex-grow flex flex-col">
        <div className="space-y-1">
          <Link href="/app">
            <a className={cn(
              "flex items-center px-3 py-2 rounded-md font-medium",
              activePage === "dashboard" 
                ? "text-primary bg-blue-50"
                : "text-slate-700 hover:bg-slate-100"
            )}>
              <Home className="w-5 h-5 mr-2" />
              <span>Dashboard</span>
            </a>
          </Link>
          <Link href="#">
            <a className={cn(
              "flex items-center px-3 py-2 rounded-md font-medium",
              activePage === "events" 
                ? "text-primary bg-blue-50"
                : "text-slate-700 hover:bg-slate-100"
            )}>
              <Calendar className="w-5 h-5 mr-2" />
              <span>My Events</span>
            </a>
          </Link>
          <Link href="/app/templates">
            <a className={cn(
              "flex items-center px-3 py-2 rounded-md font-medium",
              activePage === "templates" 
                ? "text-primary bg-blue-50"
                : "text-slate-700 hover:bg-slate-100"
            )}>
              <List className="w-5 h-5 mr-2" />
              <span>Templates</span>
            </a>
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="#">
                  <a className={cn(
                    "flex items-center px-3 py-2 rounded-md font-medium",
                    activePage === "notifications" 
                      ? "text-primary bg-blue-50"
                      : "text-slate-700 hover:bg-slate-100"
                  )}>
                    <Bell className="w-5 h-5 mr-2" />
                    <span>Notifications</span>
                    <span className="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">3</span>
                  </a>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>You have 3 new notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Recent Events */}
        {events.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 flex-grow">
            <h3 className="px-3 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Recent Events
            </h3>
            <ScrollArea className="h-[200px] pr-2">
              <div className="pr-3">
                {events.map((event) => {
                  // Determine status indicator color
                  const today = new Date();
                  const startDate = event.startDate ? new Date(event.startDate) : null;
                  const endDate = event.endDate ? new Date(event.endDate) : null;
                  
                  let statusColor = "bg-gray-300"; // Default/past event
                  
                  if (startDate && endDate) {
                    if (today < startDate) {
                      statusColor = "bg-green-500"; // Upcoming
                    } else if (today >= startDate && today <= endDate) {
                      statusColor = "bg-yellow-500"; // Active
                    }
                  }
                  
                  return (
                    <Link key={event.id} href={`/app/event/${event.id}`}>
                      <a className={cn(
                        "flex items-center px-3 py-2 rounded-md mb-1",
                        activeEventId === event.id
                          ? "bg-blue-50 text-primary"
                          : "hover:bg-slate-100 text-slate-700"
                      )}>
                        <span className={`w-2 h-2 ${statusColor} rounded-full mr-2`}></span>
                        <span className="truncate">{event.name}</span>
                        {activeEventId === event.id && <ChevronRight className="ml-auto h-4 w-4" />}
                      </a>
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Bottom Actions */}
        <div className="mt-auto space-y-1">
          <Link href="#">
            <a className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md">
              <Settings className="w-5 h-5 mr-2" />
              <span>Settings</span>
            </a>
          </Link>
          <Link href="#">
            <a className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md">
              <HelpCircle className="w-5 h-5 mr-2" />
              <span>Help & Support</span>
            </a>
          </Link>
          <button 
            onClick={onLogout}
            className="flex w-full items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
