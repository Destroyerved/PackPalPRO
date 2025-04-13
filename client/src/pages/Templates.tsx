import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/app/Header";
import Sidebar from "@/components/app/Sidebar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Copy, Users, Calendar, MapPin } from "lucide-react";

// Sample templates data - in a real app, these would come from the backend
const templates = [
  {
    id: 1,
    name: "Weekend Getaway",
    description: "Essential items for a quick weekend trip",
    categories: ["Clothing", "Toiletries", "Electronics"],
    itemCount: 15,
    popularity: "High",
    type: "personal"
  },
  {
    id: 2,
    name: "Beach Vacation",
    description: "Everything you need for a beach holiday",
    categories: ["Clothing", "Beach Gear", "Toiletries", "Electronics"],
    itemCount: 25,
    popularity: "High",
    type: "personal"
  },
  {
    id: 3,
    name: "Business Trip",
    description: "Professional essentials for business travel",
    categories: ["Clothing", "Documents", "Electronics"],
    itemCount: 12,
    popularity: "Medium",
    type: "business"
  },
  {
    id: 4,
    name: "Family Camping",
    description: "Complete camping checklist for families",
    categories: ["Camping Gear", "Clothing", "Food", "First Aid"],
    itemCount: 35,
    popularity: "Medium",
    type: "group"
  },
  {
    id: 5,
    name: "Conference",
    description: "What to bring for professional conferences",
    categories: ["Documents", "Electronics", "Clothing"],
    itemCount: 10,
    popularity: "Low",
    type: "business"
  },
  {
    id: 6,
    name: "Road Trip",
    description: "Everything needed for a long road trip",
    categories: ["Car Essentials", "Clothing", "Entertainment", "Food"],
    itemCount: 20,
    popularity: "Medium",
    type: "group"
  }
];

export default function Templates() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [currentTab, setCurrentTab] = useState("all");
  
  // Get user data
  const { 
    data: user, 
    isLoading: userLoading 
  } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false
  });
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Filter templates based on the current tab
  const filteredTemplates = templates.filter(template => {
    if (currentTab === "all") return true;
    return template.type === currentTab;
  });
  
  // Handle use template button
  const handleUseTemplate = (templateId: number) => {
    toast({
      title: "Template selected",
      description: "Template will be used for your next event.",
    });
    // In a real app, we would store this template selection or navigate to event creation
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        activePage="templates" 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Templates" 
          user={user}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Packing Templates</h1>
              <p className="text-gray-600">
                Use these pre-made templates to quickly set up your packing lists. 
                Each template includes common items for different types of events.
              </p>
            </div>
            
            <Tabs 
              defaultValue="all" 
              value={currentTab}
              onValueChange={setCurrentTab} 
              className="mb-8"
            >
              <TabsList className="grid grid-cols-4 w-[400px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="group">Group</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      {template.popularity === "High" && (
                        <div className="flex items-center text-amber-500">
                          <Star className="h-4 w-4 fill-amber-500" />
                          <span className="text-xs ml-1">Popular</span>
                        </div>
                      )}
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Categories: {template.categories.join(", ")}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{template.itemCount} items included</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>Type: {template.type.charAt(0).toUpperCase() + template.type.slice(1)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 pt-3">
                    <Button 
                      onClick={() => handleUseTemplate(template.id)} 
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}