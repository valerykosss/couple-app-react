import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SwipeAction = {
  id: number;
  direction: "left" | "right";
};

type SwipeState = {
  history: SwipeAction[];
};

const initialState: SwipeState = {
  history: [],
};

const swiperSlice = createSlice({
  name: "swiper",
  initialState,
  reducers: {
    addSwipe(state, action: PayloadAction<SwipeAction>) {
      state.history.push(action.payload);
    },
    resetHistory(state) {
      state.history = [];
    },
  },
});

export default swiperSlice;
