import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CalendarEventType } from '../../types/calendar';

type CalendarState = {
  events: CalendarEventType[];
}

const initialState: CalendarState = {
  events: [],
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setEvents(state, action: PayloadAction<CalendarEventType[]>) {
      state.events = action.payload;
    },
    // addEvent(state, action: PayloadAction<CalendarEventType>) {
    //   state.events.push(action.payload);
    // },
    updateEvent(state, action: PayloadAction<CalendarEventType>) {
      const index = state.events.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    deleteEvent(state, action: PayloadAction<string>){
      state.events = state.events.filter(event => event.id !== action.payload);
    }
  },
});

export default calendarSlice;