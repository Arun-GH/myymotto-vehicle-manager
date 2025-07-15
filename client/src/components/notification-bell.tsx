import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import NotificationsPanel from "./notifications-panel";

interface Notification {
  id: number;
  isRead: boolean;
}

export default function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-blue-300 hover:bg-white/20 hover:text-blue-200 relative"
        onClick={() => setShowNotifications(true)}
      >
        <Bell className="w-6 h-6 font-bold stroke-2" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}