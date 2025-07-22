
import { Calendar, AlertTriangle, CheckCircle, Clock, Car, Fuel, Edit, Upload, Eye, Trash2, Settings, Bike, Truck, Zap, Droplets, Plus, Bell } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Vehicle } from "@shared/schema";
import { formatDistanceToNow, getExpiryStatus, getServiceStatus, calculateNextServiceDate } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VehicleCardProps {
  vehicle: Vehicle;
}

// Function to get vehicle type icon
const getVehicleTypeIcon = (vehicleType: string | null) => {
  switch (vehicleType) {
    case "2-wheeler":
      return <Bike className="w-4 h-4 text-blue-600" />;
    case "3-wheeler":
      return <Truck className="w-4 h-4 text-orange-600" />;
    case "4-wheeler":
      return <Car className="w-4 h-4 text-green-600" />;
    default:
      return null;
  }
};

// Function to get fuel type icon
const getFuelTypeIcon = (fuelType: string | null) => {
  switch (fuelType) {
    case "petrol":
      return <Fuel className="w-4 h-4 text-red-600" />;
    case "diesel":
      return <Droplets className="w-4 h-4 text-amber-600" />;
    case "electric":
      return <Zap className="w-4 h-4 text-green-600" />;
    case "hybrid":
      return <div className="flex items-center">
        <Fuel className="w-3 h-3 text-red-500" />
        <Zap className="w-3 h-3 text-green-500 -ml-1" />
      </div>;
    default:
      return null;
  }
};

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch alerts count for this vehicle
  const { data: alerts = [] } = useQuery({
    queryKey: ['/api/service-alerts', vehicle.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/service-alerts/${vehicle.id}`);
      return response.json();
    }
  });

  const alertsCount = alerts.length;

  const insuranceStatus = getExpiryStatus(vehicle.insuranceExpiry);
  const emissionStatus = getExpiryStatus(vehicle.emissionExpiry);
  const serviceStatus = getServiceStatus(vehicle.lastServiceDate);
  const nextServiceInfo = calculateNextServiceDate(vehicle.lastServiceDate, vehicle.serviceIntervalMonths);

  // Check for missing details
  const missingDetails = [];
  if (!vehicle.chassisNumber?.trim()) missingDetails.push("Chassis Number");
  if (!vehicle.engineNumber?.trim()) missingDetails.push("Engine Number");

  // Determine overall status based on insurance and emission status
  const overallStatus = 
    insuranceStatus.status === "expired" || emissionStatus.status === "expired" ? "expired" :
    insuranceStatus.status === "expiring" || emissionStatus.status === "expiring" ? "expiring" :
    insuranceStatus.status === "unknown" || emissionStatus.status === "unknown" ? "unknown" :
    "valid";

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

  const deleteVehicle = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/vehicles/${vehicle.id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete vehicle");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Vehicle Deleted",
        description: `${vehicle.make?.toUpperCase()} ${vehicle.model} has been deleted successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteVehicle.mutate();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <Card className="tile-3d border-l-4 border-l-blue-500">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {vehicle.thumbnailPath ? (
                <img 
                  src={vehicle.thumbnailPath} 
                  alt={`${vehicle.make?.toUpperCase()} ${vehicle.model}`}
                  className="w-10 h-10 object-cover rounded-lg icon-3d"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center icon-3d">
                  <Car className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {vehicle.make?.toUpperCase()}{vehicle.model ? ` ${vehicle.model}` : ''} {vehicle.year && `(${vehicle.year})`}
                </h3>
                <div className="flex items-center space-x-1">
                  <p className="text-xs text-gray-600">{vehicle.licensePlate}</p>
                  {getVehicleTypeIcon(vehicle.vehicleType)}
                  {getFuelTypeIcon(vehicle.fuelType)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  overallStatus === "expired" ? "bg-red-500" :
                  overallStatus === "expiring" ? "bg-orange-500" :
                  "bg-green-500"
                } shadow-sm`}></div>
                <StatusIcon className={`w-3 h-3 ${statusColor}`} />
              </div>
              <div className="flex items-center space-x-1">
                <Link href={`/vehicle/${vehicle.id}/edit`}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:bg-blue-50 p-1 h-auto w-auto"
                    title="Edit vehicle"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`p-1 h-auto w-auto ${
                    showDeleteConfirm 
                      ? "text-red-700 bg-red-100 hover:bg-red-200" 
                      : "text-red-600 hover:bg-red-50"
                  }`}
                  onClick={handleDelete}
                  disabled={deleteVehicle.isPending}
                  title={showDeleteConfirm ? "Click to confirm deletion" : "Delete vehicle"}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                {showDeleteConfirm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 p-1 h-auto w-auto hover:bg-gray-50"
                    onClick={() => setShowDeleteConfirm(false)}
                    title="Cancel deletion"
                  >
                    <span className="text-xs">✕</span>
                  </Button>
                )}
              </div>
            </div>
        </div>

        {/* Missing Details Warning */}
        {missingDetails.length > 0 && (
          <div className="mb-2 p-1.5 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-orange-600" />
              <span className="text-[10px] font-medium text-orange-800">
                Missing: {missingDetails.join(", ")}
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 text-xs mb-2">
          <div className="space-y-1">
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold text-[10px]">Insured date:</span>
              <span className="text-gray-800 text-[10px]">
                {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : "Not set"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold text-[10px]">Latest Emission:</span>
              <span className="text-gray-800 text-[10px]">
                {vehicle.emissionExpiry ? new Date(vehicle.emissionExpiry).toLocaleDateString() : "Not set"}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold text-[10px]">Last Service Date:</span>
              <span className="text-gray-800 text-[10px]">
                {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : "Not set"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold text-[10px]">Next Service Date:</span>
              <span className={`text-[10px] ${
                nextServiceInfo.status === "overdue" ? "text-red-600" :
                nextServiceInfo.status === "due_soon" ? "text-orange-600" :
                nextServiceInfo.status === "due_month" ? "text-yellow-600" :
                "text-gray-800"
              }`}>
                {nextServiceInfo.date ? new Date(nextServiceInfo.date).toLocaleDateString() : "Not set"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-gray-600">Documents:</span>
          <div className="flex items-center space-x-1">
            <Link href={`/vehicle/${vehicle.id}/local-documents`}>
              <Button variant="ghost" size="sm" className="text-red-600 p-1 h-auto hover:bg-red-50 flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span className="text-xs">View</span>
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
        
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs font-bold text-gray-600">Service Log:</span>
          <div className="flex items-center space-x-1">
            <Link href={`/vehicle/${vehicle.id}/service-logs`}>
              <Button variant="ghost" size="sm" className="text-blue-600 p-1 h-auto hover:bg-blue-50 flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span className="text-xs">View</span>
              </Button>
            </Link>
            <span className="text-gray-400 text-xs">|</span>
            <Link href={`/vehicle/${vehicle.id}/service`}>
              <Button variant="ghost" size="sm" className="text-purple-600 p-1 h-auto hover:bg-purple-50 flex items-center space-x-1">
                <Settings className="w-3 h-3" />
                <span className="text-xs">Add</span>
              </Button>
            </Link>
            <span className="text-gray-400 text-xs">|</span>
            <Link href={`/vehicle/${vehicle.id}/alerts`}>
              <Button variant="ghost" size="sm" className="text-orange-600 p-1 h-auto hover:bg-orange-50 flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">Set Alert</span>
                {alertsCount > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[10px] px-1 py-0 h-4 min-w-4 flex items-center justify-center">
                    {alertsCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
