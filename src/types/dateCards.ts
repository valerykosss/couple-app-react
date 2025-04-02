export type DateCardType = {
    id: string;
    coupleId: string | null;
    title: string;
    description: string;
    imageUrl: string;
    durationMinutes: number;
    type: 'default' | 'custom';
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
  };