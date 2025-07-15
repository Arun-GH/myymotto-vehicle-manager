import { Link } from "wouter";
import { Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { type Vehicle } from "@shared/schema";
import { formatDistanceToNow, getExpiryStatus } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const insuranceStatus = getExpiryStatus(vehicle.insuranceExpiry);
  const emissionStatus = getExpiryStatus(vehicle.emissionExpiry);

  // Determine overall status
  const overallStatus = insuranceStatus.status === "expired" || emissionStatus.status === "expired" 
    ? "expired"
    : insuranceStatus.status === "expiring" || emissionStatus.status === "expiring"
    ? "expiring"
    : "valid";

  const StatusIcon = {
    expired: AlertTriangle,
    expiring: Clock,
    valid: CheckCircle,
    unknown: Clock,
  }[overallStatus];

  const statusColor = {
    expired: "text-destructive",
    expiring: "text-warning",
    valid: "text-green-600",
    unknown: "text-muted-foreground",
  }[overallStatus];

  const statusText = {
    expired: "Expired",
    expiring: "Expiring Soon",
    valid: "All Valid",
    unknown: "Check Required",
  }[overallStatus];

  return (
    <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
      <Link href={`/vehicle/${vehicle.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                  {vehicle.make.charAt(0)}{vehicle.model.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{vehicle.make} {vehicle.model}</h3>
                <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                overallStatus === "expired" ? "bg-destructive" :
                overallStatus === "expiring" ? "bg-warning" :
                "bg-green-500"
              }`}></div>
              <StatusIcon className={`w-4 h-4 ${statusColor}`} />
              <span className={`text-xs font-medium ${statusColor}`}>
                {statusText}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Insurance</span>
                <span className={`font-medium ${
                  insuranceStatus.status === "expired" ? "text-destructive" :
                  insuranceStatus.status === "expiring" ? "text-warning" :
                  "text-green-600"
                }`}>
                  {insuranceStatus.shortText}
                </span>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Emission</span>
                <span className={`font-medium ${
                  emissionStatus.status === "expired" ? "text-destructive" :
                  emissionStatus.status === "expiring" ? "text-warning" :
                  "text-green-600"
                }`}>
                  {emissionStatus.shortText}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <Button variant="ghost" size="sm" className="text-primary p-0 h-auto">
              View Documents
            </Button>
            {overallStatus === "expired" || overallStatus === "expiring" ? (
              <Button variant="ghost" size="sm" className="text-destructive p-0 h-auto">
                Renew Now
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="text-muted-foreground p-0 h-auto cursor-default">
                All Current
              </Button>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
