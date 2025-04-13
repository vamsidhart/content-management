import {
  contents,
  type Content,
  type InsertContent,
  type UpdateContent,
} from "@shared/schema";

// Storage interface
export interface IStorage {
  getAllContents(): Promise<Content[]>;
  getContent(id: number): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: UpdateContent): Promise<Content | undefined>;
  deleteContent(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private contents: Map<number, Content>;
  private currentId: number;

  constructor() {
    this.contents = new Map();
    this.currentId = 1;
  }

  async getAllContents(): Promise<Content[]> {
    return Array.from(this.contents.values());
  }

  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }

  async createContent(contentData: InsertContent): Promise<Content> {
    const id = this.currentId++;
    const createdAt = new Date();
    
    // Convert plannedDate string to Date object if it's provided
    const plannedDate = contentData.plannedDate 
      ? new Date(contentData.plannedDate) 
      : null;

    const content: Content = {
      ...contentData,
      id,
      plannedDate,
      createdAt,
    };

    this.contents.set(id, content);
    return content;
  }

  async updateContent(id: number, contentData: UpdateContent): Promise<Content | undefined> {
    const existingContent = this.contents.get(id);
    
    if (!existingContent) {
      return undefined;
    }
    
    // Convert plannedDate string to Date object if it's provided and changed
    const plannedDate = contentData.plannedDate !== undefined
      ? contentData.plannedDate ? new Date(contentData.plannedDate) : null
      : existingContent.plannedDate;

    const updatedContent: Content = {
      ...existingContent,
      ...contentData,
      plannedDate,
    };

    this.contents.set(id, updatedContent);
    return updatedContent;
  }

  async deleteContent(id: number): Promise<boolean> {
    if (!this.contents.has(id)) {
      return false;
    }

    return this.contents.delete(id);
  }
}

export const storage = new MemStorage();
