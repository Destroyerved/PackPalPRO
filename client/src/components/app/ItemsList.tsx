import { useState, useMemo } from "react";
import { Item, ItemStatus, EventMember } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { MessageSquare, MoreVertical, Search, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ItemsListProps {
  items: Item[];
  members: (EventMember & { user: any })[];
  eventId: number;
}

export default function ItemsList({ items, members, eventId }: ItemsListProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get current user ID
  const currentUserId = members.length > 0 ? members[0].userId : null;

  // Filter items based on criteria
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Apply filter for assignment
      if (filter === "my" && currentUserId) {
        if (item.assignedTo !== currentUserId) return false;
      } else if (filter === "unassigned") {
        if (item.assignedTo) return false;
      }

      // Apply status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [items, filter, statusFilter, searchQuery, currentUserId]);

  // Update item status
  const updateItemStatus = async (itemId: number, newStatus: string) => {
    try {
      await apiRequest("PUT", `/api/items/${itemId}`, { 
        status: newStatus 
      });
      
      // Invalidate items cache to trigger a refresh
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/items`] });
      
      toast({
        title: "Status updated",
        description: `Item status successfully updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating item status:", error);
      toast({
        title: "Update failed",
        description: "Could not update the item status",
        variant: "destructive",
      });
    }
  };

  // Get assigned member name
  const getMemberName = (userId?: number) => {
    if (!userId) return "Unassigned";
    const member = members.find(m => m.userId === userId);
    return member ? member.user.fullName : "Unknown";
  };

  // Render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case ItemStatus.TO_PACK:
        return <Badge variant="outline" className="bg-blue-100 text-primary border-blue-200">To Pack</Badge>;
      case ItemStatus.PACKED:
        return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Packed</Badge>;
      case ItemStatus.DELIVERED:
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Delivered</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex space-x-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All Items
          </Button>
          <Button 
            variant={filter === "my" ? "default" : "outline"}
            onClick={() => setFilter("my")}
            size="sm"
          >
            My Items
          </Button>
          <Button 
            variant={filter === "unassigned" ? "default" : "outline"}
            onClick={() => setFilter("unassigned")}
            size="sm"
          >
            Unassigned
          </Button>
        </div>
        
        <div className="flex space-x-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={ItemStatus.TO_PACK}>To Pack</SelectItem>
              <SelectItem value={ItemStatus.PACKED}>Packed</SelectItem>
              <SelectItem value={ItemStatus.DELIVERED}>Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items list */}
      {filteredItems.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center p-4 hover:bg-slate-50 transition-colors"
                >
                  <Checkbox 
                    checked={item.status !== ItemStatus.TO_PACK}
                    onCheckedChange={(checked) => {
                      const newStatus = checked
                        ? item.status === ItemStatus.PACKED
                          ? ItemStatus.DELIVERED
                          : ItemStatus.PACKED
                        : ItemStatus.TO_PACK;
                      updateItemStatus(item.id, newStatus);
                    }}
                    className="mr-3 flex-shrink-0"
                  />
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-slate-900 truncate">
                        {item.name}
                        {item.quantity > 1 && <span className="ml-1 text-slate-500">({item.quantity})</span>}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    )}
                    
                    <div className="flex items-center mt-1 text-xs text-slate-500">
                      <span className="truncate">Assigned to: <span className="font-medium">{getMemberName(item.assignedTo)}</span></span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex ml-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Item</DropdownMenuItem>
                        <DropdownMenuItem>Change Status</DropdownMenuItem>
                        <DropdownMenuItem>Reassign Item</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete Item</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-slate-400 mb-3">
            <Search className="h-10 w-10 mx-auto mb-2" />
            <h3 className="text-lg font-medium">No items found</h3>
          </div>
          <p className="text-slate-500 max-w-md mx-auto">
            {searchQuery 
              ? "No items match your search criteria. Try adjusting your filters or search query."
              : "No items available in this category. Add your first item to get started."}
          </p>
        </div>
      )}
    </div>
  );
}
