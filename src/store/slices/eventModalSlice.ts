import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type EventModalState = {
  isVisible: boolean;
  modalType: 'create' | 'edit' | 'delete';
  eventData: { start: string; end: string } | null;
}

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
        state.modalType = "create";
        state.eventData = action.payload;
      },
      showEditModal(state, action: PayloadAction<any>) {
        state.isVisible = true;
        state.modalType = 'edit';
        state.eventData = action.payload;
      },
      showDeleteModal(state, action: PayloadAction<any>) {
        state.isVisible = true;
        state.modalType = 'delete';
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