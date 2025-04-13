import {
  users, events, eventMembers, categories, items,
  User, InsertUser, Event, InsertEvent, 
  EventMember, InsertEventMember, 
  Category, InsertCategory, 
  Item, InsertItem, 
  UserRole, ItemStatus
} from "@shared/schema";
import { eq, and, inArray, or } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event management
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByUser(userId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event member management
  getEventMembers(eventId: number): Promise<(EventMember & { user: User })[]>;
  getEventMember(eventId: number, userId: number): Promise<EventMember | undefined>;
  addEventMember(member: InsertEventMember): Promise<EventMember>;
  updateEventMemberRole(eventId: number, userId: number, role: string): Promise<EventMember | undefined>;
  removeEventMember(eventId: number, userId: number): Promise<boolean>;
  
  // Category management
  getCategories(eventId: number): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Item management
  getItems(eventId: number): Promise<Item[]>;
  getItemsByCategory(categoryId: number): Promise<Item[]>;
  getItemsByAssignee(eventId: number, userId: number): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<Item>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Event management
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventsByUser(userId: number): Promise<Event[]> {
    // Find events where user is a member
    const memberships = await db
      .select()
      .from(eventMembers)
      .where(eq(eventMembers.userId, userId));

    const eventIds = memberships.map(m => m.eventId);
    
    let userEvents: Event[] = [];
    
    if (eventIds.length > 0) {
      // Find events where user is a member or created the event
      userEvents = await db
        .select()
        .from(events)
        .where(
          or(
            inArray(events.id, eventIds),
            eq(events.createdBy, userId)
          )
        );
    } else {
      // Only find events created by the user
      userEvents = await db
        .select()
        .from(events)
        .where(eq(events.createdBy, userId));
    }
    
    return userEvents;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    
    // Automatically make the creator an OWNER member
    await db.insert(eventMembers).values({
      eventId: event.id,
      userId: insertEvent.createdBy,
      role: UserRole.OWNER
    });
    
    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<Event>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventUpdate)
      .where(eq(events.id, id))
      .returning();
    
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    // Delete all related items, categories, and members first
    await db.delete(items).where(eq(items.eventId, id));
    await db.delete(categories).where(eq(categories.eventId, id));
    await db.delete(eventMembers).where(eq(eventMembers.eventId, id));
    
    // Delete the event itself
    const result = await db.delete(events).where(eq(events.id, id));
    return result.count > 0;
  }

  // Event member management
  async getEventMembers(eventId: number): Promise<(EventMember & { user: User })[]> {
    const members = await db
      .select()
      .from(eventMembers)
      .where(eq(eventMembers.eventId, eventId));
    
    // Fetch user details for each member
    const memberResults: (EventMember & { user: User })[] = [];
    
    for (const member of members) {
      const [user] = await db.select().from(users).where(eq(users.id, member.userId));
      
      if (user) {
        memberResults.push({
          ...member,
          user
        });
      }
    }
    
    return memberResults;
  }

  async getEventMember(eventId: number, userId: number): Promise<EventMember | undefined> {
    const [member] = await db
      .select()
      .from(eventMembers)
      .where(
        and(
          eq(eventMembers.eventId, eventId),
          eq(eventMembers.userId, userId)
        )
      );
    
    return member;
  }

  async addEventMember(member: InsertEventMember): Promise<EventMember> {
    const [newMember] = await db
      .insert(eventMembers)
      .values(member)
      .returning();
    
    return newMember;
  }

  async updateEventMemberRole(
    eventId: number,
    userId: number,
    role: string
  ): Promise<EventMember | undefined> {
    const [updatedMember] = await db
      .update(eventMembers)
      .set({ role })
      .where(
        and(
          eq(eventMembers.eventId, eventId),
          eq(eventMembers.userId, userId)
        )
      )
      .returning();
    
    return updatedMember;
  }

  async removeEventMember(eventId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(eventMembers)
      .where(
        and(
          eq(eventMembers.eventId, eventId),
          eq(eventMembers.userId, userId)
        )
      );
    
    return result.count > 0;
  }

  // Category management
  async getCategories(eventId: number): Promise<Category[]> {
    return db
      .select()
      .from(categories)
      .where(eq(categories.eventId, eventId));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    
    return newCategory;
  }

  async updateCategory(
    id: number,
    categoryUpdate: Partial<Category>
  ): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(categoryUpdate)
      .where(eq(categories.id, id))
      .returning();
    
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // First, get the category to know its eventId
    const category = await this.getCategory(id);
    if (!category) return false;
    
    // Find items in this category and either delete them or reassign
    const categoryItems = await this.getItemsByCategory(id);
    
    // For simplicity, we'll just delete the items in this category
    // In a production app, you might want to reassign them
    for (const item of categoryItems) {
      await this.deleteItem(item.id);
    }
    
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id));
    
    return result.count > 0;
  }

  // Item management
  async getItems(eventId: number): Promise<Item[]> {
    return db
      .select()
      .from(items)
      .where(eq(items.eventId, eventId));
  }

  async getItemsByCategory(categoryId: number): Promise<Item[]> {
    return db
      .select()
      .from(items)
      .where(eq(items.categoryId, categoryId));
  }

  async getItemsByAssignee(eventId: number, userId: number): Promise<Item[]> {
    return db
      .select()
      .from(items)
      .where(
        and(
          eq(items.eventId, eventId),
          eq(items.assignedTo, userId)
        )
      );
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, id));
    
    return item;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db
      .insert(items)
      .values(item)
      .returning();
    
    return newItem;
  }

  async updateItem(
    id: number,
    itemUpdate: Partial<Item>
  ): Promise<Item | undefined> {
    const [updatedItem] = await db
      .update(items)
      .set({
        ...itemUpdate,
        updatedAt: new Date()
      })
      .where(eq(items.id, id))
      .returning();
    
    return updatedItem;
  }

  async deleteItem(id: number): Promise<boolean> {
    const result = await db
      .delete(items)
      .where(eq(items.id, id));
    
    return result.count > 0;
  }
}

// Use Database Storage
export const storage = new DatabaseStorage();