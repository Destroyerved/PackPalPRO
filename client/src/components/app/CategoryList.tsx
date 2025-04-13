import { useState } from "react";
import { Category, Item, EventMember, ItemStatus } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ItemCard from "./ItemCard";

interface CategoryListProps {
  categories: Category[];
  items: Item[];
  members: (EventMember & { user: any })[];
  eventId: number;
}

export default function CategoryList({ categories, items, members, eventId }: CategoryListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>(
    // Initialize all categories as expanded
    categories.reduce((acc, category) => ({ ...acc, [category.id]: true }), {})
  );
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Toggle category expansion
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // Filter items by active filter, search query and status
  const getFilteredItems = (categoryId: number) => {
    return items
      .filter(item => item.categoryId === categoryId)
      .filter(item => {
        if (activeFilter === "all") return true;
        if (activeFilter === "my" && item.assignedTo) {
          // Assuming the current user's ID is in the session
          // This would need to be passed as a prop or obtained from context
          const currentUserId = members[0]?.userId; // Placeholder - replace with actual current user ID
          return item.assignedTo === currentUserId;
        }
        if (activeFilter === "unassigned") return !item.assignedTo;
        return true;
      })
      .filter(item => {
        if (!searchQuery) return true;
        return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      })
      .filter(item => {
        if (statusFilter === "all") return true;
        return item.status === statusFilter;
      });
  };
  
  // Get member by ID
  const getMemberById = (userId?: number) => {
    if (!userId) return null;
    return members.find(member => member.userId === userId);
  };
  
  return (
    <div className="space-y-6">
      {/* Filter and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            All Items
          </Button>
          <Button
            variant={activeFilter === "my" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("my")}
          >
            My Items
          </Button>
          <Button
            variant={activeFilter === "unassigned" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("unassigned")}
          >
            Unassigned
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input 
              placeholder="Search items..." 
              className="pl-9 pr-3 py-1 w-full sm:w-auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={ItemStatus.TO_PACK}>To Pack</SelectItem>
              <SelectItem value={ItemStatus.PACKED}>Packed</SelectItem>
              <SelectItem value={ItemStatus.DELIVERED}>Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Categories */}
      {categories.length > 0 ? (
        categories.map(category => {
          const categoryItems = getFilteredItems(category.id);
          
          return (
            <Card key={category.id} className="overflow-hidden">
              <div 
                className="px-4 py-3 bg-slate-50 border-b flex justify-between items-center cursor-pointer"
                onClick={() => toggleCategory(category.id)}
              >
                <h2 className="font-medium text-slate-800">{category.name}</h2>
                <div className="flex items-center">
                  <span className="text-sm text-slate-500 mr-2">{categoryItems.length} items</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {expandedCategories[category.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Items List */}
              {expandedCategories[category.id] ? (
                <div className="divide-y">
                  {categoryItems.length > 0 ? (
                    categoryItems.map(item => (
                      <ItemCard 
                        key={item.id} 
                        item={item} 
                        assignedMember={getMemberById(item.assignedTo)?.user}
                        eventId={eventId}
                      />
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500">
                      No items match your filters in this category
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  <p>Section collapsed - {categoryItems.length} items</p>
                </div>
              )}
            </Card>
          );
        })
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500">No categories found</p>
          <Button className="mt-4">Create First Category</Button>
        </div>
      )}
    </div>
  );
}
