import {
  contents, 
  users,
  type Content,
  type InsertContent,
  type UpdateContent,
  type User,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { randomBytes } from "crypto";

// Configure PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Storage interface
export interface IStorage {
  getAllUsers(): Promise<User[]>;
  // Content methods
  getAllContents(): Promise<Content[]>;
  getUserContents(userId: number): Promise<Content[]>;
  getContent(id: number): Promise<Content | undefined>;
  createContent(content: InsertContent, userId?: number): Promise<Content>;
  updateContent(id: number, content: UpdateContent): Promise<Content | undefined>;
  deleteContent(id: number): Promise<boolean>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session store
  sessionStore: session.Store;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Set up session store
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  async getAllContents(): Promise<Content[]> {
    return await db.select().from(contents);
  }

  async getUserContents(userId: number): Promise<Content[]> {
    return await db.select().from(contents).where(eq(contents.userId, userId));
  }

  async getContent(id: number): Promise<Content | undefined> {
    const result = await db.select().from(contents).where(eq(contents.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createContent(contentData: InsertContent, userId?: number): Promise<Content> {
    // Convert string date to actual Date for database
    const plannedDate = contentData.plannedDate ? new Date(contentData.plannedDate) : null;
    
    const [content] = await db.insert(contents).values({
      ...contentData,
      plannedDate,
      userId: userId || null
    }).returning();
    
    return content;
  }

  async updateContent(id: number, contentData: UpdateContent): Promise<Content | undefined> {
    // Convert string date to actual Date for database if provided
    const updateData = { ...contentData };
    if (updateData.plannedDate !== undefined) {
      updateData.plannedDate = updateData.plannedDate ? new Date(updateData.plannedDate) : null;
    }
    
    const [updatedContent] = await db
      .update(contents)
      .set(updateData)
      .where(eq(contents.id, id))
      .returning();
    
    return updatedContent;
  }

  async deleteContent(id: number): Promise<boolean> {
    const result = await db
      .delete(contents)
      .where(eq(contents.id, id))
      .returning({ id: contents.id });
    
    return result.length > 0;
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
}

// Generate a secure random session secret if it doesn't exist
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = randomBytes(32).toString('hex');
  console.log('Generated session secret');
}

export const storage = new DatabaseStorage();
