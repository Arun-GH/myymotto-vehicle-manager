
import { AlertTriangle, CheckCircle, Clock, Car, Fuel, Edit, Trash2, Bike, Truck, Zap, Droplets, Info } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Vehicle } from "@shared/schema";
import { formatDistanceToNow, getExpiryStatus, getServiceStatus, calculateNextServiceDate } from "@/lib/date-utils";
import { formatToddmmyyyy, formatToDDMMMYYYY, calculateVehicleCompleteness } from "@/lib/date-format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { localDocumentStorage } from "@/lib/local-storage";

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
  const [insuranceDocument, setInsuranceDocument] = useState<any>(null);
  const [emissionDocument, setEmissionDocument] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load insurance and emission documents from local storage
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const documents = await localDocumentStorage.getDocumentsByVehicle(vehicle.id);
        const insurance = documents.find(doc => doc.type === 'insurance');
        const emission = documents.find(doc => doc.type === 'emission');
        setInsuranceDocument(insurance);
        setEmissionDocument(emission);
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    };
    
    loadDocuments();
  }, [vehicle.id]);

  // Fetch service logs for this vehicle to get actual service dates
  const { data: serviceLogs = [] } = useQuery({
    queryKey: [`/api/service-logs/${vehicle.id}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/service-logs/${vehicle.id}`);
      return response.json();
    }
  });

  // Fetch alerts count for this vehicle
  const { data: alerts = [] } = useQuery({
    queryKey: ['/api/service-alerts', vehicle.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/service-alerts/${vehicle.id}`);
      return response.json();
    }
  });

  const alertsCount = alerts.length;

  // Get insurance info from local document instead of vehicle database
  const insuranceExpiryDate = insuranceDocument?.metadata?.insuranceExpiryDate;
  const insuranceIssuedDate = insuranceDocument?.metadata?.insuranceIssuedDate;
  const insuranceProvider = insuranceDocument?.metadata?.insuranceProvider;
  
  // Get emission info from local document instead of vehicle database
  const emissionExpiryDate = emissionDocument?.metadata?.expiryDate || vehicle.emissionExpiry;
  
  // Helper function to get expiry status for renewal dates
  const getDocumentExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { status: "unknown", color: "gray" };
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: "expired", color: "red" };
    } else if (daysUntilExpiry <= 30) {
      return { status: "expiring", color: "orange" };
    } else if (daysUntilExpiry <= 60) {
      return { status: "due_soon", color: "yellow" };
    } else {
      return { status: "active", color: "green" };
    }
  };
  
  const insuranceStatus = getDocumentExpiryStatus(insuranceExpiryDate);
  const emissionStatus = getDocumentExpiryStatus(emissionExpiryDate);
  
  // Calculate last general service date specifically
  const getLastGeneralServiceDate = () => {
    if (!serviceLogs || serviceLogs.length === 0) return null;
    
    // Sort general service logs by date (newest first) - looking for "General Service (Paid)"
    const generalServiceLogs = serviceLogs
      .filter((log: any) => log.serviceDate && log.serviceType === "General Service (Paid)")
      .sort((a: any, b: any) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
    
    return generalServiceLogs.length > 0 ? generalServiceLogs[0].serviceDate : null;
  };
  
  const getNextServiceDate = () => {
    if (!serviceLogs || serviceLogs.length === 0) return null;
    
    // Find the most recent service log with service interval
    const sortedLogs = serviceLogs
      .filter((log: any) => log.serviceDate && log.serviceIntervalMonths)
      .sort((a: any, b: any) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
    
    if (sortedLogs.length === 0) return null;
    
    const lastServiceWithInterval = sortedLogs[0];
    const serviceDate = new Date(lastServiceWithInterval.serviceDate);
    serviceDate.setMonth(serviceDate.getMonth() + lastServiceWithInterval.serviceIntervalMonths);
    
    return serviceDate.toISOString().split('T')[0];
  };
  
  const lastGeneralServiceDate = getLastGeneralServiceDate();
  const nextServiceDate = getNextServiceDate();
  
  const serviceStatus = getServiceStatus(lastGeneralServiceDate);
  const nextServiceInfo = calculateNextServiceDate(lastGeneralServiceDate, null);

  // Check for missing details
  const missingDetails = [];
  if (!vehicle.chassisNumber?.trim()) missingDetails.push("Chassis Number");
  if (!vehicle.engineNumber?.trim()) missingDetails.push("Engine Number");

  // Calculate vehicle completeness using insurance and emission data from documents
  const completenessData = {
    ...vehicle,
    thumbnailPath: vehicle.thumbnailPath ? 'photo-selected' : null,
    insuranceProvider: insuranceProvider,
    insuranceExpiry: insuranceExpiryDate,
    insuranceExpiryDate: insuranceExpiryDate,
    emissionExpiry: emissionExpiryDate,
  };
  const completeness = calculateVehicleCompleteness(completenessData);

  // Determine info icon color based on completeness percentage
  const infoIconColor = completeness.percentage === 100 ? "text-green-600" : "text-red-600";

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
                <h3 className="font-semibold text-gray-800 text-base">
                  {vehicle.make?.toUpperCase()}{vehicle.model ? ` ${vehicle.model}` : ''} {vehicle.year && `(${vehicle.year})`}
                </h3>
                <div className="flex items-center space-x-1">
                  <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                  {getVehicleTypeIcon(vehicle.vehicleType)}
                  {getFuelTypeIcon(vehicle.fuelType)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Info className={`w-3 h-3 ${infoIconColor}`} />
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
              <span className="text-xs font-medium text-orange-800">
                Missing: {missingDetails.join(", ")}
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 text-xs mb-2">
          <div className="space-y-1">
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold text-xs">Insurance Expiry:</span>
              <span className={`text-xs ${
                insuranceStatus.status === "expired" ? "text-red-600" :
                insuranceStatus.status === "expiring" ? "text-orange-600" :
                insuranceStatus.status === "due_soon" ? "text-yellow-600" :
                "text-gray-800"
              }`}>
                {insuranceExpiryDate ? formatToDDMMMYYYY(new Date(insuranceExpiryDate)) : "Not set"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold text-xs">Emission Expiry:</span>
              <span className={`text-xs ${
                emissionStatus.status === "expired" ? "text-red-600" :
                emissionStatus.status === "expiring" ? "text-orange-600" :
                emissionStatus.status === "due_soon" ? "text-yellow-600" :
                "text-gray-800"
              }`}>
                {emissionExpiryDate ? formatToDDMMMYYYY(new Date(emissionExpiryDate)) : "Not set"}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold text-xs">Latest General Service:</span>
              <span className="text-gray-800 text-xs">
                {lastGeneralServiceDate ? formatToDDMMMYYYY(new Date(lastGeneralServiceDate)) : "Not recorded"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold text-xs">Next Service Date:</span>
              <span className={`text-xs ${
                nextServiceDate && new Date(nextServiceDate) < new Date() ? "text-red-600" :
                nextServiceDate && new Date(nextServiceDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "text-orange-600" :
                nextServiceDate && new Date(nextServiceDate) <= new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) ? "text-yellow-600" :
                "text-gray-800"
              }`}>
                {nextServiceDate ? formatToDDMMMYYYY(new Date(nextServiceDate)) : "Not set"}
              </span>
            </div>
          </div>
        </div>
        


      </CardContent>
    </Card>
  );
}
