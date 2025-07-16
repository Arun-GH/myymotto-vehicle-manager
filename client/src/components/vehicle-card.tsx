
import { Calendar, AlertTriangle, CheckCircle, Clock, Car, Fuel, Edit, Upload, Eye, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    <Card className="card-hover shadow-orange-dark bg-gradient-to-r from-white to-gray-50 border-l-4 border-l-blue-500">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {vehicle.thumbnailPath ? (
                <img 
                  src={vehicle.thumbnailPath} 
                  alt={`${vehicle.make?.toUpperCase()} ${vehicle.model}`}
                  className="w-10 h-10 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <Car className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {vehicle.make?.toUpperCase()}{vehicle.model ? ` ${vehicle.model}` : ''} {vehicle.year && `(${vehicle.year})`}
                </h3>
                <p className="text-xs text-gray-600">{vehicle.licensePlate}</p>
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
              <span className="text-xs font-medium text-orange-800">
                Missing: {missingDetails.join(", ")}
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 text-xs mb-2">
          <div className="space-y-1">
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold">Insurance Provider:</span>
              <span className="text-gray-800 text-xs">
                {vehicle.insuranceCompany || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold">Insurance Date of Issuance:</span>
              <span className="text-gray-800 text-xs">
                {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : "Not set"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold">Latest Emission:</span>
              <span className="text-gray-800 text-xs">
                {vehicle.emissionExpiry ? new Date(vehicle.emissionExpiry).toLocaleDateString() : "Not set"}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold">Latest Service Date:</span>
              <span className="text-gray-800 text-xs">
                {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : "Not set"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold">Next Service Date:</span>
              <span className={`text-xs ${
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
