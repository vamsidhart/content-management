// Additional frontend-specific types

export type FormattedContent = {
  id: number;
  title: string;
  description: string | null;
  thumbnailIdea: string | null;
  resourcesLinks: string | null;
  stage: string;
  contentType: string;
  plannedDate: string | null;
  finalLiveLink: string | null;
  createdAt: string;
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
  thumbnailIdea: string;
  resourcesLinks: string;
  stage: string;
  contentType: string;
  plannedDate: string;
  finalLiveLink: string;
};
