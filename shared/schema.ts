import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Role types
export const UserRole = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Item status types
export const ItemStatus = {
  TO_PACK: "to_pack",
  PACKED: "packed",
  DELIVERED: "delivered",
} as const;

export type ItemStatusType = (typeof ItemStatus)[keyof typeof ItemStatus];

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  profilePic: text("profile_pic"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
  userRoles: jsonb("user_roles").notNull().$type<Record<string, UserRoleType>>(),
});

// Event Members table (join table with roles)
export const eventMembers = pgTable("event_members", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().$type<UserRoleType>(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  quantity: integer("quantity").default(1),
  status: text("status").notNull().$type<ItemStatusType>().default(ItemStatus.TO_PACK),
  assignedTo: integer("assigned_to"),
  notes: text("notes"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Templates table
export const templates = pgTable('templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  categories: jsonb('categories').notNull(),
  items: jsonb('items').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertEventMemberSchema = createInsertSchema(eventMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  categories: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
  })),
  items: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    categoryId: z.number(),
  })),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventMember = typeof eventMembers.$inferSelect;
export type InsertEventMember = z.infer<typeof insertEventMemberSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events, { relationName: "user_events" }),
  memberships: many(eventMembers, { relationName: "user_memberships" }),
  items: many(items, { relationName: "user_items" }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
    relationName: "user_events",
  }),
  members: many(eventMembers, { relationName: "event_members" }),
  categories: many(categories, { relationName: "event_categories" }),
  items: many(items, { relationName: "event_items" }),
}));

export const eventMembersRelations = relations(eventMembers, ({ one }) => ({
  event: one(events, {
    fields: [eventMembers.eventId],
    references: [events.id],
    relationName: "event_members",
  }),
  user: one(users, {
    fields: [eventMembers.userId],
    references: [users.id],
    relationName: "user_memberships",
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  event: one(events, {
    fields: [categories.eventId],
    references: [events.id],
    relationName: "event_categories",
  }),
  items: many(items, { relationName: "category_items" }),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  event: one(events, {
    fields: [items.eventId],
    references: [events.id],
    relationName: "event_items",
  }),
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
    relationName: "category_items",
  }),
  assignee: one(users, {
    fields: [items.assignedTo],
    references: [users.id],
    relationName: "user_items",
  }),
}));

// WebSocket message types
export enum WebSocketMessageType {
  ITEM_CREATED = 'item_created',
  ITEM_UPDATED = 'item_updated',
  ITEM_DELETED = 'item_deleted',
  CATEGORY_CREATED = 'category_created',
  CATEGORY_UPDATED = 'category_updated',
  CATEGORY_DELETED = 'category_deleted',
  EVENT_UPDATED = 'event_updated',
  MEMBER_JOINED = 'member_joined',
  MEMBER_LEFT = 'member_left',
  MEMBER_ROLE_CHANGED = 'member_role_changed',
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  eventId: number;
  payload: any;
}

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface UserPermissions {
  canManageUsers: boolean;
  canEditItems: boolean;
  canDeleteItems: boolean;
  canManageSettings: boolean;
  canViewPrivateItems: boolean;
  canAddItems: boolean;
  canExportData: boolean;
  canManageTemplates: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  owner: {
    canManageUsers: true,
    canEditItems: true,
    canDeleteItems: true,
    canManageSettings: true,
    canViewPrivateItems: true,
    canAddItems: true,
    canExportData: true,
    canManageTemplates: true,
  },
  admin: {
    canManageUsers: true,
    canEditItems: true,
    canDeleteItems: true,
    canManageSettings: true,
    canViewPrivateItems: true,
    canAddItems: true,
    canExportData: true,
    canManageTemplates: true,
  },
  member: {
    canManageUsers: false,
    canEditItems: true,
    canDeleteItems: false,
    canManageSettings: false,
    canViewPrivateItems: true,
    canAddItems: true,
    canExportData: true,
    canManageTemplates: false,
  },
  viewer: {
    canManageUsers: false,
    canEditItems: false,
    canDeleteItems: false,
    canManageSettings: false,
    canViewPrivateItems: false,
    canAddItems: false,
    canExportData: false,
    canManageTemplates: false,
  },
};

export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
  itemId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  content: string;
  itemId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Receipt {
  id: string;
  itemId: string;
  userId: string;
  amount: number;
  currency: string;
  date: Date;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: Date;
}

export interface Poll {
  id: string;
  eventId: string;
  itemId: string;
  question: string;
  status: 'active' | 'closed';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  options: PollOption[];
  votes?: Vote[];
}

export type NotificationType = 
  | 'EVENT_REMINDER'
  | 'ITEM_REMINDER'
  | 'ROLE_CHANGE'
  | 'EVENT_UPDATE'
  | 'ITEM_ASSIGNMENT'
  | 'POLL_CREATED'
  | 'POLL_RESULT'
  | 'CONFLICT_ALERT'
  | 'CLEANUP_SUGGESTION';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: string;
  itemId?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SmartSuggestion {
  id: string;
  eventId: string;
  itemName: string;
  categoryId: string;
  confidence: number;
  source: 'ai' | 'template' | 'history';
  createdAt: Date;
  updatedAt: Date;
}

export interface NewEvent {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  categories: Omit<Category, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>[];
  items: Omit<Item, 'id' | 'categoryId' | 'createdAt' | 'updatedAt' | 'subtasks' | 'notes' | 'receipts'>[];
}
