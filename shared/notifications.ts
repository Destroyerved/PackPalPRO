import { WebSocketMessageType, ItemStatus, UserRoleType } from './schema';

// Notification types
export enum NotificationType {
  ITEM_STATUS_CHANGED = 'item_status_changed',
  ITEM_ASSIGNED = 'item_assigned',
  ITEM_CREATED = 'item_created',
  EVENT_CREATED = 'event_created',
  MEMBER_JOINED = 'member_joined',
  MEMBER_ROLE_CHANGED = 'member_role_changed',
  DEADLINE_APPROACHING = 'deadline_approaching',
  CONFLICT_DETECTED = 'conflict_detected'
}

// Base notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  eventId: number;
  timestamp: Date;
  read: boolean;
  userId: number; // Target user to receive the notification
}

// Item status changed notification
export interface ItemStatusChangedNotification extends Notification {
  type: NotificationType.ITEM_STATUS_CHANGED;
  itemId: number;
  itemName: string;
  previousStatus: ItemStatus;
  newStatus: ItemStatus;
  changedByUserId: number;
  changedByUserName: string;
}

// Item assigned notification
export interface ItemAssignedNotification extends Notification {
  type: NotificationType.ITEM_ASSIGNED;
  itemId: number;
  itemName: string;
  previousAssigneeId?: number;
  previousAssigneeName?: string;
  newAssigneeId: number;
  newAssigneeName: string;
  assignedByUserId: number;
  assignedByUserName: string;
}

// Item created notification
export interface ItemCreatedNotification extends Notification {
  type: NotificationType.ITEM_CREATED;
  itemId: number;
  itemName: string;
  categoryId: number;
  categoryName: string;
  createdByUserId: number;
  createdByUserName: string;
}

// Event created notification
export interface EventCreatedNotification extends Notification {
  type: NotificationType.EVENT_CREATED;
  eventName: string;
  createdByUserId: number;
  createdByUserName: string;
}

// Member joined notification
export interface MemberJoinedNotification extends Notification {
  type: NotificationType.MEMBER_JOINED;
  memberUserId: number;
  memberUserName: string;
  role: UserRoleType;
}

// Member role changed notification
export interface MemberRoleChangedNotification extends Notification {
  type: NotificationType.MEMBER_ROLE_CHANGED;
  memberUserId: number;
  memberUserName: string;
  previousRole: UserRoleType;
  newRole: UserRoleType;
  changedByUserId: number;
  changedByUserName: string;
}

// Deadline approaching notification
export interface DeadlineApproachingNotification extends Notification {
  type: NotificationType.DEADLINE_APPROACHING;
  eventName: string;
  startDate: Date;
  daysRemaining: number;
  pendingItemsCount: number;
}

// Conflict detected notification
export interface ConflictDetectedNotification extends Notification {
  type: NotificationType.CONFLICT_DETECTED;
  conflictType: 'duplicate_item' | 'assignment_overlap';
  itemId1: number;
  itemName1: string;
  itemId2: number;
  itemName2: string;
  message: string;
}

// Union type for all notification types
export type AnyNotification = 
  | ItemStatusChangedNotification
  | ItemAssignedNotification
  | ItemCreatedNotification
  | EventCreatedNotification
  | MemberJoinedNotification
  | MemberRoleChangedNotification
  | DeadlineApproachingNotification
  | ConflictDetectedNotification;

// Helper function to map WebSocket message types to notification types
export function mapWebSocketToNotificationType(wsType: WebSocketMessageType): NotificationType | null {
  switch (wsType) {
    case WebSocketMessageType.ITEM_UPDATED:
      return NotificationType.ITEM_STATUS_CHANGED;
    case WebSocketMessageType.ITEM_CREATED:
      return NotificationType.ITEM_CREATED;
    case WebSocketMessageType.MEMBER_JOINED:
      return NotificationType.MEMBER_JOINED;
    case WebSocketMessageType.MEMBER_ROLE_CHANGED:
      return NotificationType.MEMBER_ROLE_CHANGED;
    default:
      return null;
  }
}

// Helper function to create notification text
export function getNotificationText(notification: AnyNotification): string {
  switch (notification.type) {
    case NotificationType.ITEM_STATUS_CHANGED:
      return `${notification.changedByUserName} marked "${notification.itemName}" as ${notification.newStatus}`;
    
    case NotificationType.ITEM_ASSIGNED:
      return `${notification.assignedByUserName} assigned "${notification.itemName}" to ${notification.newAssigneeName}`;
    
    case NotificationType.ITEM_CREATED:
      return `${notification.createdByUserName} added a new item "${notification.itemName}"`;
    
    case NotificationType.EVENT_CREATED:
      return `${notification.createdByUserName} created a new event "${notification.eventName}"`;
    
    case NotificationType.MEMBER_JOINED:
      return `${notification.memberUserName} joined the event as ${notification.role}`;
    
    case NotificationType.MEMBER_ROLE_CHANGED:
      return `${notification.memberUserName}'s role was changed from ${notification.previousRole} to ${notification.newRole}`;
    
    case NotificationType.DEADLINE_APPROACHING:
      return `${notification.eventName} starts in ${notification.daysRemaining} days with ${notification.pendingItemsCount} pending items`;
    
    case NotificationType.CONFLICT_DETECTED:
      return notification.message;
    
    default:
      return "New notification";
  }
}
