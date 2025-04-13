import React, { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { Notification } from '@shared/schema';

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    // Set up WebSocket for real-time notifications
    const ws = new WebSocket(process.env.WS_URL || 'ws://localhost:3001');
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications((prev) => [notification, ...prev]);
      toast({
        title: notification.title,
        description: notification.message,
      });
    };
    return () => ws.close();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/${userId}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6" />
        {notifications.some((n) => !n.read) && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4">
            <h3 className="font-semibold mb-2">Notifications</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      notification.read
                        ? 'bg-gray-50'
                        : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() =>
                              markAsRead(notification.id)
                            }
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            deleteNotification(notification.id)
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 