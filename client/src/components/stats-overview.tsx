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
      <section className="px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse shadow-lg">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6">
      <div className="grid grid-cols-3 gap-3">
        <Card className="stats-card border-none text-white shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Car className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">{stats?.totalVehicles || 0}</div>
            <div className="text-xs opacity-90">Total Vehicles</div>
          </CardContent>
        </Card>
        
        <Card className="stats-card-accent border-none text-white shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">
              {stats?.expiringSoon || 0}
            </div>
            <div className="text-xs opacity-90">Expiring Soon</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-600 to-red-700 border-none text-white shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">
              {stats?.expired || 0}
            </div>
            <div className="text-xs opacity-90">Expired</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
