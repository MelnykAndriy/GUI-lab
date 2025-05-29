import React from "react";
import { User } from "lucide-react";

interface UserAvatarProps {
  user: {
    profile?: {
      name?: string;
      avatarUrl?: string;
      avatarColor?: string;
    };
    email?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
  className = "",
}) => {
  const profile = user.profile || {};

  const getInitials = (name?: string): string => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarSize = (): string => {
    switch (size) {
      case "sm":
        return "h-8 w-8";
      case "lg":
        return "h-16 w-16";
      default:
        return "h-10 w-10"; // md
    }
  };

  const getBackgroundColor = (): string => {
    if (profile.avatarColor) return profile.avatarColor;
    if (user.email) {
      const hash = user.email
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const colors = [
        "bg-purple-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-pink-500",
        "bg-indigo-500",
      ];
      return colors[hash % colors.length];
    }
    return "bg-gray-400";
  };

  const getFallbackContent = () => {
    return profile.name ? (
      <span data-testid="avatar-initials">{getInitials(profile.name)}</span>
    ) : (
      <User data-testid="user-icon" className="text-white h-1/2 w-1/2" />
    );
  };

  const baseClasses = `${getAvatarSize()} ${className} rounded-full flex items-center justify-center text-white overflow-hidden`;

  if (!profile.avatarUrl) {
    return (
      <div data-testid="avatar-container" className={`${baseClasses} ${getBackgroundColor()}`}>
        {getFallbackContent()}
      </div>
    );
  }

  return (
    <div data-testid="avatar-container" className={baseClasses} style={{ position: "relative" }}>
      <img
        data-testid="avatar-image"
        src={profile.avatarUrl}
        alt={profile.name || "User"}
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const container = e.currentTarget.parentElement;
          if (container) {
            container.classList.add(getBackgroundColor());
            // Show the fallback content that's already in the DOM
            const fallback = container.querySelector('[data-testid="avatar-fallback"]');
            if (fallback) {
              fallback.classList.remove("opacity-0");
            }
          }
        }}
      />
      <div
        data-testid="avatar-fallback"
        className={`absolute inset-0 flex items-center justify-center ${getBackgroundColor()} opacity-0`}
      >
        {getFallbackContent()}
      </div>
    </div>
  );
};

export default UserAvatar;
