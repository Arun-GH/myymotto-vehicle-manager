import { useQuery } from "@tanstack/react-query";
import { Car, Camera, Search, Bell, Plus, FileText, AlertTriangle, CheckCircle, Clock, Users } from "lucide-react";
import { Link } from "wouter";
import { type Vehicle } from "@shared/schema";
import VehicleCard from "@/components/vehicle-card";
import StatsOverview from "@/components/stats-overview";
import BottomNav from "@/components/bottom-nav";
import FloatingActionButton from "@/components/floating-action-button";
import NotificationBell from "@/components/notification-bell";
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
      <header className="gradient-warm text-white shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-1 rounded-xl">
                <img 
                  src={logoImage} 
                  alt="Myymotto Logo" 
                  className="w-10 h-10 rounded-lg"
                />
              </div>
              <div>
                <ColorfulLogo />
                <p className="text-sm text-white/80">Timely Care for your carrier</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 bg-warm-pattern">
        {/* Stats Overview */}
        <StatsOverview />

        {/* Quick Actions */}
        <section className="px-4 py-3">
          <h2 className="text-base font-semibold mb-3 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/add-vehicle">
              <div className="card-hover bg-white rounded-xl p-3 flex flex-col items-center space-y-2 cursor-pointer shadow-orange">
                <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-xl shadow-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-800">Add Vehicle</span>
              </div>
            </Link>
            <Link href="/documents">
              <div className="card-hover bg-white rounded-xl p-3 flex flex-col items-center space-y-2 cursor-pointer shadow-orange">
                <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-2 rounded-xl shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-800">Documents</span>
              </div>
            </Link>
            <Link href="/emergency-contacts">
              <div className="card-hover bg-white rounded-xl p-3 flex flex-col items-center space-y-2 cursor-pointer shadow-orange">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-800">Emergency</span>
              </div>
            </Link>
            <Link href="/service-centers">
              <div className="card-hover bg-white rounded-xl p-3 flex flex-col items-center space-y-2 cursor-pointer shadow-orange">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2 rounded-xl shadow-lg">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-800">Service</span>
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
