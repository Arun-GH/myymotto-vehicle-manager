import { useState } from "react";
import { Link } from "wouter";
import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import NotificationsPanel from "./notifications-panel";

interface Notification {
  id: number;
  isRead: boolean;
}

export default function FloatingActionButton() {
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <div className="fixed bottom-20 right-4 flex flex-col space-y-3 z-30">
        {/* Notifications Button */}
        <Button
          size="lg"
          onClick={() => setShowNotifications(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Add Vehicle Button */}
        <Link href="/add-vehicle">
          <Button
            size="lg"
            className="w-14 h-14 rounded-full gradient-warm text-white border-0 hover:opacity-90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}
