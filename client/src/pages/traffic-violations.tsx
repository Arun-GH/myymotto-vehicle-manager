import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Zap, Search, Clock, MapPin, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ColorfulLogo from "@/components/colorful-logo";
import { format } from "date-fns";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

interface TrafficViolation {
  id: number;
  vehicleId: number;
  challanNumber: string;
  offense: string;
  fineAmount: number;
  violationDate: string;
  location: string;
  status: string;
  paymentDate: string | null;
  lastChecked: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  ownerName: string;
}

export default function TrafficViolations() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vehicles
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["/api/vehicles"],
    staleTime: 30000,
  });

  // Fetch violations for selected vehicle
  const { data: violations, isLoading: violationsLoading } = useQuery({
    queryKey: ["/api/vehicles", selectedVehicle?.id, "violations"],
    enabled: !!selectedVehicle,
    staleTime: 30000,
  });

  // Auto-select first vehicle if available
  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [vehicles, selectedVehicle]);

  // Check for violations mutation
  const checkViolationsMutation = useMutation({
    mutationFn: async (vehicleId: number) => {
      return await apiRequest("POST", `/api/vehicles/${vehicleId}/check-violations`);
    },
    onSuccess: () => {
      toast({
        title: "Violations Checked",
        description: "Traffic violations have been checked successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/vehicles", selectedVehicle?.id, "violations"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check violations",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsChecking(false);
    },
  });

  // Update violation status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ violationId, status, paymentDate }: { violationId: number; status: string; paymentDate?: string }) => {
      return await apiRequest("PUT", `/api/violations/${violationId}/status`, {
        status,
        paymentDate,
      });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Violation status has been updated.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/vehicles", selectedVehicle?.id, "violations"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const handleCheckViolations = async () => {
    if (!selectedVehicle) return;
    
    setIsChecking(true);
    await checkViolationsMutation.mutateAsync(selectedVehicle.id);
  };

  const handleMarkAsPaid = (violationId: number) => {
    updateStatusMutation.mutate({
      violationId,
      status: "paid",
      paymentDate: new Date().toISOString(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (vehiclesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Vehicles Found</h2>
          <p className="text-gray-600">Add a vehicle first to check for traffic violations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header-gradient-border border-4 border-red-500 shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-red-50 p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-14 h-14 rounded-lg"
              />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">Timely Care for your carrier</p>
              </div>
            </div>
            <Zap className="w-8 h-8 text-blue-800 font-bold" />
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pb-20">
        {/* Vehicle Selection */}
        <Card className="mb-6 shadow-lg shadow-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-600" />
              Select Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {vehicles.map((vehicle: Vehicle) => (
                <Button
                  key={vehicle.id}
                  variant={selectedVehicle?.id === vehicle.id ? "default" : "outline"}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="font-semibold">{vehicle.make?.toUpperCase()} {vehicle.model}</div>
                    <div className="text-sm opacity-80">{vehicle.licensePlate}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Check Violations Button */}
        {selectedVehicle && (
          <Card className="mb-6 shadow-lg shadow-orange-100">
            <CardContent className="pt-6">
              <Button
                onClick={handleCheckViolations}
                disabled={isChecking}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Check for Violations
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Check {selectedVehicle.licensePlate} for traffic violations
              </p>
            </CardContent>
          </Card>
        )}

        {/* Violations List */}
        {violationsLoading ? (
          <Card className="shadow-lg shadow-orange-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            </CardContent>
          </Card>
        ) : violations && violations.length > 0 ? (
          <div className="space-y-4">
            {violations.map((violation: TrafficViolation) => (
              <Card key={violation.id} className="shadow-lg shadow-orange-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {violation.challanNumber}
                    </CardTitle>
                    <Badge className={getStatusColor(violation.status)}>
                      {violation.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span className="font-medium">{violation.offense}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{format(new Date(violation.violationDate), "MMM dd, yyyy")}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{violation.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-lg font-bold text-red-600">
                        ₹{violation.fineAmount}
                      </div>
                      
                      {violation.status === "pending" && (
                        <Button
                          onClick={() => handleMarkAsPaid(violation.id)}
                          disabled={updateStatusMutation.isPending}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updateStatusMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Mark as Paid"
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {violation.paymentDate && (
                      <div className="text-sm text-green-600">
                        Paid on {format(new Date(violation.paymentDate), "MMM dd, yyyy")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg shadow-orange-100">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Violations Found</h3>
                <p className="text-gray-600">
                  {selectedVehicle?.licensePlate} has no traffic violations on record.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}