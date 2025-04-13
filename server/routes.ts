import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, insertEventSchema, insertCategorySchema, 
  insertItemSchema, insertEventMemberSchema, WebSocketMessageType, 
  WebSocketMessage, UserRole
} from "@shared/schema";

// Create session store
const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "packpal-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Create new user
      const user = await storage.createUser(userData);
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userResponse } = user;
      return res.status(201).json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userResponse } = user;
      return res.status(200).json(userResponse);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userResponse } = user;
      return res.status(200).json(userResponse);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Event routes
  app.get("/api/events", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const events = await storage.getEventsByUser(userId);
      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Join event by invite code
  app.post("/api/events/join", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      // Validate request body
      const schema = z.object({
        inviteCode: z.string().min(6)
      });
      
      const { inviteCode } = schema.parse(req.body);
      
      // In a real app, we would look up the event by invite code
      // For this MVP, we'll simplify and assume the invite code is the event ID
      const eventId = parseInt(inviteCode);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid invite code" });
      }
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user is already a member
      const existingMember = await storage.getEventMember(eventId, userId);
      if (existingMember) {
        return res.status(400).json({ message: "You are already a member of this event" });
      }
      
      // Add user as a member with MEMBER role
      const member = await storage.addEventMember({
        eventId,
        userId,
        role: UserRole.MEMBER
      });
      
      // Broadcast member joined message
      const message: WebSocketMessage = {
        type: WebSocketMessageType.MEMBER_JOINED,
        eventId,
        payload: {
          member: {
            ...member,
            user: await storage.getUser(userId)
          }
        }
      };
      
      broadcastToEventMembers(eventId, message);
      
      // Return success with event details
      res.status(201).json({
        eventId: event.id,
        eventName: event.name,
        message: "Successfully joined event"
      });
    } catch (error) {
      console.error("Error joining event:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const eventData = insertEventSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const event = await storage.createEvent(eventData);
      return res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Get event
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user is a member
      const eventMember = await storage.getEventMember(eventId, userId);
      if (!eventMember && event.createdBy !== userId) {
        return res.status(403).json({ message: "Not authorized to view this event" });
      }
      
      return res.status(200).json(event);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user has permission
      const eventMember = await storage.getEventMember(eventId, userId);
      if (
        event.createdBy !== userId && 
        (!eventMember || ![UserRole.OWNER, UserRole.ADMIN].includes(eventMember.role as UserRole))
      ) {
        return res.status(403).json({ message: "Not authorized to update this event" });
      }
      
      // Update event
      const updatedEvent = await storage.updateEvent(eventId, req.body);
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Notify members about the update via WebSocket
      broadcastToEventMembers(eventId, {
        type: WebSocketMessageType.EVENT_UPDATED,
        eventId,
        payload: updatedEvent
      });
      
      return res.status(200).json(updatedEvent);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user has permission (only creator or owner can delete)
      const eventMember = await storage.getEventMember(eventId, userId);
      if (
        event.createdBy !== userId && 
        (!eventMember || eventMember.role !== UserRole.OWNER)
      ) {
        return res.status(403).json({ message: "Not authorized to delete this event" });
      }
      
      // Delete event
      await storage.deleteEvent(eventId);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Event members routes
  app.get("/api/events/:id/members", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Check if user is a member
      const eventMember = await storage.getEventMember(eventId, userId);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (!eventMember && event.createdBy !== userId) {
        return res.status(403).json({ message: "Not authorized to view this event's members" });
      }
      
      const members = await storage.getEventMembers(eventId);
      return res.status(200).json(members);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/events/:id/members", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user has permission to add members
      const eventMember = await storage.getEventMember(eventId, userId);
      if (
        event.createdBy !== userId && 
        (!eventMember || ![UserRole.OWNER, UserRole.ADMIN].includes(eventMember.role as UserRole))
      ) {
        return res.status(403).json({ message: "Not authorized to add members to this event" });
      }
      
      // Validate member data
      const memberData = insertEventMemberSchema.parse({
        ...req.body,
        eventId,
      });
      
      // Check if user exists
      const newMemberUser = await storage.getUser(memberData.userId);
      if (!newMemberUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if already a member
      const existingMember = await storage.getEventMember(eventId, memberData.userId);
      if (existingMember) {
        return res.status(400).json({ message: "User is already a member of this event" });
      }
      
      // Add member
      const addedMember = await storage.addEventMember(memberData);
      
      // Notify members
      broadcastToEventMembers(eventId, {
        type: WebSocketMessageType.MEMBER_JOINED,
        eventId,
        payload: {
          ...addedMember,
          user: newMemberUser
        }
      });
      
      return res.status(201).json(addedMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/events/:eventId/members/:userId", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const memberId = parseInt(req.params.userId);
      const currentUserId = req.session.userId!;
      const { role } = req.body;
      
      // Check if valid role
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user has permission (only owner can change roles)
      const currentUserMember = await storage.getEventMember(eventId, currentUserId);
      if (
        event.createdBy !== currentUserId && 
        (!currentUserMember || currentUserMember.role !== UserRole.OWNER)
      ) {
        return res.status(403).json({ message: "Not authorized to change member roles" });
      }
      
      // Update role
      const updatedMember = await storage.updateEventMemberRole(eventId, memberId, role);
      if (!updatedMember) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      // Notify members
      broadcastToEventMembers(eventId, {
        type: WebSocketMessageType.MEMBER_ROLE_CHANGED,
        eventId,
        payload: updatedMember
      });
      
      return res.status(200).json(updatedMember);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/events/:eventId/members/:userId", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const memberId = parseInt(req.params.userId);
      const currentUserId = req.session.userId!;
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if trying to remove self (leaving) or another member (removing)
      if (memberId === currentUserId) {
        // User is leaving - always allowed unless they're the owner
        const memberToRemove = await storage.getEventMember(eventId, memberId);
        if (memberToRemove && memberToRemove.role === UserRole.OWNER) {
          return res.status(400).json({ message: "Owner cannot leave the event, transfer ownership first" });
        }
      } else {
        // User is removing someone else
        const currentUserMember = await storage.getEventMember(eventId, currentUserId);
        if (
          event.createdBy !== currentUserId && 
          (!currentUserMember || ![UserRole.OWNER, UserRole.ADMIN].includes(currentUserMember.role as UserRole))
        ) {
          return res.status(403).json({ message: "Not authorized to remove members" });
        }
        
        // Cannot remove the owner
        const memberToRemove = await storage.getEventMember(eventId, memberId);
        if (memberToRemove && memberToRemove.role === UserRole.OWNER) {
          return res.status(400).json({ message: "Cannot remove the owner" });
        }
      }
      
      // Remove member
      const success = await storage.removeEventMember(eventId, memberId);
      if (!success) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      // Notify members
      broadcastToEventMembers(eventId, {
        type: WebSocketMessageType.MEMBER_LEFT,
        eventId,
        payload: { userId: memberId }
      });
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Category routes
  app.get("/api/events/:id/categories", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Check if user has access to the event
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const eventMember = await storage.getEventMember(eventId, userId);
      if (!eventMember && event.createdBy !== userId) {
        return res.status(403).json({ message: "Not authorized to view this event's categories" });
      }
      
      const categories = await storage.getCategories(eventId);
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/events/:id/categories", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Check if user has permission
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const eventMember = await storage.getEventMember(eventId, userId);
      if (
        event.createdBy !== userId && 
        (!eventMember || ![UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER].includes(eventMember.role as UserRole))
      ) {
        return res.status(403).json({ message: "Not authorized to add categories to this event" });
      }
      
      // Create category
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        eventId,
      });
      
      const category = await storage.createCategory(categoryData);
      
      // Notify members
      broadcastToEventMembers(eventId, {
        type: WebSocketMessageType.CATEGORY_CREATED,
        eventId,
        payload: category
      });
      
      return res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Get category
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Check if user has permission
      const event = await storage.getEvent(category.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const eventMember = await storage.getEventMember(category.eventId, userId);
      if (
        event.createdBy !== userId && 
        (!eventMember || ![UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER].includes(eventMember.role as UserRole))
      ) {
        return res.status(403).json({ message: "Not authorized to update this category" });
      }
      
      // Update category
      const updatedCategory = await storage.updateCategory(categoryId, req.body);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Notify members
      broadcastToEventMembers(category.eventId, {
        type: WebSocketMessageType.CATEGORY_UPDATED,
        eventId: category.eventId,
        payload: updatedCategory
      });
      
      return res.status(200).json(updatedCategory);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Get category
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Check if user has permission
      const event = await storage.getEvent(category.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const eventMember = await storage.getEventMember(category.eventId, userId);
      if (
        event.createdBy !== userId && 
        (!eventMember || ![UserRole.OWNER, UserRole.ADMIN].includes(eventMember.role as UserRole))
      ) {
        return res.status(403).json({ message: "Not authorized to delete this category" });
      }
      
      // Delete category
      const success = await storage.deleteCategory(categoryId);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Notify members
      broadcastToEventMembers(category.eventId, {
        type: WebSocketMessageType.CATEGORY_DELETED,
        eventId: category.eventId,
        payload: { id: categoryId }
      });
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Item routes
  app.get("/api/events/:id/items", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Check if user has access to the event
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const eventMember = await storage.getEventMember(eventId, userId);
      if (!eventMember && event.createdBy !== userId) {
        return res.status(403).json({ message: "Not authorized to view this event's items" });
      }
      
      const items = await storage.getItems(eventId);
      return res.status(200).json(items);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/events/:id/items", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Check if user has permission
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const eventMember = await storage.getEventMember(eventId, userId);
      if (
        event.createdBy !== userId && 
        (!eventMember || ![UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER].includes(eventMember.role as UserRole))
      ) {
        return res.status(403).json({ message: "Not authorized to add items to this event" });
      }
      
      // Check if category exists
      if (req.body.categoryId) {
        const category = await storage.getCategory(req.body.categoryId);
        if (!category || category.eventId !== eventId) {
          return res.status(400).json({ message: "Invalid category" });
        }
      }
      
      // Create item
      const itemData = insertItemSchema.parse({
        ...req.body,
        eventId,
        createdBy: userId,
      });
      
      const item = await storage.createItem(itemData);
      
      // Notify members
      broadcastToEventMembers(eventId, {
        type: WebSocketMessageType.ITEM_CREATED,
        eventId,
        payload: item
      });
      
      return res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/items/:id", isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Get item
      const item = await storage.getItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Check if user has permission
      const event = await storage.getEvent(item.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const eventMember = await storage.getEventMember(item.eventId, userId);
      
      // Check role-based permissions
      const canEdit = event.createdBy === userId || 
                      (eventMember && [UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER].includes(eventMember.role as UserRole)) ||
                      (item.assignedTo === userId); // Assigned users can update status
                      
      if (!canEdit) {
        return res.status(403).json({ message: "Not authorized to update this item" });
      }
      
      // If changing category, verify it exists and belongs to the same event
      if (req.body.categoryId && req.body.categoryId !== item.categoryId) {
        const category = await storage.getCategory(req.body.categoryId);
        if (!category || category.eventId !== item.eventId) {
          return res.status(400).json({ message: "Invalid category" });
        }
      }
      
      // Update item
      const updatedItem = await storage.updateItem(itemId, req.body);
      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Notify members
      broadcastToEventMembers(item.eventId, {
        type: WebSocketMessageType.ITEM_UPDATED,
        eventId: item.eventId,
        payload: updatedItem
      });
      
      return res.status(200).json(updatedItem);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/items/:id", isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Get item
      const item = await storage.getItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Check if user has permission
      const event = await storage.getEvent(item.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const eventMember = await storage.getEventMember(item.eventId, userId);
      
      const canDelete = event.createdBy === userId || 
                        (eventMember && [UserRole.OWNER, UserRole.ADMIN].includes(eventMember.role as UserRole)) || 
                        (item.createdBy === userId); // Creator can delete their own items
      
      if (!canDelete) {
        return res.status(403).json({ message: "Not authorized to delete this item" });
      }
      
      // Delete item
      const success = await storage.deleteItem(itemId);
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Notify members
      broadcastToEventMembers(item.eventId, {
        type: WebSocketMessageType.ITEM_DELETED,
        eventId: item.eventId,
        payload: { id: itemId }
      });
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected clients with their session IDs and event subscriptions
  const clients = new Map<WebSocket, { userId?: number, subscriptions: Set<number> }>();

  wss.on('connection', (ws: WebSocket) => {
    // Initialize client data
    clients.set(ws, { subscriptions: new Set() });

    // Handle messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'authenticate') {
          // Authenticate the WebSocket connection
          const user = await storage.getUser(data.userId);
          if (user) {
            clients.set(ws, { 
              userId: user.id, 
              subscriptions: clients.get(ws)?.subscriptions || new Set()
            });
          }
        } else if (data.type === 'subscribe') {
          // Subscribe to event updates
          const eventId = parseInt(data.eventId);
          const userId = clients.get(ws)?.userId;
          
          if (!userId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
            return;
          }
          
          // Check if user has access to the event
          const event = await storage.getEvent(eventId);
          if (!event) {
            ws.send(JSON.stringify({ type: 'error', message: 'Event not found' }));
            return;
          }
          
          const eventMember = await storage.getEventMember(eventId, userId);
          if (!eventMember && event.createdBy !== userId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not authorized to subscribe to this event' }));
            return;
          }
          
          // Add to subscription
          const clientData = clients.get(ws);
          if (clientData) {
            clientData.subscriptions.add(eventId);
            clients.set(ws, clientData);
          }
          
          ws.send(JSON.stringify({ type: 'subscribed', eventId }));
        } else if (data.type === 'unsubscribe') {
          // Unsubscribe from event updates
          const eventId = parseInt(data.eventId);
          const clientData = clients.get(ws);
          
          if (clientData) {
            clientData.subscriptions.delete(eventId);
            clients.set(ws, clientData);
          }
          
          ws.send(JSON.stringify({ type: 'unsubscribed', eventId }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Function to broadcast messages to event members
  function broadcastToEventMembers(eventId: number, message: WebSocketMessage) {
    clients.forEach((clientData, client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        clientData.subscriptions.has(eventId)
      ) {
        client.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}
