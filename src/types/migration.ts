export type MigrationResult = {
  success: boolean;
  migratedCount: number;
  errors: Array<{
    eventId: string;
    error: string;
  }>;
};
