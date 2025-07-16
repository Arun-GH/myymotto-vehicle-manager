import { Link } from "wouter";
import { Calendar, AlertTriangle, CheckCircle, Clock, Car, Fuel, Edit, Upload, Eye } from "lucide-react";
import { type Vehicle } from "@shared/schema";
import { formatDistanceToNow, getExpiryStatus, getServiceStatus, calculateNextServiceDate } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const insuranceStatus = getExpiryStatus(vehicle.insuranceExpiry);
  const emissionStatus = getExpiryStatus(vehicle.emissionExpiry);
  const serviceStatus = getServiceStatus(vehicle.lastServiceDate);
  const nextServiceInfo = calculateNextServiceDate(vehicle.lastServiceDate, vehicle.serviceIntervalMonths);

  // Check for missing details
  const missingDetails = [];
  if (!vehicle.chassisNumber?.trim()) missingDetails.push("Chassis Number");
  if (!vehicle.engineNumber?.trim()) missingDetails.push("Engine Number");

  // Determine overall status (all certificates show when issued, so status is always valid unless not set)
  const overallStatus = insuranceStatus.status === "unknown" || emissionStatus.status === "unknown"
    ? "unknown"
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
    <Card className="card-hover shadow-orange-dark bg-white">
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
                <h3 className="font-semibold text-gray-800">
                  {vehicle.make}{vehicle.model ? ` ${vehicle.model}` : ''} {vehicle.year && `(${vehicle.year})`}
                </h3>
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
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Insurance</span>
              <span className="font-medium text-gray-700">
                {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : "Not set"}
              </span>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Emission</span>
              <span className="font-medium text-gray-700">
                {vehicle.emissionExpiry ? new Date(vehicle.emissionExpiry).toLocaleDateString() : "Not set"}
              </span>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Last Service</span>
              <span className="font-medium text-gray-700">
                {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : "Not set"}
              </span>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Next Service</span>
              <span className={`font-medium ${
                nextServiceInfo.status === "overdue" ? "text-red-600" :
                nextServiceInfo.status === "due_soon" ? "text-orange-600" :
                nextServiceInfo.status === "due_month" ? "text-yellow-600" :
                "text-gray-700"
              }`}>
                {nextServiceInfo.date ? new Date(nextServiceInfo.date).toLocaleDateString() : "Not set"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="mb-1">
            <span className="text-gray-600 font-medium text-sm">Documents:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Link href={`/vehicle/${vehicle.id}/documents`}>
              <Button variant="ghost" size="sm" className="w-full text-primary p-2 h-auto hover:bg-red-50 flex items-center justify-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>View</span>
              </Button>
            </Link>
            <Link href={`/vehicle/${vehicle.id}/edit`}>
              <Button variant="ghost" size="sm" className="w-full text-blue-600 p-2 h-auto hover:bg-blue-50 flex items-center justify-center space-x-1">
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </Button>
            </Link>
            <Link href={`/vehicle/${vehicle.id}/upload`}>
              <Button variant="ghost" size="sm" className="w-full text-green-600 p-2 h-auto hover:bg-green-50 flex items-center justify-center space-x-1">
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
