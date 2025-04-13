import express from 'express';
import { NotificationService } from '../services/notificationService';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = express.Router();

// Get user notifications
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    const notifications = await NotificationService.getUserNotifications(
      req.params.userId
    );
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.post('/:notificationId/read', requireAuth, async (req, res) => {
  try {
    await NotificationService.markAsRead(req.params.notificationId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Delete notification
router.delete('/:notificationId', requireAuth, async (req, res) => {
  try {
    await NotificationService.deleteNotification(req.params.notificationId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router; 