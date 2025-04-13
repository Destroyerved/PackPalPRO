import { Request, Response, NextFunction } from 'express';
import { UserRole, ROLE_PERMISSIONS } from '@shared/schema';

export function checkPermission(permission: keyof typeof ROLE_PERMISSIONS.owner) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId = req.params.eventId;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user's role for this event
      const event = await req.db.event.findUnique({
        where: { id: eventId },
        select: { userRoles: true }
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const userRole = event.userRoles[userId] as UserRole;
      
      if (!userRole) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const hasPermission = ROLE_PERMISSIONS[userRole][permission];
      
      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireRole(role: UserRole) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId = req.params.eventId;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const event = await req.db.event.findUnique({
        where: { id: eventId },
        select: { userRoles: true }
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const userRole = event.userRoles[userId] as UserRole;
      
      if (!userRole || userRole !== role) {
        return res.status(403).json({ error: 'Insufficient role' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
} 