import { get, post } from "./api";

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  read?: boolean;
}

export interface SendMessageData {
  receiverId: number;
  content: string;
}

export interface GetMessagesResponse {
  messages: Message[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export const sendMessage = async (data: SendMessageData): Promise<Message> => {
  return post("/api/chats/messages/", data);
};

export const getChatMessages = async (
  userId: number,
  page: number = 1,
  limit: number = 50,
): Promise<GetMessagesResponse> => {
  return get(`/api/chats/messages/${userId}/?page=${page}&limit=${limit}`);
};

export const getRecentChats = async () => {
  return get("/api/chats/");
};

export const markMessagesAsRead = async (userId: number): Promise<void> => {
  return post(`/api/chats/messages/${userId}/read`, {});
};
