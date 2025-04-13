import { create } from 'zustand';
import { Event, UserRole } from '@shared/schema';
import { toast } from '@/components/ui/use-toast';

interface EventStore {
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  setCurrentEvent: (event: Event | null) => void;
  updateUserRole: (eventId: string, userId: string, newRole: UserRole) => Promise<void>;
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (eventId: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export const useEventStore = create<EventStore>((set) => ({
  currentEvent: null,
  isLoading: false,
  error: null,
  
  setCurrentEvent: (event) => set({ currentEvent: event }),
  
  updateUserRole: async (eventId, userId, newRole) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/events/${eventId}/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      
      const updatedEvent = await response.json();
      set({ currentEvent: updatedEvent });
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  createEvent: async (event) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      
      const newEvent = await response.json();
      set({ currentEvent: newEvent });
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateEvent: async (eventId, event) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      
      const updatedEvent = await response.json();
      set({ currentEvent: updatedEvent });
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteEvent: async (eventId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      
      set({ currentEvent: null });
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    } finally {
      set({ isLoading: false });
    }
  },
})); 