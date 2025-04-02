import { TypedUseSelectorHook, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import '../api/firebase/firebase';
import uiSlice from "./slices/uiSlice";
import swiperSlice from "./slices/swiperSlice";
import calendarSlice from "./slices/calendarSlice";
import eventModalSlice from "./slices/eventModalSlice";
import dateCardsSlice from "./slices/dateCardsSlice";

export const action = {
    authSlice: authSlice.actions,
    uiSlice: uiSlice.actions,
    swiperSlice: swiperSlice.actions,
    calendarSlice: calendarSlice.actions,
    eventModalSlice: eventModalSlice.actions,
    dateCardsSlice: dateCardsSlice.actions
}

const store = configureStore({
    reducer: {
        authSlice: authSlice.reducer,
        uiSlice: uiSlice.reducer,
        swiperSlice: swiperSlice.reducer,
        calendarSlice: calendarSlice.reducer,
        eventModalSlice: eventModalSlice.reducer,
        dateCardsSlice: dateCardsSlice.reducer
    }
});

//значение результата выполнения функции store
export type RootState = ReturnType<typeof store.getState>;

//useSelector позволяет извлекать данные из состояния(state) хранилища(store) Redux с помощью функции селектора
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export type AppDispatch = typeof store.dispatch;

export default store;