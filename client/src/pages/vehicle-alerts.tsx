import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bell, Settings } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ColorfulLogo from "@/components/colorful-logo";
import ServiceAlerts from "@/components/service-alerts";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";
import { type Vehicle } from "@shared/schema";

export default function VehicleAlerts() {
  const { id: vehicleId } = useParams();

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`]
  });

  if (vehicleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <img src={logoImage} alt="MyyMotto Logo" className="w-10 h-10 rounded-lg" />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">Service Alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                <Bell className="w-4 h-4" />
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-md p-4 space-y-4">
        {/* Vehicle Info */}
        {vehicle && (
          <Card className="shadow-orange">
            <CardContent className="p-4">
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800">
                  {vehicle.make?.toUpperCase()} {vehicle.model?.toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Alerts Component */}
        {vehicleId && <ServiceAlerts vehicleId={parseInt(vehicleId)} />}
      </main>

      {/* Bottom Navigation Placeholder */}
      <div className="h-16"></div>
    </div>
  );
}