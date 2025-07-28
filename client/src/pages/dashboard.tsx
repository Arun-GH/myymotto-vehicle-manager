import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Car, Camera, Search, Bell, Plus, FileText, AlertTriangle, CheckCircle, Clock, Users, Zap, Shield, Settings, Gamepad2, Puzzle, Newspaper, Files, Wrench, Radio, MessageCircle, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { type Vehicle } from "@shared/schema";
import VehicleCard from "@/components/vehicle-card";
import { apiRequest } from "@/lib/queryClient";

import BottomNav from "@/components/bottom-nav";
import FloatingActionButton from "@/components/floating-action-button";
import NotificationBell from "@/components/notification-bell";
import InfoDropdown from "@/components/info-dropdown";
import VehicleSelectorModal from "@/components/vehicle-selector-modal";

import { Button } from "@/components/ui/button";

import ColorfulLogo from "@/components/colorful-logo";
import BackupReminder from "@/components/backup-reminder";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

function AdminMessageBanner() {
  const [showMessage, setShowMessage] = useState(false);
  const [adminMessage, setAdminMessage] = useState<any>(null);

  useEffect(() => {
    cleanupOldDismissals();
    loadTodaysMessage();
  }, []);

  const cleanupOldDismissals = () => {
    // Clean up old dismissed message entries (older than 7 days)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('admin_message_dismissed_')) {
        const parts = key.split('_');
        if (parts.length >= 5) {
          const dateString = parts.slice(4).join('_');
          const dismissedDate = new Date(dateString);
          const daysDiff = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff > 7) {
            keysToRemove.push(key);
          }
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const loadTodaysMessage = async () => {
    try {
      const response = await apiRequest("GET", "/api/todays-message");
      const data = await response.json();
      if (data && data.message) {
        // Check if user has already dismissed this message today
        const today = new Date().toDateString();
        const dismissedKey = `admin_message_dismissed_${data.id}_${today}`;
        const isDismissed = localStorage.getItem(dismissedKey) === 'true';
        
        setAdminMessage(data);
        setShowMessage(!isDismissed);
      }
    } catch (error) {
      console.error("Error loading today's message:", error);
    }
  };

  const handleDismiss = () => {
    if (adminMessage) {
      // Store dismissal in localStorage with message ID and today's date
      const today = new Date().toDateString();
      const dismissedKey = `admin_message_dismissed_${adminMessage.id}_${today}`;
      localStorage.setItem(dismissedKey, 'true');
    }
    setShowMessage(false);
  };

  if (!showMessage || !adminMessage) return null;

  return (
    <div className="mx-3 mb-4">
      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-lg p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800 mb-1">Message from Admin</p>
            <p className="text-sm text-gray-700">{adminMessage.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [selectorActionType, setSelectorActionType] = useState<'documents' | 'service-logs'>('documents');

  
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    queryFn: async () => {
      const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";
      const response = await apiRequest("GET", `/api/vehicles?userId=${currentUserId}`);
      return response.json();
    },
  });

  const generateNotificationsMutation = useMutation({
    mutationFn: () => {
      const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";
      return apiRequest("POST", "/api/notifications/generate", { userId: currentUserId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  // Auto-generate notifications when dashboard loads (once daily)
  useEffect(() => {
    const lastNotificationCheck = localStorage.getItem("lastNotificationCheck");
    const today = new Date().toDateString();
    
    // Check if we haven't generated notifications today
    if (lastNotificationCheck !== today) {
      generateNotificationsMutation.mutate();
      localStorage.setItem("lastNotificationCheck", today);
    }
  }, [generateNotificationsMutation]);



  return (
    <>
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Timely Care for your carrier</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-red-50 p-1"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <NotificationBell />
              <InfoDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Admin Message Banner */}
      <AdminMessageBanner />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 bg-warm-pattern">
        {/* Backup Reminder for existing users */}
        {vehicles.length > 0 && (
          <div className="px-3 pt-3">
            <BackupReminder />
          </div>
        )}
        {/* Vehicle Count Label */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">
              {vehicles.length > 0 ? `${vehicles.length} Vehicle${vehicles.length > 1 ? 's' : ''}` : 'Vehicle Management'}
            </h2>
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <Link href="/search" className="text-orange-600 hover:text-orange-800 flex items-center space-x-1">
                <Search className="w-3 h-3" />
                <span className="hidden sm:inline">Service Centres Near You</span>
                <span className="sm:hidden">Near You</span>
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/climbing-game" className="text-purple-600 hover:text-purple-800 flex items-center space-x-1">
                <Puzzle className="w-3 h-3" />
                <span className="hidden sm:inline">Logo Puzzle</span>
                <span className="sm:hidden">Puzzle</span>
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/news-tidbits" className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                <Newspaper className="w-3 h-3" />
                <span className="hidden sm:inline">News Bits</span>
                <span className="sm:hidden">News</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions - Show different layout for new users vs existing users */}
        {vehicles.length === 0 ? (
          /* Clean slate for new users */
          <section className="px-3 py-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 text-center shadow-md">
              <Car className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Myymotto!</h2>
              <p className="text-sm text-gray-600 mb-4">Start managing your vehicle by adding your first one</p>
              <Link href="/add-vehicle">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Vehicle
                </Button>
              </Link>
            </div>
            
            {/* Additional engagement options for new users */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link href="/broadcast" className="block">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <Radio className="w-8 h-8 text-blue-500 mb-2" />
                  <h3 className="text-sm font-semibold text-gray-800">Community</h3>
                  <p className="text-xs text-gray-600">Connect with fellow vehicle owners</p>
                </div>
              </Link>
              <Link href="/news-tidbits" className="block">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <Newspaper className="w-8 h-8 text-green-500 mb-2" />
                  <h3 className="text-sm font-semibold text-gray-800">News & Updates</h3>
                  <p className="text-xs text-gray-600">Latest automotive news and policies</p>
                </div>
              </Link>
            </div>
          </section>
        ) : (
          /* Full Quick Actions for existing users */
          <section className="px-3 py-2">
            <h2 className="text-sm font-semibold mb-3 text-gray-800">Quick Actions</h2>
            <div className="grid grid-cols-5 gap-2">
              <Link href="/add-vehicle" className="block">
                <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-300 transition-all duration-200 h-16 px-1 active:scale-95">
                  <Plus className="w-6 h-6 text-red-500 mb-1" />
                  <span className="text-[10px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Add Vehicle</span>
                </div>
              </Link>
              <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 transition-all duration-200 h-16 px-1 active:scale-95" 
                   onClick={() => {
                     if (vehicles.length === 1) {
                       navigate(`/vehicle/${vehicles[0].id}/local-documents`);
                     } else if (vehicles.length > 1) {
                       setSelectorActionType('documents');
                       setShowVehicleSelector(true);
                     }
                   }}>
                <Files className="w-6 h-6 text-purple-500 mb-1" />
                <span className="text-[10px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Documents</span>
              </div>
              <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-teal-300 transition-all duration-200 h-16 px-1 active:scale-95"
                   onClick={() => {
                     if (vehicles.length === 1) {
                       navigate(`/vehicle/${vehicles[0].id}/service-logs`);
                     } else if (vehicles.length > 1) {
                       setSelectorActionType('service-logs');
                       setShowVehicleSelector(true);
                     }
                   }}>
                <Wrench className="w-6 h-6 text-teal-500 mb-1" />
                <span className="text-[10px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Service Log</span>
              </div>
              <Link href="/traffic-violations" className="block">
                <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition-all duration-200 h-16 px-1 active:scale-95">
                  <Zap className="w-6 h-6 text-blue-500 mb-1" />
                  <span className="text-[10px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Violations</span>
                </div>
              </Link>
              <Link href="/insurance" className="block">
                <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-300 transition-all duration-200 h-16 px-1 active:scale-95">
                  <Shield className="w-6 h-6 text-green-500 mb-1" />
                  <span className="text-[10px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Insurance</span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Vehicle List - Only show for existing users */}
        {vehicles.length > 0 && (
          <section className="px-3 py-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Your Vehicles</h2>
              <Button variant="ghost" size="sm" className="text-primary text-sm h-7 px-2">
                View All
              </Button>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-xl p-3 shadow-card animate-pulse">
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </section>
        )}


      </main>

      <BottomNav currentPath="/" />
      <FloatingActionButton />
      
      <VehicleSelectorModal
        isOpen={showVehicleSelector}
        onClose={() => setShowVehicleSelector(false)}
        vehicles={vehicles}
        actionType={selectorActionType}
      />




    </>
  );
}
