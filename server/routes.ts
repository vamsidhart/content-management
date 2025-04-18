import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentSchema, updateContentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, requireAdmin, requireEditor } from "./auth";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get all content items (for authenticated users, return only their content)
  app.get("/api/contents", async (req, res) => {
    try {
      let contents;
      if (req.isAuthenticated()) {
        // Get user's contents if authenticated
        contents = await storage.getUserContents((req.user as any).id);
      } else {
        // Otherwise get all contents (for demo purposes)
        contents = await storage.getAllContents();
      }
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
      
      // Check if user has access to this content item
      if (req.isAuthenticated() && content.userId && content.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Access denied" });
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
      let userId = undefined;
      
      // Associate content with authenticated user
      if (req.isAuthenticated()) {
        userId = (req.user as any).id;
      }
      
      const newContent = await storage.createContent(validContent, userId);
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
      
      // Check content ownership
      if (req.isAuthenticated()) {
        const content = await storage.getContent(id);
        if (content && content.userId && content.userId !== (req.user as any).id) {
          return res.status(403).json({ message: "Access denied" });
        }
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

  // Update content stage (for drag-and-drop functionality)
  app.patch("/api/contents/:id/stage", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const { stage } = req.body;
      
      if (!stage) {
        return res.status(400).json({ message: "Stage is required" });
      }
      
      // Check content ownership
      if (req.isAuthenticated()) {
        const content = await storage.getContent(id);
        if (content && content.userId && content.userId !== (req.user as any).id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const updatedContent = await storage.updateContent(id, { stage });
      
      if (!updatedContent) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json(updatedContent);
    } catch (error) {
      console.error("Error updating content stage:", error);
      res.status(500).json({ message: "Failed to update content stage" });
    }
  });

  // Delete a content item
  app.delete("/api/contents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Check content ownership
      if (req.isAuthenticated()) {
        const content = await storage.getContent(id);
        if (content && content.userId && content.userId !== (req.user as any).id) {
          return res.status(403).json({ message: "Access denied" });
        }
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

  // Admin routes for user management
  app.post('/api/users', requireAdmin, async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password)
      });
      res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ message: 'Error creating user' });
    }
  });

  app.get('/api/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
