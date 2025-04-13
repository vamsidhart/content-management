import { pgTable, text, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Define available content stages
export const contentStages = [
  "Idea",
  "Planning",
  "Recording",
  "Editing",
  "Published",
] as const;

// Define available content types
export const contentTypes = ["Short", "Long"] as const;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// User schema for validation
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true 
});

// Content table with updated fields
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  script: text("script"), // New script field
  thumbnailIdea: text("thumbnail_idea"),
  resourcesLinks: text("resources_links"),
  stage: varchar("stage", { length: 20 }).notNull().default("Idea"),
  contentType: varchar("content_type", { length: 10 }).notNull(),
  plannedDate: timestamp("planned_date"),
  youtubeLiveLink: text("youtube_live_link"), // Renamed from finalLiveLink
  instagramLiveLink: text("instagram_live_link"), // New field
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id), // Reference to user
});

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  contents: many(contents),
}));

export const contentsRelations = relations(contents, ({ one }) => ({
  user: one(users, {
    fields: [contents.userId],
    references: [users.id],
  }),
}));

// Create insert schema using drizzle-zod
export const insertContentSchema = createInsertSchema(contents)
  .omit({ id: true, createdAt: true, userId: true })
  .extend({
    stage: z.enum(contentStages),
    contentType: z.enum(contentTypes),
    plannedDate: z.string().optional().nullable(),
    script: z.string().optional().nullable(),
    youtubeLiveLink: z.string().optional().nullable(),
    instagramLiveLink: z.string().optional().nullable(),
  });

// Create update schema based on insert schema but with all fields optional
export const updateContentSchema = insertContentSchema.partial();

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type UpdateContent = z.infer<typeof updateContentSchema>;
export type Content = typeof contents.$inferSelect;
export type ContentStage = typeof contentStages[number];
export type ContentType = typeof contentTypes[number];
