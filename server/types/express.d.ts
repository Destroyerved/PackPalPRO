import { PrismaClient } from '@prisma/client';
import { User } from '@prisma/client';
import { Event, UserRole } from '@shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      db: PrismaClient;
      event?: Event;
      userRole?: UserRole;
    }
  }
} 