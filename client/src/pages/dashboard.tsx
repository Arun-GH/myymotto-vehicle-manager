import { useQuery } from "@tanstack/react-query";
import { Car, Camera, Search, Bell, Plus } from "lucide-react";
import { Link } from "wouter";
import { type Vehicle } from "@shared/schema";
import VehicleCard from "@/components/vehicle-card";
import StatsOverview from "@/components/stats-overview";
import BottomNav from "@/components/bottom-nav";
import FloatingActionButton from "@/components/floating-action-button";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  return (
    <>
      {/* Header */}
      <header className="bg-primary text-white shadow-lg relative z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Car className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">Myymotto</h1>
                <p className="text-xs text-primary-foreground/80">Timely Care for your carrier</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {/* Stats Overview */}
        <StatsOverview />

        {/* Quick Actions */}
        <section className="px-4 py-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/add-vehicle">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 w-full hover:shadow-lg transition-shadow">
                <Plus className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium">Add Vehicle</span>
              </Button>
            </Link>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-lg transition-shadow">
              <Camera className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Scan Documents</span>
            </Button>
          </div>
        </section>

        {/* Vehicle List */}
        <section className="px-4 pb-6">
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
