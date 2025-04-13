import { PrismaClient } from '@prisma/client';
import { Event, User, NotificationType } from '@shared/schema';
import { sendEmail } from './emailService';

const prisma = new PrismaClient();

export class NotificationService {
  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    eventId?: string,
    itemId?: string
  ) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        eventId,
        itemId,
        read: false,
      },
    });
  }

  static async sendEventReminder(event: Event, hoursBefore: number) {
    const participants = await prisma.eventParticipant.findMany({
      where: { eventId: event.id },
      include: { user: true },
    });

    const reminderTime = new Date(event.startDate);
    reminderTime.setHours(reminderTime.getHours() - hoursBefore);

    for (const participant of participants) {
      // Create in-app notification
      await this.createNotification(
        participant.userId,
        'EVENT_REMINDER',
        `Event Reminder: ${event.name}`,
        `The event "${event.name}" starts in ${hoursBefore} hours.`,
        event.id
      );

      // Send email notification
      await sendEmail({
        to: participant.user.email,
        subject: `Event Reminder: ${event.name}`,
        html: `
          <h1>Event Reminder</h1>
          <p>The event "${event.name}" starts in ${hoursBefore} hours.</p>
          <p>Start Time: ${new Date(event.startDate).toLocaleString()}</p>
          <p>Location: ${event.location || 'Not specified'}</p>
          <p>View event details: <a href="${process.env.FRONTEND_URL}/events/${event.id}">Click here</a></p>
        `,
      });
    }
  }

  static async sendItemReminder(itemId: string, eventId: string) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        event: true,
        assignedTo: true,
      },
    });

    if (!item || !item.assignedTo) return;

    await this.createNotification(
      item.assignedTo.id,
      'ITEM_REMINDER',
      `Item Reminder: ${item.name}`,
      `Don't forget to bring "${item.name}" for "${item.event.name}"`,
      eventId,
      itemId
    );

    await sendEmail({
      to: item.assignedTo.email,
      subject: `Item Reminder: ${item.name}`,
      html: `
        <h1>Item Reminder</h1>
        <p>Don't forget to bring "${item.name}" for "${item.event.name}"</p>
        <p>Event: ${item.event.name}</p>
        <p>View event details: <a href="${process.env.FRONTEND_URL}/events/${eventId}">Click here</a></p>
      `,
    });
  }

  static async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  static async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: true,
        item: true,
      },
    });
  }

  static async deleteNotification(notificationId: string) {
    return prisma.notification.delete({
      where: { id: notificationId },
    });
  }
} 