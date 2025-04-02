// dateCardsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DateCardType } from '../../types/dateCards';

type DateCardsState = {
  defaultCards: DateCardType[];
  customCards: DateCardType[];
  activeCardIds: string[];
  loading: boolean;
  error: string | null;
};

const initialState: DateCardsState = {
  defaultCards: [],
  customCards: [],
  activeCardIds: [],
  loading: false,
  error: null
};

const dateCardsSlice = createSlice({
  name: 'dateCards',
  initialState,
  reducers: {
    setDefaultCards(state, action: PayloadAction<DateCardType[]>) {
      state.defaultCards = action.payload;
    },
    setCustomCards(state, action: PayloadAction<DateCardType[]>) {
      state.customCards = action.payload;
    },
    setActiveCardIds(state, action: PayloadAction<string[]>) {
      state.activeCardIds = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    toggleCardActive(state, action: PayloadAction<string>) {
      const cardId = action.payload;
      state.activeCardIds = state.activeCardIds.includes(cardId)
        ? state.activeCardIds.filter(id => id !== cardId)
        : [...state.activeCardIds, cardId];
    }
  }
});

export default dateCardsSlice;