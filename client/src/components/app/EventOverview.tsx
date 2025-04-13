import { Event, Item, EventMember, ItemStatus } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share, Download, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EventOverviewProps {
  event?: Event;
  items: Item[];
  members: (EventMember & { user: any })[];
}

export default function EventOverview({ event, items, members }: EventOverviewProps) {
  if (!event) {
    return null;
  }
  
  // Calculate item counts by status
  const toPackCount = items.filter(item => item.status === ItemStatus.TO_PACK).length;
  const packedCount = items.filter(item => item.status === ItemStatus.PACKED).length;
  const deliveredCount = items.filter(item => item.status === ItemStatus.DELIVERED).length;
  const totalItems = items.length;
  
  const handleDownloadPDF = () => {
    window.open(`/api/events/${event.id}/checklist.pdf`, '_blank');
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{event.name}</h1>
            <p className="text-slate-500">
              {event.startDate && event.endDate ? (
                `${format(new Date(event.startDate), 'MMM d')} - ${format(new Date(event.endDate), 'MMM d, yyyy')}`
              ) : event.startDate ? (
                format(new Date(event.startDate), 'MMM d, yyyy')
              ) : (
                'No dates set'
              )}
              {event.location && ` • ${event.location}`}
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex items-center">
            <Button variant="ghost" size="icon" className="text-slate-500">
              <Share className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500"
              onClick={handleDownloadPDF}
            >
              <Download className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-500">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Event</DropdownMenuItem>
                <DropdownMenuItem>Duplicate Event</DropdownMenuItem>
                <DropdownMenuItem>Add Members</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Delete Event</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Event Progress */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded p-4 text-center">
            <p className="text-slate-500 mb-1">Total Items</p>
            <p className="text-2xl font-bold">{totalItems}</p>
          </div>
          <div className="bg-slate-50 rounded p-4 text-center">
            <p className="text-slate-500 mb-1">To Pack</p>
            <p className="text-2xl font-bold text-primary">{toPackCount}</p>
          </div>
          <div className="bg-slate-50 rounded p-4 text-center">
            <p className="text-slate-500 mb-1">Packed</p>
            <p className="text-2xl font-bold text-amber-500">{packedCount}</p>
          </div>
          <div className="bg-slate-50 rounded p-4 text-center">
            <p className="text-slate-500 mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-500">{deliveredCount}</p>
          </div>
        </div>
        
        {/* Description - if available */}
        {event.description && (
          <div className="mt-4 text-slate-600 text-sm">
            <p>{event.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
