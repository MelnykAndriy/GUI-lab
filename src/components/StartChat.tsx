import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUserByEmail } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";

interface StartChatProps {
  onStartChat: (user: any) => void;
}

const StartChat: React.FC<StartChatProps> = ({ onStartChat }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const user = await getUserByEmail(email);
      if (user) {
        onStartChat(user);
        setEmail("");
        toast({
          title: "Success",
          description: `Started a chat with ${user.profile.name}`,
        });
      }
    } catch (error: any) {
      console.error("Error finding user:", error);
      toast({
        variant: "destructive",
        title: "User not found",
        description: error.message || "Could not find a user with this email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="email"
        placeholder="Enter user email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="text-sm"
      />
      <Button
        type="submit"
        className="w-full"
        size="sm"
        disabled={isLoading}
      >
        {isLoading ? "Searching..." : "Start Chat"}
      </Button>
    </form>
  );
};

export default StartChat;
