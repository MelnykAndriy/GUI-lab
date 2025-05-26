import React, { useEffect, useRef, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  sendNewMessage,
  incrementPage,
  markMessagesAsRead,
  selectMessages,
  selectSelectedUser,
  selectChatPage,
  selectHasMore,
  selectChatLoading,
  selectChatError,
  fetchRecentChats,
} from "@/features/chat/chatSlice";
import { selectUser } from "@/features/user/userSlice";
import { AppDispatch } from "@/app/store";
import { formatMessageTimestamp } from "@/utils/dateUtils";

interface ChatInterfaceProps {
  onMessageSent?: () => void;
}

// Polling interval in milliseconds (3 seconds)
const POLLING_INTERVAL = 3000;

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMessageSent }) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const currentUser = useSelector(selectUser);
  const selectedUser = useSelector(selectSelectedUser);
  const messages = useSelector(selectMessages);
  const page = useSelector(selectChatPage);
  const hasMore = useSelector(selectHasMore);
  const isLoading = useSelector(selectChatLoading);
  const error = useSelector(selectChatError);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      dispatch(fetchMessages({ userId: selectedUser.id, page: 1 }));
      // We'll handle marking messages as read after we load them
    }
  }, [selectedUser?.id, dispatch]);

  // Intersection Observer setup
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading && selectedUser) {
        const nextPage = page + 1;
        dispatch(incrementPage());
        dispatch(fetchMessages({ userId: selectedUser.id, page: nextPage }));
      }
    }, options);

    if (loadingRef.current && hasMore) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [hasMore, isLoading, selectedUser, page, dispatch]);

  const pollMessages = async () => {
    try {
      // Fetch only the first page to check for new messages
      await dispatch(fetchMessages({ userId: selectedUser!.id, page: 1 }));
      // Update recent chats to reflect any new messages
      dispatch(fetchRecentChats());
    } catch (error) {
      console.error("Error polling messages:", error);
    }
  };

  // Polling for new messages
  useEffect(() => {
    if (!selectedUser) return;

    // Poll immediately when user is selected
    pollMessages();

    // Start polling
    const intervalId = setInterval(pollMessages, POLLING_INTERVAL);

    // Cleanup on unmount or when selectedUser changes
    return () => clearInterval(intervalId);
  }, [selectedUser?.id, dispatch]);

  // Mark messages as read when viewing them
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      const hasUnreadMessages = messages.some(
        (msg) => msg.senderId === selectedUser.id && !msg.read,
      );

      if (hasUnreadMessages) {
        dispatch(markMessagesAsRead(selectedUser.id));
      }
    }
  }, [selectedUser?.id, messages, dispatch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    setNewMessage("");

    try {
      await dispatch(
        sendNewMessage({
          receiverId: selectedUser.id,
          content: newMessage,
        }),
      ).unwrap();

      // Poll for new messages immediately after sending
      setTimeout(pollMessages, 500);

      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Message not sent",
        description: "Failed to send your message. Please try again.",
      });
    }
  };

  // Timestamp formatting moved to dateUtils.ts

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <h3 className="text-xl font-medium mb-2">Welcome to Msgtrik</h3>
          <p className="text-muted-foreground">
            Select a user to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b flex items-center px-4 py-2.5 bg-background">
        <div className="flex items-center gap-3">
          <UserAvatar user={selectedUser} size="md" />
          <div>
            <h2 className="font-semibold text-base leading-none mb-1">
              {selectedUser.profile.name}
            </h2>
            <p className="text-sm text-muted-foreground leading-none">
              {selectedUser.email}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Loading indicator at the top */}
          <div ref={loadingRef} className="h-4 w-full">
            {isLoading && hasMore && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Loading messages...
                </p>
              </div>
            )}
          </div>

          {messages.length === 0 && !isLoading ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start chatting!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-center gap-3 ${message.senderId === currentUser?.id ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="flex-shrink-0">
                    <UserAvatar
                      user={
                        message.senderId === currentUser?.id
                          ? currentUser
                          : selectedUser
                      }
                      size="md"
                    />
                  </div>
                  <Card
                    className={`max-w-[70%] ${
                      message.senderId === currentUser?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    <CardContent className="p-3">
                      <p className="break-words">{message.content}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <p className="text-xs opacity-70">
                          {formatMessageTimestamp(message.timestamp)}
                        </p>
                        {message.senderId === currentUser?.id && (
                          <span className="text-xs opacity-70">
                            {message.read ? "• Read" : ""}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
