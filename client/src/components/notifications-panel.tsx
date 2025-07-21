import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bell, X, Check, AlertTriangle, Car, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "@/lib/date-utils";

interface Notification {
  id: number;
  vehicleId: number | null;
  type: string;
  title: string;
  message: string;
  dueDate: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsPanelProps {
  onClose: () => void;
}

export default function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"]
  });

  // Fetch vehicles data to get license plate numbers
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"]
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PUT", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const generateNotificationsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/notifications/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Helper function to get vehicle license plate by vehicleId
  const getVehicleLicensePlate = (vehicleId: number | null) => {
    if (!vehicleId || !vehicles) return null;
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? vehicle.licensePlate : null;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'insurance':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'emission':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'service':
        return <Calendar className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'insurance':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Insurance</Badge>;
      case 'emission':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Emission</Badge>;
      case 'service':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Service</Badge>;
      default:
        return <Badge variant="secondary">General</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <Card className="w-full max-w-md shadow-orange">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Loading Notifications...</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden shadow-orange">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="bg-red-500">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateNotificationsMutation.mutate()}
              disabled={generateNotificationsMutation.isPending}
              className="text-blue-600 hover:text-blue-700 border-blue-300"
            >
              {generateNotificationsMutation.isPending ? "Checking..." : "Check Renewals"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="max-h-[60vh] overflow-y-auto space-y-3 px-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">We'll notify you when documents need renewal</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.isRead 
                    ? "bg-gray-50 border-gray-200" 
                    : "bg-white border-blue-200 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getTypeIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        {getTypeBadge(notification.type)}
                        {notification.vehicleId && getVehicleLicensePlate(notification.vehicleId) && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">
                            {getVehicleLicensePlate(notification.vehicleId)}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Due: {new Date(notification.dueDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(notification.createdAt))}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      disabled={markAsReadMutation.isPending}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}