/**
 * Format a timestamp for chat messages with smart relative time
 * @param timestamp ISO string timestamp
 * @returns Formatted time string (e.g. "2:30 PM", "Yesterday at 2:30 PM", "Mar 15 at 2:30 PM")
 */
export const formatMessageTimestamp = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const now = new Date();

  // Check if the message is from today
  const isToday = messageDate.toDateString() === now.toDateString();

  // Check if the message is from yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = messageDate.toDateString() === yesterday.toDateString();

  // Format time
  const timeString = messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) {
    return timeString;
  } else if (isYesterday) {
    return `Yesterday at ${timeString}`;
  } else {
    // For older messages, show full date
    const dateString = messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year:
        messageDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
    return `${dateString} at ${timeString}`;
  }
};

/**
 * Format a timestamp for recent chats list
 * @param timestamp ISO string timestamp
 * @returns Formatted date string
 */
export const formatRecentChatTimestamp = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  return messageDate.toLocaleDateString();
};

/**
 * Compare two timestamps for sorting
 * @param a First timestamp
 * @param b Second timestamp
 * @returns Negative if a is earlier, positive if b is earlier
 */
export const compareTimestamps = (a: string, b: string): number => {
  return new Date(a).getTime() - new Date(b).getTime();
};
