import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { getUserByEmail } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { selectRecentChats } from "@/features/chat/chatSlice";
import type { ChatUser } from "@/features/chat/chatSlice";
import { formatRecentChatTimestamp } from "@/utils/dateUtils";

interface UserListProps {
  onSelectUser: (user: ChatUser) => void;
  currentUserId: number;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser, currentUserId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get recent chats from Redux store
  const recentChats = useSelector(selectRecentChats);

  useEffect(() => {
    const searchUser = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        if (searchTerm.includes("@")) {
          const apiUser = await getUserByEmail(searchTerm);
          if (apiUser && apiUser.id !== currentUserId) {
            setSearchResults([apiUser]);
          } else {
            setSearchResults([]);
          }
        } else {
          const filteredUsers = recentChats.filter(
            (user) =>
              user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.profile.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
          );
          setSearchResults(filteredUsers);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(() => {
      searchUser();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, recentChats, currentUserId]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {searchTerm.trim() !== "" ? (
          <div className="space-y-1">
            <h3 className="text-sm font-medium px-2 py-1">Search Results</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground px-2 py-1">
                Searching...
              </p>
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-1">
                No users found
              </p>
            ) : (
              searchResults.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start px-2 py-6"
                  onClick={() => onSelectUser(user)}
                >
                  <UserAvatar
                    user={{ profile: user.profile, email: user.email }}
                    size="sm"
                    className="mr-2"
                  />
                  <div className="text-left">
                    <p className="font-medium">{user.profile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </Button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="text-sm font-medium px-2 py-1">Recent Chats</h3>
            {recentChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  No recent chats
                </p>
                <p className="text-xs text-muted-foreground">
                  Search for a user to start chatting
                </p>
              </div>
            ) : (
              recentChats.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start px-2 py-6"
                  onClick={() => onSelectUser(user)}
                >
                  <UserAvatar
                    user={{ profile: user.profile, email: user.email }}
                    size="sm"
                    className="mr-2"
                  />
                  <div className="text-left flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{user.profile.name}</p>
                      {user.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatRecentChatTimestamp(
                            user.lastMessage.timestamp,
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {user.lastMessage
                          ? user.lastMessage.content
                          : user.email}
                      </p>
                      {user.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {user.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
