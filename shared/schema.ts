import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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

export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailIdea: text("thumbnail_idea"),
  resourcesLinks: text("resources_links"),
  stage: varchar("stage", { length: 20 }).notNull().default("Idea"),
  contentType: varchar("content_type", { length: 10 }).notNull(),
  plannedDate: timestamp("planned_date"),
  finalLiveLink: text("final_live_link"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schema using drizzle-zod
export const insertContentSchema = createInsertSchema(contents)
  .omit({ id: true, createdAt: true })
  .extend({
    stage: z.enum(contentStages),
    contentType: z.enum(contentTypes),
    plannedDate: z.string().optional().nullable(),
  });

// Create update schema based on insert schema but with all fields optional
export const updateContentSchema = insertContentSchema.partial();

// Define types
export type InsertContent = z.infer<typeof insertContentSchema>;
export type UpdateContent = z.infer<typeof updateContentSchema>;
export type Content = typeof contents.$inferSelect;
export type ContentStage = typeof contentStages[number];
export type ContentType = typeof contentTypes[number];
