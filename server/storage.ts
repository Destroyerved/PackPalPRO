import {
  User, InsertUser, Event, InsertEvent, 
  EventMember, InsertEventMember, 
  Category, InsertCategory, 
  Item, InsertItem, 
  UserRole, ItemStatus
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private eventMembers: Map<string, EventMember>;
  private categories: Map<number, Category>;
  private items: Map<number, Item>;
  private currentIds: {
    users: number;
    events: number;
    eventMembers: number;
    categories: number;
    items: number;
  };

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.eventMembers = new Map();
    this.categories = new Map();
    this.items = new Map();
    this.currentIds = {
      users: 1,
      events: 1,
      eventMembers: 1,
      categories: 1,
      items: 1,
    };

    // Add some seed data for development
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventsByUser(userId: number): Promise<Event[]> {
    const memberEventIds = Array.from(this.eventMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.eventId);
    
    return Array.from(this.events.values())
      .filter(event => 
        event.createdBy === userId || 
        memberEventIds.includes(event.id)
      );
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentIds.events++;
    const now = new Date();
    const event: Event = {
      ...insertEvent,
      id,
      createdAt: now
    };
    this.events.set(id, event);

    // Automatically add creator as owner
    await this.addEventMember({
      eventId: id,
      userId: insertEvent.createdBy,
      role: UserRole.OWNER
    });

    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;

    const updatedEvent = { ...event, ...eventUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    // Delete related items, categories, event members
    const itemsToDelete = Array.from(this.items.values())
      .filter(item => item.eventId === id);
    
    for (const item of itemsToDelete) {
      this.items.delete(item.id);
    }

    const categoriesToDelete = Array.from(this.categories.values())
      .filter(category => category.eventId === id);
    
    for (const category of categoriesToDelete) {
      this.categories.delete(category.id);
    }

    // Delete event members
    Array.from(this.eventMembers.values())
      .filter(member => member.eventId === id)
      .forEach(member => {
        this.eventMembers.delete(`${member.eventId}-${member.userId}`);
      });

    // Delete the event itself
    return this.events.delete(id);
  }

  // Event member methods
  async getEventMembers(eventId: number): Promise<(EventMember & { user: User })[]> {
    const members = Array.from(this.eventMembers.values())
      .filter(member => member.eventId === eventId);
    
    return members.map(member => {
      const user = this.users.get(member.userId);
      if (!user) {
        throw new Error(`User with ID ${member.userId} not found`);
      }
      return { ...member, user };
    });
  }

  async getEventMember(eventId: number, userId: number): Promise<EventMember | undefined> {
    return this.eventMembers.get(`${eventId}-${userId}`);
  }

  async addEventMember(member: InsertEventMember): Promise<EventMember> {
    const id = this.currentIds.eventMembers++;
    const now = new Date();
    const eventMember: EventMember = {
      ...member,
      id,
      joinedAt: now
    };
    this.eventMembers.set(`${member.eventId}-${member.userId}`, eventMember);
    return eventMember;
  }

  async updateEventMemberRole(eventId: number, userId: number, role: string): Promise<EventMember | undefined> {
    const key = `${eventId}-${userId}`;
    const member = this.eventMembers.get(key);
    if (!member) return undefined;

    const updatedMember = { ...member, role };
    this.eventMembers.set(key, updatedMember);
    return updatedMember;
  }

  async removeEventMember(eventId: number, userId: number): Promise<boolean> {
    const key = `${eventId}-${userId}`;
    return this.eventMembers.delete(key);
  }

  // Category methods
  async getCategories(eventId: number): Promise<Category[]> {
    return Array.from(this.categories.values())
      .filter(category => category.eventId === eventId);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentIds.categories++;
    const now = new Date();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: now
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryUpdate: Partial<Category>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...categoryUpdate };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // Set items in this category to a default/unassigned category or delete them
    const itemsToUpdate = Array.from(this.items.values())
      .filter(item => item.categoryId === id);
    
    // For this implementation, we'll simply delete the items
    for (const item of itemsToUpdate) {
      this.items.delete(item.id);
    }

    return this.categories.delete(id);
  }

  // Item methods
  async getItems(eventId: number): Promise<Item[]> {
    return Array.from(this.items.values())
      .filter(item => item.eventId === eventId);
  }

  async getItemsByCategory(categoryId: number): Promise<Item[]> {
    return Array.from(this.items.values())
      .filter(item => item.categoryId === categoryId);
  }

  async getItemsByAssignee(eventId: number, userId: number): Promise<Item[]> {
    return Array.from(this.items.values())
      .filter(item => item.eventId === eventId && item.assignedTo === userId);
  }

  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = this.currentIds.items++;
    const now = new Date();
    const item: Item = {
      ...insertItem,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.items.set(id, item);
    return item;
  }

  async updateItem(id: number, itemUpdate: Partial<Item>): Promise<Item | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;

    const updatedItem = { 
      ...item, 
      ...itemUpdate,
      updatedAt: new Date()
    };
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItem(id: number): Promise<boolean> {
    return this.items.delete(id);
  }

  // Seed data for development
  private seedData(): void {
    // Create test users
    const user1 = this.createUser({
      username: "jamie",
      password: "password123",
      email: "jamie@example.com",
      fullName: "Jamie Davis",
      profilePic: ""
    });

    const user2 = this.createUser({
      username: "sarah",
      password: "password123",
      email: "sarah@example.com",
      fullName: "Sarah Wilson",
      profilePic: ""
    });

    // Create test event
    const campingTrip = this.createEvent({
      name: "Camping Trip",
      description: "Weekend at Yosemite National Park",
      startDate: new Date("2023-06-15"),
      endDate: new Date("2023-06-18"),
      location: "Yosemite National Park",
      createdBy: 1 // Jamie
    });

    // Create members
    this.addEventMember({
      eventId: 1,
      userId: 2,
      role: UserRole.MEMBER
    });

    // Create categories
    const equipmentCategory = this.createCategory({
      eventId: 1,
      name: "Camping Equipment",
      color: "#2563eb"
    });

    const foodCategory = this.createCategory({
      eventId: 1,
      name: "Food & Cooking",
      color: "#16a34a"
    });

    const clothingCategory = this.createCategory({
      eventId: 1,
      name: "Clothing",
      color: "#f59e0b"
    });

    // Create sample items
    this.createItem({
      eventId: 1,
      categoryId: 1,
      name: "4-Person Tent",
      description: "Waterproof tent with rainfly",
      quantity: 1,
      status: ItemStatus.TO_PACK,
      assignedTo: 1,
      notes: "",
      createdBy: 1
    });

    this.createItem({
      eventId: 1,
      categoryId: 1,
      name: "Sleeping Bags",
      description: "Rated for 30°F",
      quantity: 4,
      status: ItemStatus.PACKED,
      assignedTo: 2,
      notes: "Make sure to bring compression sacks",
      createdBy: 1
    });

    this.createItem({
      eventId: 1,
      categoryId: 1,
      name: "Camping Chairs",
      description: "Portable folding chairs",
      quantity: 4,
      status: ItemStatus.DELIVERED,
      assignedTo: 2,
      notes: "",
      createdBy: 2
    });

    this.createItem({
      eventId: 1,
      categoryId: 2,
      name: "Portable Stove",
      description: "Two-burner propane camp stove",
      quantity: 1,
      status: ItemStatus.TO_PACK,
      assignedTo: 1,
      notes: "Don't forget propane tanks",
      createdBy: 1
    });

    this.createItem({
      eventId: 1,
      categoryId: 2,
      name: "Cooler",
      description: "Large cooler for food storage",
      quantity: 1,
      status: ItemStatus.PACKED,
      assignedTo: 2,
      notes: "Fill with ice before departure",
      createdBy: 2
    });
  }
}

export const storage = new MemStorage();
