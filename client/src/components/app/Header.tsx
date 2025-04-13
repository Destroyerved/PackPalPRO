import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, Bell, Search, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeaderProps {
  title: string;
  user?: User;
  onNewItem?: () => void;
  newItemLabel?: string;
}

export default function Header({ title, user, onNewItem, newItemLabel = "New Item" }: HeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Mobile Menu Button - For mobile sidebar toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-slate-500"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Title / Event Selector */}
        <div className="flex-1 mx-4">
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className={`${showMobileSearch ? 'block fixed inset-0 bg-white z-50 p-4' : 'hidden sm:block'}`}>
            {showMobileSearch && (
              <div className="flex items-center mb-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowMobileSearch(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
                <h2 className="ml-2 text-lg font-medium">Search</h2>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input 
                placeholder="Search..." 
                className="pl-9 pr-3 py-1 w-full"
              />
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="sm:hidden text-slate-500"
            onClick={() => setShowMobileSearch(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-slate-500">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 bg-primary w-2 h-2 rounded-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium">New item added</span>
                  <span className="text-xs text-muted-foreground">Sarah added "Sleeping Bags" to Camping Trip</span>
                  <span className="text-xs text-muted-foreground">2 minutes ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium">Item status updated</span>
                  <span className="text-xs text-muted-foreground">Mike marked "Camping Chairs" as Delivered</span>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium">New event invitation</span>
                  <span className="text-xs text-muted-foreground">Alex invited you to "Beach Day"</span>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-primary">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Add New Item Button */}
          {onNewItem && (
            <Button size="sm" onClick={onNewItem}>
              <Plus className="mr-1 h-4 w-4" /> {newItemLabel}
            </Button>
          )}
          
          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.fullName} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-primary">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.fullName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Help</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-4 pb-3">
        <Tabs defaultValue="items">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
}
