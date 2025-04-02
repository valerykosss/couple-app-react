import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CalendarEventType } from "../../types/calendar";

type CalendarState = {
  events: CalendarEventType[];
  partnerEvents: CalendarEventType[];
  partnerId: string | null;
};

const initialState: CalendarState = {
  events: [],
  partnerEvents: [],
  partnerId: null,
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setEvents(state, action: PayloadAction<CalendarEventType[]>) {
      state.events = action.payload;
    },
    setPartnerId(state, action: PayloadAction<string | null>) {
      state.partnerId = action.payload;
    },
    setPartnerEvents(state, action: PayloadAction<CalendarEventType[]>) {
      state.partnerEvents = action.payload;
    },
    resetPartnerData(state) {
      state.partnerEvents = [];
      state.partnerId = null;
    },
    // addEvent(state, action: PayloadAction<CalendarEventType>) {
    //   state.events.push(action.payload);
    // },
    updateEvent(state, action: PayloadAction<CalendarEventType>) {
      const index = state.events.findIndex(
        (event) => event.id === action.payload.id
      );
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    deleteEvent(state, action: PayloadAction<string>) {
      state.events = state.events.filter(
        (event) => event.id !== action.payload
      );
    },
  },
});

export default calendarSlice;
