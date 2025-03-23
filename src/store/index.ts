import { TypedUseSelectorHook, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import '../firebase/firebase';
import uiSlice from "./uiSlice";

export const action = {
    authSlice: authSlice.actions,
    uiSlice: uiSlice.actions,
}

const store = configureStore({
    reducer: {
        authSlice: authSlice.reducer,
        uiSlice: uiSlice.reducer,
    }
});

//значение результата выполнения функции store
export type RootState = ReturnType<typeof store.getState>;

//useSelector –– позволяет извлекать данные из состояния(state) хранилища(store) Redux с помощью функции селектора.
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export type AppDispatch = typeof store.dispatch;

export default store;