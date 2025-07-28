import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import NotificationsPanel from "./notifications-panel";

interface Notification {
  id: number;
  isRead: boolean;
}

export default function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  // Check for notification cache reset and refetch if needed
  useEffect(() => {
    const checkNotificationRefresh = () => {
      if (shouldFetchNotifications()) {
        // Invalidate and refetch notifications when needed
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      }
    };

    // Check on component mount and when focus returns to the page
    checkNotificationRefresh();
    
    const handleFocus = () => checkNotificationRefresh();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryClient]);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      // Try multiple sources for userId
      let currentUserId = localStorage.getItem("currentUserId") || 
                          localStorage.getItem("userId") || 
                          sessionStorage.getItem("currentUserId") ||
                          sessionStorage.getItem("userId") ||
                          "1"; // Fallback to user 1
      
      console.log("Fetching notifications for userId:", currentUserId);
      const response = await apiRequest("GET", `/api/notifications?userId=${currentUserId}`);
      const data = await response.json();
      
      console.log("Received notifications:", data.length);
      
      // Update last fetch timestamp
      const today = new Date().toDateString();
      localStorage.setItem('notifications_last_fetched', today);
      
      return data;
    },
    enabled: true, // Always enable to ensure notifications are fetched
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes for more responsive updates
    gcTime: 24 * 60 * 60 * 1000 // Keep in cache for 24 hours
  });

  // Helper function to determine if notifications should be fetched
  function shouldFetchNotifications(): boolean {
    const lastFetched = localStorage.getItem('notifications_last_fetched');
    const today = new Date().toDateString();
    
    // Fetch if never fetched before or if it's a new day
    return !lastFetched || lastFetched !== today;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-blue-400 hover:bg-white/20 hover:text-blue-300 relative"
        onClick={() => setShowNotifications(true)}
      >
        <Bell className="w-8 h-8 font-bold stroke-2" />
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