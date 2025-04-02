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


export type SwipeSession = {
  id: string;
  coupleId: string;
  activeCoupleCardsId: string;
  status: 'active' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedUserIds: string[];
  matchedCards: string[];
  swipes: {
    [userId: string]: {
      chosenActiveCards: string[];
      declinedActiveCards: string[];
    };
  };
};

export type ActiveCoupleCards = {
  id: string;
  coupleId: string;
  cardIds: string[];
  lastUpdated: string;
};

export type UserSwipe = {
  chosenActiveCards: string[];
  declinedActiveCards: string[];
};