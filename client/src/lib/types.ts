// Additional frontend-specific types

export type FormattedContent = {
  id: number;
  title: string;
  description: string | null;
  script: string | null;
  thumbnailIdea: string | null;
  resourcesLinks: string | null;
  stage: string;
  contentType: string;
  plannedDate: string | null;
  youtubeLiveLink: string | null;
  instagramLiveLink: string | null;
  createdAt: string;
  userId?: number | null;
  creator?: string;
};

export type KanbanData = {
  [key: string]: FormattedContent[];
};

export type CalendarData = {
  date: Date;
  content: FormattedContent[];
};

export type ContentFormData = {
  title: string;
  description: string;
  script: string;
  thumbnailIdea: string;
  resourcesLinks: string;
  stage: string;
  contentType: string;
  plannedDate: string;
  youtubeLiveLink: string;
  instagramLiveLink: string;
};
