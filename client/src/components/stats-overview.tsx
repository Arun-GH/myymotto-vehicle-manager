import { useQuery } from "@tanstack/react-query";
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
      <section className="px-4 py-6 gradient-primary text-white -mt-4 rounded-b-3xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white bg-opacity-20 rounded-xl p-3 animate-pulse">
              <div className="h-8 bg-white bg-opacity-20 rounded mb-2"></div>
              <div className="h-4 bg-white bg-opacity-20 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 gradient-primary text-white -mt-4 rounded-b-3xl">
      <div className="grid grid-cols-3 gap-4 text-center">
        <Card className="bg-white bg-opacity-20 border-none text-white">
          <CardContent className="p-3">
            <div className="text-2xl font-bold">{stats?.totalVehicles || 0}</div>
            <div className="text-sm opacity-90">Total Vehicles</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white bg-opacity-20 border-none text-white">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-yellow-200">
              {stats?.expiringSoon || 0}
            </div>
            <div className="text-sm opacity-90">Expiring Soon</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white bg-opacity-20 border-none text-white">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-red-200">
              {stats?.expired || 0}
            </div>
            <div className="text-sm opacity-90">Expired</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
