import { Router } from 'express';
import { loadEvent, checkEventPermission } from '../middleware/event';
import { UserRole } from '@shared/schema';

const router = Router();

// Apply loadEvent middleware to all routes that need event data
router.use('/:eventId', loadEvent);

// Update user role in an event
router.patch(
  '/:eventId/users/:userId/role',
  checkEventPermission('canManageUsers'),
  async (req, res) => {
    try {
      const { eventId, userId } = req.params;
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const event = await req.db.event.update({
        where: { id: eventId },
        data: {
          userRoles: {
            ...req.event!.userRoles,
            [userId]: role,
          },
        },
        include: {
          categories: true,
          items: true,
        },
      });

      res.json(event);
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
);

// Get event with user roles
router.get('/:eventId', async (req, res) => {
  try {
    res.json(req.event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event
router.post('/', async (req, res) => {
  try {
    const { name, description, startDate, endDate, categories, items } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const event = await req.db.event.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ownerId: userId,
        userRoles: {
          [userId]: 'owner',
        },
        categories: {
          create: categories,
        },
        items: {
          create: items,
        },
      },
      include: {
        categories: true,
        items: true,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.patch('/:eventId', checkEventPermission('canEditItems'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, description, startDate, endDate, categories, items } = req.body;

    const event = await req.db.event.update({
      where: { id: eventId },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        categories: categories ? {
          deleteMany: {},
          create: categories,
        } : undefined,
        items: items ? {
          deleteMany: {},
          create: items,
        } : undefined,
      },
      include: {
        categories: true,
        items: true,
      },
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:eventId', checkEventPermission('canManageSettings'), async (req, res) => {
  try {
    const { eventId } = req.params;
    await req.db.event.delete({
      where: { id: eventId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router; 