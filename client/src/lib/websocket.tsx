import { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { WebSocketMessage, WebSocketMessageType } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from './queryClient';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (eventId: number) => void;
  unsubscribe: (eventId: number) => void;
  authenticate: (userId: number) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  subscribe: () => {},
  unsubscribe: () => {},
  authenticate: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Try to reconnect after a delay
      setTimeout(() => {
        setSocket(null);
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the server. Real-time updates may not work.',
        variant: 'destructive',
      });
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        // Handle different message types
        switch (message.type) {
          case WebSocketMessageType.ITEM_CREATED:
          case WebSocketMessageType.ITEM_UPDATED:
          case WebSocketMessageType.ITEM_DELETED:
            console.log(`Item ${message.type}`, message.payload);
            queryClient.invalidateQueries({ queryKey: [`/api/events/${message.eventId}/items`] });
            break;
            
          case WebSocketMessageType.CATEGORY_CREATED:
          case WebSocketMessageType.CATEGORY_UPDATED:
          case WebSocketMessageType.CATEGORY_DELETED:
            console.log(`Category ${message.type}`, message.payload);
            queryClient.invalidateQueries({ queryKey: [`/api/events/${message.eventId}/categories`] });
            break;
            
          case WebSocketMessageType.EVENT_UPDATED:
            console.log('Event updated', message.payload);
            queryClient.invalidateQueries({ queryKey: [`/api/events/${message.eventId}`] });
            queryClient.invalidateQueries({ queryKey: ['/api/events'] });
            break;
            
          case WebSocketMessageType.MEMBER_JOINED:
          case WebSocketMessageType.MEMBER_LEFT:
          case WebSocketMessageType.MEMBER_ROLE_CHANGED:
            console.log(`Member ${message.type}`, message.payload);
            queryClient.invalidateQueries({ queryKey: [`/api/events/${message.eventId}/members`] });
            break;
          
          case 'error':
            toast({
              title: 'WebSocket Error',
              description: message.payload?.message || 'An error occurred',
              variant: 'destructive',
            });
            break;
            
          default:
            // Ignore other message types
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    setSocket(ws);

    // Clean up on unmount
    return () => {
      ws.close();
    };
  }, []);

  const authenticate = useCallback((userId: number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('Authenticating WebSocket with user ID:', userId);
      socket.send(JSON.stringify({ type: 'authenticate', userId }));
    }
  }, [socket]);

  const subscribe = useCallback((eventId: number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('Subscribing to event ID:', eventId);
      socket.send(JSON.stringify({ type: 'subscribe', eventId }));
    }
  }, [socket]);

  const unsubscribe = useCallback((eventId: number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('Unsubscribing from event ID:', eventId);
      socket.send(JSON.stringify({ type: 'unsubscribe', eventId }));
    }
  }, [socket]);

  const value = {
    isConnected,
    subscribe,
    unsubscribe,
    authenticate,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
