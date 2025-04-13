import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import { useEventStore } from '../stores/eventStore';
import { useTemplateStore } from '../stores/templateStore';

export function TemplatesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createEvent } = useEventStore();
  const { templates, isLoading } = useTemplateStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    'vacation',
    'business',
    'outdoor',
    'sports',
    'special',
    'family',
    'adventure'
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'vacation' && ['Beach Vacation', 'Cruise Vacation', 'Honeymoon'].includes(template.name)) ||
      (selectedCategory === 'business' && ['Business Trip', 'Business Conference'].includes(template.name)) ||
      (selectedCategory === 'outdoor' && ['Camping Trip', 'Backpacking', 'Safari Trip'].includes(template.name)) ||
      (selectedCategory === 'sports' && ['Ski Trip', 'Ski Weekend', 'Golf Trip', 'Sports Event'].includes(template.name)) ||
      (selectedCategory === 'special' && ['Music Festival', 'Music Tour', 'Yoga Retreat', 'Food Tour', 'Art Tour'].includes(template.name)) ||
      (selectedCategory === 'family' && ['Family Vacation'].includes(template.name)) ||
      (selectedCategory === 'adventure' && ['Road Trip', 'Photography Trip'].includes(template.name));

    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template: any) => {
    try {
      const event = await createEvent({
        name: template.name,
        description: template.description,
        categories: template.categories,
        items: template.items
      });
      
      toast({
        title: "Template applied successfully",
        description: `Created new event "${template.name}"`,
      });
      
      navigate(`/events/${event.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event from template",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading templates...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-3xl font-bold">Packing Templates</h1>
        <p className="text-muted-foreground">
          Choose from our pre-made templates to quickly create your packing list
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div>
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {template.categories.map((category: any) => (
                      <span
                        key={category.name}
                        className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Items</Label>
                  <p className="text-sm text-muted-foreground">
                    {template.items.length} items
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleUseTemplate(template)}
              >
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 