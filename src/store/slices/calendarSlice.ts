import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CalendarEventType } from '../../types/calendar';

interface CalendarState {
  events: CalendarEventType[];
  selectedEvent: CalendarEventType | null;
  isLoading: boolean;
  calendarToken: string | null;
}

const initialState: CalendarState = {
  events: [],
  selectedEvent: null,
  isLoading: false,
  calendarToken: null,
};

export const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<CalendarEventType[]>) => {
      state.events = action.payload;
    },
    setSelectedEvent: (state, action: PayloadAction<CalendarEventType | null>) => {
      state.selectedEvent = action.payload;
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCalendarToken: (state, action: PayloadAction<string | null>) => {
      state.calendarToken = action.payload;
    },
  },
});

export default calendarSlice;