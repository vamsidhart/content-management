import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentSchema, updateContentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { WebSocketServer, WebSocket } from 'ws';


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

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.post("/api/user/password", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const hashedPassword = await hashPassword(req.body.password);
      await storage.updateUserPassword(userId, hashedPassword);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast updates to all connected clients
  app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function(data) {
      if (req.method !== 'GET' && req.path.startsWith('/api/contents')) {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'CONTENT_UPDATED' }));
          }
        });
      }
      return originalJson.call(this, data);
    };
    next();
  });

  return server;
}

// Placeholder for password hashing function.  Replace with actual implementation.
async function hashPassword(password: string): Promise<string> {
  return password; // Replace with actual hashing logic
}