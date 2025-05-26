import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { 
  getChatMessages, 
  sendMessage, 
  getRecentChats, 
  markMessagesAsRead as markMessagesAsReadAPI 
} from '@/services/messageService';
import { compareTimestamps } from '@/utils/dateUtils';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  read?: boolean;
}

export interface ChatUser {
  id: number;
  email: string;
  profile: {
    name: string;
    avatarUrl?: string;
    avatarColor?: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  unreadCount?: number;
}

interface ChatState {
  selectedUser: ChatUser | null;
  messages: Message[];
  recentChats: ChatUser[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  selectedUser: null,
  messages: [],
  recentChats: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ userId, page }: { userId: number; page: number }, { getState, rejectWithValue }) => {
    try {
      const response = await getChatMessages(userId, page);
      const messages = response.messages;

      // Sort messages by timestamp (oldest first)
      messages.sort((a, b) => compareTimestamps(a.timestamp, b.timestamp));

      // If it's a polling request (page 1), compare with existing messages
      if (page === 1) {
        const state = getState() as RootState;
        const existingMessages = state.chat.messages;
        
        if (existingMessages.length > 0) {
          const lastExistingMessage = existingMessages[existingMessages.length - 1];
          const hasNewMessages = messages.some(msg => 
            compareTimestamps(msg.timestamp, lastExistingMessage.timestamp) > 0
          );
          
          if (!hasNewMessages) {
            // If no new messages, return null to skip the update
            return null;
          }
        }
      }

      return {
        messages,
        hasMore: messages.length > 0 && page < response.pagination.pages,
        userId,
        isPolling: page === 1
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

export const sendNewMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ receiverId, content }: { receiverId: number; content: string }, { rejectWithValue }) => {
    try {
      const response = await sendMessage({ receiverId, content });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const fetchRecentChats = createAsyncThunk(
  'chat/fetchRecentChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRecentChats();
      const chats = response.chats.map((chat: any) => ({
        ...chat.user,
        lastMessage: chat.lastMessage,
        unreadCount: chat.unreadCount
      }));

      // Sort chats by last message timestamp (most recent first)
      return chats.sort((a, b) => {
        // If no last message, put at the end
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        
        // Compare timestamps (negative because we want most recent first)
        return -compareTimestamps(a.lastMessage.timestamp, b.lastMessage.timestamp);
      });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recent chats');
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (userId: number, { getState, rejectWithValue }) => {
    try {
      await markMessagesAsReadAPI(userId);
      
      // Update unread count in recent chats
      const state = getState() as RootState;
      const recentChats = state.chat.recentChats.map(chat => 
        chat.id === userId ? { ...chat, unreadCount: 0 } : chat
      );
      
      return { userId, recentChats };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark messages as read');
    }
  }
);

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<ChatUser | null>) => {
      const newSelectedUser = action.payload;
      const currentSelectedUser = state.selectedUser;

      // Only reset if selecting a different user or clearing selection
      if (!newSelectedUser || !currentSelectedUser || newSelectedUser.id !== currentSelectedUser.id) {
        state.messages = [];
        state.page = 1;
        state.hasMore = true;
      }
      state.selectedUser = newSelectedUser;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.page = 1;
      state.hasMore = true;
    },
    incrementPage: (state) => {
      state.page += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages cases
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;

        // Skip update if polling returned null (no new messages)
        if (!action.payload) return;
        
        // Verify messages belong to current selected user
        if (!state.selectedUser || action.payload.userId !== state.selectedUser.id) {
          return; // Ignore messages if they don't belong to current chat
        }

        if (action.payload.isPolling) {
          // For polling updates (page 1), merge with existing messages
          const existingIds = new Set(state.messages.map(msg => msg.id));
          const newMessages = action.payload.messages.filter(msg => !existingIds.has(msg.id));
          
          if (newMessages.length > 0) {
            state.messages = [...state.messages, ...newMessages].sort(
              (a, b) => compareTimestamps(a.timestamp, b.timestamp)
            );
          }
        } else if (state.page === 1) {
          // For initial load or manual refresh
          state.messages = action.payload.messages;
        } else if (action.payload.messages.length > 0) {
          // For pagination
          const existingIds = new Set(state.messages.map(msg => msg.id));
          const newMessages = action.payload.messages.filter(msg => !existingIds.has(msg.id));
          
          if (newMessages.length > 0) {
            state.messages = [...state.messages, ...newMessages].sort(
              (a, b) => compareTimestamps(a.timestamp, b.timestamp)
            );
          }
        }
        
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Send message cases
      .addCase(sendNewMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendNewMessage.fulfilled, (state, action) => {
        // Only add the message if we're still in the same chat
        if (state.selectedUser && action.payload.receiverId === state.selectedUser.id) {
          state.messages.push(action.payload);
          // Re-sort messages after adding new one
          state.messages.sort((a, b) => 
            compareTimestamps(a.timestamp, b.timestamp)
          );
        }
      })
      .addCase(sendNewMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Fetch recent chats cases
      .addCase(fetchRecentChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentChats = action.payload;
      })
      .addCase(fetchRecentChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Mark messages as read cases
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        // Update messages for the current chat
        if (state.selectedUser?.id === action.payload.userId) {
          state.messages = state.messages.map(msg => ({
            ...msg,
            read: true
          }));
        }
        
        // Update recent chats
        state.recentChats = action.payload.recentChats;
      })
  },
});

// Actions
export const { setSelectedUser, clearMessages, incrementPage } = chatSlice.actions;

// Selectors
export const selectSelectedUser = (state: RootState) => state.chat.selectedUser;
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectRecentChats = (state: RootState) => state.chat.recentChats;
export const selectChatPage = (state: RootState) => state.chat.page;
export const selectHasMore = (state: RootState) => state.chat.hasMore;
export const selectChatLoading = (state: RootState) => state.chat.isLoading;
export const selectChatError = (state: RootState) => state.chat.error;

export default chatSlice.reducer; 