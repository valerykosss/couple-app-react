export type CalendarEventType = {
  id: string; 
  summary: string; 
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  htmlLink?: string;
  status?: string;
  creator?: {
    email: string; 
    displayName: string;
  };
  attendees?: Array<{
    email: string;
    responseStatus: string; 
  }>;
  userIds: string[]; 
  createdBy?: string;
  createdAt?: string; 
  updatedAt?: string; 
  extendedProperties?: {
    private: Record<string, string>; 
  }

  iCalUID?: string; 
  kind?: string;
  organizer?: {
    email: string;
    self?: boolean;
  };
  etag?: string; 
  migratedAt?: string;
  migrationError?: string;
}