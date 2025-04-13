import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notificationService';

const prisma = new PrismaClient();

export class PollService {
  static async createPoll(
    eventId: string,
    itemId: string,
    question: string,
    options: string[],
    createdBy: string
  ) {
    const poll = await prisma.poll.create({
      data: {
        eventId,
        itemId,
        question,
        options: {
          create: options.map(option => ({
            text: option,
            votes: 0
          }))
        },
        createdBy,
        status: 'active'
      },
      include: {
        options: true
      }
    });

    // Notify event participants
    const participants = await prisma.eventParticipant.findMany({
      where: { eventId },
      include: { user: true }
    });

    for (const participant of participants) {
      await NotificationService.createNotification(
        participant.userId,
        'POLL_CREATED',
        'New Poll Created',
        `A new poll has been created for item in event: ${poll.question}`,
        eventId,
        itemId
      );
    }

    return poll;
  }

  static async vote(pollId: string, optionId: string, userId: string) {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true }
    });

    if (!poll || poll.status !== 'active') {
      throw new Error('Poll not found or closed');
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findFirst({
      where: { pollId, userId }
    });

    if (existingVote) {
      throw new Error('User already voted');
    }

    // Create vote
    await prisma.vote.create({
      data: {
        pollId,
        optionId,
        userId
      }
    });

    // Update option vote count
    await prisma.pollOption.update({
      where: { id: optionId },
      data: {
        votes: { increment: 1 }
      }
    });

    // Check if all participants have voted
    const participants = await prisma.eventParticipant.count({
      where: { eventId: poll.eventId }
    });

    const votes = await prisma.vote.count({
      where: { pollId }
    });

    if (votes >= participants) {
      await this.closePoll(pollId);
    }

    return this.getPollResults(pollId);
  }

  static async closePoll(pollId: string) {
    const poll = await prisma.poll.update({
      where: { id: pollId },
      data: { status: 'closed' },
      include: {
        options: {
          orderBy: { votes: 'desc' }
        }
      }
    });

    // Notify participants of results
    const participants = await prisma.eventParticipant.findMany({
      where: { eventId: poll.eventId },
      include: { user: true }
    });

    const winner = poll.options[0];
    
    for (const participant of participants) {
      await NotificationService.createNotification(
        participant.userId,
        'POLL_RESULT',
        'Poll Results Available',
        `The poll "${poll.question}" has been closed. Winner: ${winner.text}`,
        poll.eventId,
        poll.itemId
      );
    }

    return poll;
  }

  static async getPollResults(pollId: string) {
    return prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: { votes: 'desc' }
        }
      }
    });
  }
} 