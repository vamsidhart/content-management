import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { FormattedContent } from "./types";
import { Content } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date provided to formatDate:", date);
      return "";
    }
    return format(dateObj, "yyyy-MM-dd");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

export function formatDateForDisplay(date: Date | string | null): string {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date provided to formatDateForDisplay:", date);
      return "";
    }
    return format(dateObj, "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date for display:", error);
    return "";
  }
}

export function formatContent(content: Content): FormattedContent {
  return {
    id: content.id,
    title: content.title,
    description: content.description,
    script: content.script || null,
    thumbnailIdea: content.thumbnailIdea,
    resourcesLinks: content.resourcesLinks,
    stage: content.stage,
    contentType: content.contentType,
    plannedDate: content.plannedDate ? formatDate(content.plannedDate) : null,
    youtubeLiveLink: content.youtubeLiveLink || null,
    instagramLiveLink: content.instagramLiveLink || null,
    createdAt: formatDate(content.createdAt),
    userId: content.userId,
  };
}

export function formatContents(contents: Content[]): FormattedContent[] {
  return contents.map(formatContent);
}

export function groupContentsByStage(contents: FormattedContent[]) {
  return contents.reduce((acc, content) => {
    const stage = content.stage;
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(content);
    return acc;
  }, {} as Record<string, FormattedContent[]>);
}

export function getContentTypeColor(type: string): string {
  return type === "Short" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800";
}

export function getStageBorderColor(stage: string): string {
  const colors: Record<string, string> = {
    "Idea": "border-yellow-300",
    "Planning": "border-orange-300",
    "Recording": "border-blue-300",
    "Editing": "border-indigo-300",
    "Published": "border-green-300",
  };
  
  return colors[stage] || "border-gray-300";
}
