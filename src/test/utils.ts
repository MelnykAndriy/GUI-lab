import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/features/user/userSlice";
import chatReducer from "@/features/chat/chatSlice";

export const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
      chat: chatReducer,
    },
    preloadedState,
  });
};
