import { useQuery } from "@tanstack/react-query";
import { Car, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  totalVehicles: number;
  expiringSoon: number;
  expired: number;
}

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <section className="px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-2 animate-pulse shadow-md">
              <div className="h-6 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-3">
      <div className="grid grid-cols-3 gap-2">
        <Card className="stats-card border-none text-white shadow-md">
          <CardContent className="p-2 text-center">
            <div className="flex justify-center mb-1">
              <Car className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold">{stats?.totalVehicles || 0}</div>
            <div className="text-xs opacity-90">Total Vehicles</div>
          </CardContent>
        </Card>
        
        <Card className="stats-card-accent border-none text-white shadow-md">
          <CardContent className="p-2 text-center">
            <div className="flex justify-center mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold">
              {stats?.expiringSoon || 0}
            </div>
            <div className="text-xs opacity-90">Expiring Soon</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-none text-white shadow-md">
          <CardContent className="p-2 text-center">
            <div className="flex justify-center mb-1">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold">
              {stats?.expired || 0}
            </div>
            <div className="text-xs opacity-90">Expired</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
