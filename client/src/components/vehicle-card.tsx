import { Link } from "wouter";
import { Calendar, AlertTriangle, CheckCircle, Clock, Car, Fuel, Edit, Upload } from "lucide-react";
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

  // Check for missing details
  const missingDetails = [];
  if (!vehicle.chassisNumber?.trim()) missingDetails.push("Chassis Number");
  if (!vehicle.engineNumber?.trim()) missingDetails.push("Engine Number");

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
    <Card className="card-hover shadow-lg bg-white">
      <CardContent className="p-4">
        <Link href={`/vehicle/${vehicle.id}`}>
          <div className="flex items-start justify-between mb-3 cursor-pointer">
            <div className="flex items-center space-x-3">
              {vehicle.thumbnailPath ? (
                <img 
                  src={vehicle.thumbnailPath} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-12 h-12 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                  <Car className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-800">{vehicle.make} {vehicle.model}</h3>
                <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${
                overallStatus === "expired" ? "bg-red-500" :
                overallStatus === "expiring" ? "bg-orange-500" :
                "bg-green-500"
              } shadow-sm`}></div>
              <StatusIcon className={`w-4 h-4 ${statusColor}`} />
              <span className={`text-xs font-medium ${statusColor}`}>
                {statusText}
              </span>
            </div>
          </div>
        </Link>

        {/* Missing Details Warning */}
        {missingDetails.length > 0 && (
          <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-800">
                Missing: {missingDetails.join(", ")}
              </span>
            </div>
          </div>
        )}
        
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
          <div className="flex items-center space-x-3 text-sm">
            <Link href={`/vehicle/${vehicle.id}`}>
              <Button variant="ghost" size="sm" className="text-primary p-0 h-auto hover:underline">
                View Documents
              </Button>
            </Link>
            <span className="text-gray-300">|</span>
            <Link href={`/vehicle/${vehicle.id}/edit`}>
              <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-auto hover:underline flex items-center space-x-1">
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </Button>
            </Link>
            <span className="text-gray-300">|</span>
            <Link href={`/vehicle/${vehicle.id}/upload`}>
              <Button variant="ghost" size="sm" className="text-green-600 p-0 h-auto hover:underline flex items-center space-x-1">
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </Button>
            </Link>
          </div>
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
    </Card>
  );
}
