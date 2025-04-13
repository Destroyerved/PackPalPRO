import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Form schema for join event
const joinEventSchema = z.object({
  inviteCode: z.string().min(6, "Invite code must be at least 6 characters"),
});

type JoinEventFormValues = z.infer<typeof joinEventSchema>;

interface JoinEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JoinEventDialog({ open, onOpenChange }: JoinEventDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  
  const form = useForm<JoinEventFormValues>({
    resolver: zodResolver(joinEventSchema),
    defaultValues: {
      inviteCode: "",
    },
  });
  
  async function onSubmit(values: JoinEventFormValues) {
    setIsSubmitting(true);
    
    try {
      // Submit to API
      const response = await apiRequest("POST", "/api/events/join", { inviteCode: values.inviteCode });
      const result = await response.json();
      
      // Success message
      toast({
        title: "Successfully joined event",
        description: `You have joined "${result.eventName}"`,
      });
      
      // Update events list
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      
      // Close dialog and reset form
      onOpenChange(false);
      form.reset();
      
      // Navigate to the event
      navigate(`/app/event/${result.eventId}`);
    } catch (error) {
      console.error("Error joining event:", error);
      toast({
        title: "Error joining event",
        description: "Invalid invite code or you may already be a member of this event.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Event</DialogTitle>
          <DialogDescription>
            Enter an invite code to join an existing event.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="inviteCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the invite code" {...field} />
                  </FormControl>
                  <FormDescription>
                    This code was shared with you by the event organizer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Joining..." : "Join Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}