import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentSchema, updateContentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all content items
  app.get("/api/contents", async (req, res) => {
    try {
      const contents = await storage.getAllContents();
      res.json(contents);
    } catch (error) {
      console.error("Error fetching contents:", error);
      res.status(500).json({ message: "Failed to fetch contents" });
    }
  });

  // Get a single content item by ID
  app.get("/api/contents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const content = await storage.getContent(id);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Create a new content item
  app.post("/api/contents", async (req, res) => {
    try {
      const validContent = insertContentSchema.parse(req.body);
      const newContent = await storage.createContent(validContent);
      res.status(201).json(newContent);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationError.details 
        });
      }
      
      console.error("Error creating content:", error);
      res.status(500).json({ message: "Failed to create content" });
    }
  });

  // Update a content item
  app.patch("/api/contents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const validContent = updateContentSchema.parse(req.body);
      const updatedContent = await storage.updateContent(id, validContent);
      
      if (!updatedContent) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json(updatedContent);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationError.details 
        });
      }
      
      console.error("Error updating content:", error);
      res.status(500).json({ message: "Failed to update content" });
    }
  });

  // Delete a content item
  app.delete("/api/contents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteContent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
