import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Car, Camera, Search, Bell, Plus, FileText, AlertTriangle, CheckCircle, Clock, Users, Zap, Shield, Settings, Gamepad2, Puzzle, Newspaper, Files, Wrench, Radio } from "lucide-react";
import { Link } from "wouter";
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
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [selectorActionType, setSelectorActionType] = useState<'documents' | 'service-logs'>('documents');
  
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const generateNotificationsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/notifications/generate"),
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
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Timely Care For Your Carrier</p>
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 bg-warm-pattern">
        {/* Vehicle Count Label */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">
              {vehicles.length > 0 ? `${vehicles.length} Vehicle${vehicles.length > 1 ? 's' : ''}` : 'Vehicle Management'}
            </h2>
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <Link href="/service-centers" className="text-orange-600 hover:text-orange-800 flex items-center space-x-1">
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

        {/* Quick Actions */}
        <section className="px-3 py-2">
          <h2 className="text-sm font-semibold mb-3 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-5 gap-2">
            <Link href="/add-vehicle" className="block">
              <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-300 transition-all duration-200 h-16 px-1 active:scale-95">
                <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center icon-3d mb-1">
                  <Plus className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Add Vehicle</span>
              </div>
            </Link>
            <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 transition-all duration-200 h-16 px-1 active:scale-95" 
                 onClick={() => {
                   if (vehicles.length === 1) {
                     window.location.href = `/vehicle/${vehicles[0].id}/local-documents`;
                   } else if (vehicles.length > 1) {
                     setSelectorActionType('documents');
                     setShowVehicleSelector(true);
                   } else {
                     alert("Please add a vehicle first");
                   }
                 }}>
              <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center icon-3d mb-1">
                <Files className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[10px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Documents</span>
            </div>
            <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-teal-300 transition-all duration-200 h-16 px-1 active:scale-95"
                 onClick={() => {
                   if (vehicles.length === 1) {
                     window.location.href = `/vehicle/${vehicles[0].id}/service-logs`;
                   } else if (vehicles.length > 1) {
                     setSelectorActionType('service-logs');
                     setShowVehicleSelector(true);
                   } else {
                     alert("Please add a vehicle first");
                   }
                 }}>
              <div className="w-5 h-5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center icon-3d mb-1">
                <Wrench className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[10px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Service Log</span>
            </div>
            <Link href="/traffic-violations" className="block">
              <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition-all duration-200 h-16 px-1 active:scale-95">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center icon-3d mb-1">
                  <Zap className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Violations</span>
              </div>
            </Link>
            <Link href="/insurance-renewals" className="block">
              <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-300 transition-all duration-200 h-16 px-1 active:scale-95">
                <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center icon-3d mb-1">
                  <Shield className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Insurance</span>
              </div>
            </Link>
          </div>
          

        </section>

        {/* Vehicle List */}
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
          ) : vehicles.length === 0 ? (
            <div className="text-center py-6">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No vehicles added yet</p>
              <Link href="/add-vehicle">
                <Button className="mt-3 text-sm h-8">Add Your First Vehicle</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </section>


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
