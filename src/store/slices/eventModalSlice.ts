import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type EventModalState = {
  isVisible: boolean;
  modalType: 'create' | 'editDelete';
  eventData: {
    id?: string;
    title?: string;
    start: string;
    end: string;
  } | null;
};

const initialState: EventModalState = {
  isVisible: false,
  modalType: 'create',
  eventData: null,
};

const eventModalSlice = createSlice({
  name: 'eventModal',
  initialState,
  reducers: {
    showCreateModal(state, action: PayloadAction<{ start: string; end: string }>) {
      state.isVisible = true;
      state.modalType = 'create';
      state.eventData = {
        start: action.payload.start,
        end: action.payload.end,
      };
    },
    showEditDeleteModal(state, action: PayloadAction<{ id: string; title: string; start: string; end: string }>) {
      state.isVisible = true;
      state.modalType = 'editDelete';
      state.eventData = action.payload;
    },
    hideModal(state) {
      state.isVisible = false;
      state.modalType = 'create';
      state.eventData = null;
    },
  },
});

export default eventModalSlice;