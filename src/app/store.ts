import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import chatReducer from "../features/chat/chatSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
