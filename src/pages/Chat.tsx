import React, { useState, useEffect } from "react";
import UserList from "@/components/UserList";
import ChatInterface from "@/components/ChatInterface";
import StartChat from "@/components/StartChat";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, ChevronLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "@/features/user/userSlice";
import {
  setSelectedUser,
  fetchRecentChats,
  selectSelectedUser,
} from "@/features/chat/chatSlice";
import type { AppDispatch } from "@/app/store";
import { cn } from "@/lib/utils";

// Polling interval for recent chats (10 seconds)
const RECENT_CHATS_POLLING_INTERVAL = 10000;

const Chat: React.FC = () => {
  const [showStartChat, setShowStartChat] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectUser);
  const selectedUser = useSelector(selectSelectedUser);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initial load of recent chats
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchRecentChats());
    }
  }, [currentUser, dispatch]);

  // Polling for recent chats
  useEffect(() => {
    if (!currentUser) return;

    const pollRecentChats = () => {
      dispatch(fetchRecentChats());
    };

    const intervalId = setInterval(
      pollRecentChats,
      RECENT_CHATS_POLLING_INTERVAL,
    );

    return () => clearInterval(intervalId);
  }, [currentUser, dispatch]);

  const handleStartChat = (user: any) => {
    dispatch(setSelectedUser(user));
    setShowStartChat(false);
  };

  const handleMessageSent = () => {
    // Refresh the recent chats list when a message is sent
    dispatch(fetchRecentChats());
  };

  const handleBackToList = () => {
    dispatch(setSelectedUser(null));
  };

  if (!currentUser) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="relative">
      {isMobileView && selectedUser && (
        <button
          className="fixed left-1 top-1/2 -translate-y-1/2 p-2 hover:opacity-70 transition-opacity z-50"
          onClick={handleBackToList}
        >
          <ChevronLeft className="h-6 w-6 text-muted-foreground" />
        </button>
      )}

      <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border">
        {/* Sidebar with user list */}
        <div
          className={cn(
            "w-full md:w-80 flex-shrink-0 border-r flex flex-col bg-background",
            isMobileView && selectedUser && "hidden",
            "md:block",
          )}
        >
          {/* Sidebar Header */}
          <div className="border-b flex items-center justify-between px-4 py-2.5 bg-background">
            <h2 className="font-semibold text-base leading-none">Chats</h2>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowStartChat(!showStartChat)}
            >
              <PlusCircle className="h-4 w-4" />
              <span>New</span>
            </Button>
          </div>

          {/* New Chat Section */}
          {showStartChat && (
            <div className="p-4 border-b bg-muted/30">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-sm">New Chat</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowStartChat(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <StartChat onStartChat={handleStartChat} />
            </div>
          )}

          {/* User List */}
          <div className="flex-1 overflow-hidden">
            <UserList
              onSelectUser={(user) => dispatch(setSelectedUser(user))}
              currentUserId={currentUser.id}
            />
          </div>
        </div>

        {/* Mobile chat view */}
        {isMobileView && selectedUser && (
          <div className="flex-1">
            <ChatInterface onMessageSent={handleMessageSent} />
          </div>
        )}

        {/* Desktop chat area */}
        {(!isMobileView || !selectedUser) && (
          <div
            className={cn(
              "flex-1 flex flex-col overflow-hidden bg-background",
              isMobileView && !selectedUser && "hidden",
              "md:block",
            )}
          >
            <ChatInterface onMessageSent={handleMessageSent} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
