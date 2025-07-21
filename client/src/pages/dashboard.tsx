import { useQuery } from "@tanstack/react-query";
import { Car, Camera, Search, Bell, Plus, FileText, AlertTriangle, CheckCircle, Clock, Users, Zap, Shield, Settings, Gamepad2, Puzzle, Newspaper } from "lucide-react";
import { Link } from "wouter";
import { type Vehicle } from "@shared/schema";
import VehicleCard from "@/components/vehicle-card";

import BottomNav from "@/components/bottom-nav";
import FloatingActionButton from "@/components/floating-action-button";
import NotificationBell from "@/components/notification-bell";
import InfoDropdown from "@/components/info-dropdown";
import { Button } from "@/components/ui/button";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function Dashboard() {
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  return (
    <>
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-14 h-14 rounded-lg"
              />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">Timely Care for your carrier</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-red-50"
                >
                  <Settings className="w-6 h-6" />
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
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">
              {vehicles.length > 0 ? `${vehicles.length} Vehicle${vehicles.length > 1 ? 's' : ''}` : 'Vehicle Management'}
            </h2>
            <div className="text-xs text-gray-500 flex items-center space-x-3">
              <Link href="/climbing-game" className="text-purple-600 hover:text-purple-800 underline flex items-center space-x-1">
                <Puzzle className="w-3 h-3" />
                <span>Logo Puzzle Game</span>
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/news-tidbits" className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1">
                <Newspaper className="w-3 h-3" />
                <span>News Bits</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="px-4 py-2">
          <h2 className="text-sm font-semibold mb-2 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/add-vehicle">
              <div className="card-hover bg-white rounded-lg p-2 flex items-center space-x-2 cursor-pointer shadow-orange border border-gray-200 hover:border-red-300 transition-colors">
                <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-800">Add Vehicle</span>
              </div>
            </Link>
            <Link href="/traffic-violations">
              <div className="card-hover bg-white rounded-lg p-2 flex items-center space-x-2 cursor-pointer shadow-orange border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-800">Violations</span>
              </div>
            </Link>
            <Link href="/insurance-renewals">
              <div className="card-hover bg-white rounded-lg p-2 flex items-center space-x-2 cursor-pointer shadow-orange border border-gray-200 hover:border-green-300 transition-colors">
                <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-800">Insurance</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Vehicle List */}
        <section className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Vehicles</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl p-4 shadow-card animate-pulse">
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No vehicles added yet</p>
              <Link href="/add-vehicle">
                <Button className="mt-4">Add Your First Vehicle</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </section>


      </main>

      <BottomNav currentPath="/" />
      <FloatingActionButton />
    </>
  );
}
