import { useState } from "react";
import { Item, ItemStatus } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  MoreVertical, 
  Pencil, 
  Trash2,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ItemCardProps {
  item: Item;
  assignedMember?: any; // User object
  eventId: number;
}

export default function ItemCard({ item, assignedMember, eventId }: ItemCardProps) {
  const { toast } = useToast();
  const [isChecked, setIsChecked] = useState(item.status !== ItemStatus.TO_PACK);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Status badge styles and text
  const getStatusBadge = (status: string) => {
    switch (status) {
      case ItemStatus.TO_PACK:
        return {
          class: "bg-blue-100 text-primary",
          text: "To Pack"
        };
      case ItemStatus.PACKED:
        return {
          class: "bg-amber-100 text-amber-500",
          text: "Packed"
        };
      case ItemStatus.DELIVERED:
        return {
          class: "bg-green-100 text-green-500",
          text: "Delivered"
        };
      default:
        return {
          class: "bg-slate-100 text-slate-500",
          text: "Unknown"
        };
    }
  };
  
  const statusBadge = getStatusBadge(item.status);
  
  // Handle checkbox change to update status
  const handleStatusChange = async (checked: boolean) => {
    try {
      setIsUpdating(true);
      setIsChecked(checked);
      
      // Determine the new status based on current status
      let newStatus: string;
      
      if (checked) {
        // If checking, move to next status (To Pack -> Packed -> Delivered)
        if (item.status === ItemStatus.TO_PACK) {
          newStatus = ItemStatus.PACKED;
        } else {
          newStatus = ItemStatus.DELIVERED;
        }
      } else {
        // If unchecking, move back to To Pack
        newStatus = ItemStatus.TO_PACK;
      }
      
      // Update the item status
      await apiRequest("PUT", `/api/items/${item.id}`, { status: newStatus });
      
      // Update the cache
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/items`] });
      
      toast({
        title: "Status updated",
        description: `Item is now marked as ${getStatusBadge(newStatus).text}`,
      });
    } catch (error) {
      console.error("Error updating item status:", error);
      setIsChecked(!checked); // Revert UI state on error
      toast({
        title: "Error updating status",
        description: "There was a problem updating the item status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle item deletion
  const handleDeleteItem = async () => {
    try {
      await apiRequest("DELETE", `/api/items/${item.id}`);
      
      // Update the cache
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/items`] });
      
      toast({
        title: "Item deleted",
        description: "The item has been successfully deleted.",
      });
      
      setConfirmDelete(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error deleting item",
        description: "There was a problem deleting the item.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <div className="p-4 hover:bg-slate-50 flex items-center">
        <div className="flex-shrink-0 mr-3">
          <Checkbox 
            checked={isChecked} 
            disabled={isUpdating}
            onCheckedChange={handleStatusChange}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="font-medium text-slate-900 truncate">
              {item.name}
              {item.quantity > 1 && <span className="text-slate-500"> (x{item.quantity})</span>}
            </h3>
            <span className={cn("ml-2 px-2 py-0.5 text-xs rounded-full", statusBadge.class)}>
              {statusBadge.text}
            </span>
          </div>
          {item.description && (
            <div className="text-sm text-slate-600 truncate mt-0.5">
              {item.description}
            </div>
          )}
          <div className="flex items-center text-sm text-slate-500 mt-0.5">
            <span className="truncate">
              Assigned to: {assignedMember ? (
                <span className="font-medium">{assignedMember.fullName || 'Unknown'}</span>
              ) : (
                <span className="italic">Unassigned</span>
              )}
            </span>
          </div>
        </div>
        <div className="ml-3 flex-shrink-0 flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-500">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-500">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Check className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
