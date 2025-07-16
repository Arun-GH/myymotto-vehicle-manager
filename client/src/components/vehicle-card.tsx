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
    <Card className="card-hover shadow-orange-dark bg-gradient-to-r from-white to-gray-50 border-l-4 border-l-blue-500">
      <CardContent className="p-3">
        <Link href={`/vehicle/${vehicle.id}`}>
          <div className="flex items-center justify-between mb-2 cursor-pointer">
            <div className="flex items-center space-x-2">
              {vehicle.thumbnailPath ? (
                <img 
                  src={vehicle.thumbnailPath} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-10 h-10 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <Car className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {vehicle.make}{vehicle.model ? ` ${vehicle.model}` : ''} {vehicle.year && `(${vehicle.year})`}
                </h3>
                <p className="text-xs text-gray-600">{vehicle.licensePlate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                overallStatus === "expired" ? "bg-red-500" :
                overallStatus === "expiring" ? "bg-orange-500" :
                "bg-green-500"
              } shadow-sm`}></div>
              <StatusIcon className={`w-3 h-3 ${statusColor}`} />
            </div>
          </div>
        </Link>

        {/* Missing Details Warning */}
        {missingDetails.length > 0 && (
          <div className="mb-2 p-1.5 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-orange-600" />
              <span className="text-xs font-medium text-orange-800">
                Missing: {missingDetails.join(", ")}
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-1 text-xs mb-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-1.5 border border-blue-200">
            <div className="flex flex-col items-center">
              <span className="text-blue-600 text-xs font-medium">Insurance</span>
              <span className="text-blue-800 font-semibold text-xs">
                {vehicle.insuranceExpiry ? formatDistanceToNow(new Date(vehicle.insuranceExpiry)) : "Not set"}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-1.5 border border-green-200">
            <div className="flex flex-col items-center">
              <span className="text-green-600 text-xs font-medium">Emission</span>
              <span className="text-green-800 font-semibold text-xs">
                {vehicle.emissionExpiry ? formatDistanceToNow(new Date(vehicle.emissionExpiry)) : "Not set"}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-1.5 border border-purple-200">
            <div className="flex flex-col items-center">
              <span className="text-purple-600 text-xs font-medium">Service</span>
              <span className="text-purple-800 font-semibold text-xs">
                {vehicle.lastServiceDate ? formatDistanceToNow(new Date(vehicle.lastServiceDate)) : "Not set"}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-1.5 border border-orange-200">
            <div className="flex flex-col items-center">
              <span className="text-orange-600 text-xs font-medium">Next</span>
              <span className={`font-semibold text-xs ${
                nextServiceInfo.status === "overdue" ? "text-red-600" :
                nextServiceInfo.status === "due_soon" ? "text-orange-600" :
                nextServiceInfo.status === "due_month" ? "text-yellow-600" :
                "text-orange-800"
              }`}>
                {nextServiceInfo.date ? formatDistanceToNow(new Date(nextServiceInfo.date)) : "Not set"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-600">Documents:</span>
          <div className="flex items-center space-x-1">
            <Link href={`/vehicle/${vehicle.id}/documents`}>
              <Button variant="ghost" size="sm" className="text-red-600 p-1 h-auto hover:bg-red-50 flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span className="text-xs">View</span>
              </Button>
            </Link>
            <span className="text-gray-400 text-xs">|</span>
            <Link href={`/vehicle/${vehicle.id}/edit`}>
              <Button variant="ghost" size="sm" className="text-blue-600 p-1 h-auto hover:bg-blue-50 flex items-center space-x-1">
                <Edit className="w-3 h-3" />
                <span className="text-xs">Edit</span>
              </Button>
            </Link>
            <span className="text-gray-400 text-xs">|</span>
            <Link href={`/vehicle/${vehicle.id}/upload`}>
              <Button variant="ghost" size="sm" className="text-green-600 p-1 h-auto hover:bg-green-50 flex items-center space-x-1">
                <Upload className="w-3 h-3" />
                <span className="text-xs">Upload</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
