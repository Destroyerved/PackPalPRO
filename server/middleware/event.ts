import { Request, Response, NextFunction } from 'express';
import { UserRole, ROLE_PERMISSIONS } from '@shared/schema';

export async function loadEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const event = await req.db.event.findUnique({
      where: { id: eventId },
      include: {
        categories: true,
        items: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user has access to the event
    const userRole = event.userRoles[userId];
    if (!userRole) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add event and user role to request
    req.event = event;
    req.userRole = userRole;

    next();
  } catch (error) {
    console.error('Error loading event:', error);
    res.status(500).json({ error: 'Failed to load event' });
  }
}

export function checkEventPermission(permission: keyof typeof ROLE_PERMISSIONS.owner) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.userRole;
    if (!userRole) {
      return res.status(403).json({ error: 'User role not found' });
    }

    const permissions = ROLE_PERMISSIONS[userRole];
    if (!permissions || !permissions[permission]) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
} 