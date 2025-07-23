import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Car, Calendar, Building2, FileText, ExternalLink, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { type Vehicle } from "@shared/schema";
import ColorfulLogo from "@/components/colorful-logo";
import { format, addDays } from "date-fns";

// Insurance provider data with official websites
const insuranceProviders = {
  "HDFC ERGO": "https://www.hdfcergo.com/motor-insurance",
  "ICICI Lombard": "https://www.icicilombard.com/motor-insurance",
  "Bajaj Allianz": "https://www.bajajallianz.com/motor-insurance.html",
  "TATA AIG": "https://www.tataaig.com/motor-insurance",
  "New India Assurance": "https://www.newindia.co.in/content/motor-insurance",
  "Oriental Insurance": "https://www.orientalinsurance.org.in/web/guest/motor-insurance",
  "United India Insurance": "https://www.uiic.co.in/en/motor-insurance",
  "National Insurance": "https://www.nationalinsurance.nic.co.in/en/motor-insurance",
  "Reliance General": "https://www.reliancegeneral.co.in/Insurance/Motor-Insurance.aspx",
  "Royal Sundaram": "https://www.royalsundaram.in/motor-insurance",
  "Kotak Mahindra": "https://www.kotakgeneral.com/motor-insurance",
  "SBI General": "https://www.sbigeneral.in/motor-insurance",
  "Cholamandalam": "https://www.cholamandalam.com/motor-insurance.aspx",
  "Bharti AXA": "https://www.bharti-axagi.co.in/motor-insurance",
  "Future Generali": "https://www.futuregenerali.in/motor-insurance"
};

export default function Insurance() {
  const [, setLocation] = useLocation();
  const [expandedVehicleId, setExpandedVehicleId] = useState<number | null>(null);

  const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";

  // Fetch all vehicles for selection
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["/api/vehicles"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles?userId=${currentUserId}`);
      return response.json();
    },
  });

  const handleVehicleToggle = (vehicleId: number) => {
    setExpandedVehicleId(expandedVehicleId === vehicleId ? null : vehicleId);
  };

  const getExpiryDate = (insuredDate: string) => {
    if (!insuredDate) return null;
    try {
      const date = new Date(insuredDate);
      return addDays(date, 364);
    } catch {
      return null;
    }
  };

  const getInsuranceStatus = (insuredDate: string) => {
    if (!insuredDate) return { status: "unknown", color: "gray" };
    
    const expiryDate = getExpiryDate(insuredDate);
    if (!expiryDate) return { status: "unknown", color: "gray" };
    
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: "Expired", color: "red" };
    } else if (daysUntilExpiry <= 30) {
      return { status: "Expiring Soon", color: "orange" };
    } else if (daysUntilExpiry <= 60) {
      return { status: "Due Soon", color: "yellow" };
    } else {
      return { status: "Active", color: "green" };
    }
  };

  const getProviderWebsite = (insurerName: string) => {
    return insuranceProviders[insurerName as keyof typeof insuranceProviders] || 
           `https://www.google.com/search?q=${encodeURIComponent(insurerName + " motor insurance")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="header-gradient-border px-3 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/')}
            className="text-gray-600 hover:bg-red-50 h-8 w-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <ColorfulLogo />
          <div>
            <div className="font-bold text-sm">Myymotto</div>
            <div className="text-red-600 text-[10px] font-medium">
              Timely Care For Your Carrier
            </div>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Insurance Details</h2>
          <p className="text-xs text-gray-600">Tap a vehicle to view detailed insurance information</p>
        </div>

        {vehicles.length === 0 ? (
          <Card className="shadow-orange p-4">
            <div className="text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">No Vehicles Found</h3>
              <p className="text-sm text-gray-600 mb-4">Add a vehicle first to view insurance details</p>
              <Button 
                onClick={() => setLocation('/add-vehicle')}
                className="bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs"
              >
                Add Vehicle
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {vehicles.map((vehicle: Vehicle) => {
              const insuranceStatus = getInsuranceStatus(vehicle.insuranceExpiry || "");
              const expiryDate = getExpiryDate(vehicle.insuranceExpiry || "");
              const isExpanded = expandedVehicleId === vehicle.id;
              
              return (
                <Card key={vehicle.id} className="shadow-orange transition-all">
                  {/* Vehicle Header - Always Visible */}
                  <CardContent 
                    className="p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleVehicleToggle(vehicle.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Car className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {vehicle.make.toUpperCase()} {vehicle.model}
                          </div>
                          <div className="text-xs text-gray-600">{vehicle.licensePlate}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] border-${insuranceStatus.color}-200 text-${insuranceStatus.color}-700 bg-${insuranceStatus.color}-50`}
                        >
                          {insuranceStatus.status}
                        </Badge>
                        {vehicle.insuranceCompany && (
                          <div className="text-[10px] text-gray-500 mt-1">
                            {vehicle.insuranceCompany}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-3 space-y-3">
                      {/* Insurance Status Details */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-gray-900">Insurance Status</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Calendar className="w-3 h-3 text-blue-600" />
                              <span className="text-[10px] text-blue-600 font-medium">Insured Date</span>
                            </div>
                            <div className="text-xs font-medium">
                              {vehicle.insuranceExpiry 
                                ? format(new Date(vehicle.insuranceExpiry), 'dd/MM/yyyy')
                                : 'Not available'
                              }
                            </div>
                          </div>
                          <div className="bg-red-50 p-2 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Calendar className="w-3 h-3 text-red-600" />
                              <span className="text-[10px] text-red-600 font-medium">Expiry Date</span>
                            </div>
                            <div className="text-xs font-medium">
                              {expiryDate 
                                ? format(expiryDate, 'dd/MM/yyyy')
                                : 'Not available'
                              }
                            </div>
                          </div>
                        </div>

                        {vehicle.insuranceCompany && (
                          <div className="bg-green-50 p-2 rounded-lg mb-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <Building2 className="w-3 h-3 text-green-600" />
                              <span className="text-[10px] text-green-600 font-medium">Insurance Provider</span>
                            </div>
                            <div className="text-xs font-medium">{vehicle.insuranceCompany}</div>
                          </div>
                        )}

                        {/* OCR Policy Details if available */}
                        {(vehicle.ocrPolicyNumber || vehicle.ocrSumInsured || vehicle.ocrPremiumAmount || vehicle.ocrInsuredName) && (
                          <div className="bg-purple-50 p-2 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="w-3 h-3 text-purple-600" />
                              <span className="text-[10px] text-purple-600 font-medium">Policy Details</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {vehicle.ocrPolicyNumber && (
                                <div className="text-[10px]">
                                  <span className="text-gray-600">Policy No:</span>
                                  <div className="font-medium">{vehicle.ocrPolicyNumber}</div>
                                </div>
                              )}
                              {vehicle.ocrInsuredName && (
                                <div className="text-[10px]">
                                  <span className="text-gray-600">Insured Name:</span>
                                  <div className="font-medium">{vehicle.ocrInsuredName}</div>
                                </div>
                              )}
                              {vehicle.ocrSumInsured && (
                                <div className="text-[10px]">
                                  <span className="text-gray-600">Sum Insured:</span>
                                  <div className="font-medium text-green-600">₹{vehicle.ocrSumInsured}</div>
                                </div>
                              )}
                              {vehicle.ocrPremiumAmount && (
                                <div className="text-[10px]">
                                  <span className="text-gray-600">Premium Paid:</span>
                                  <div className="font-medium text-blue-600">₹{vehicle.ocrPremiumAmount}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {/* PolicyBazaar Link */}
                        <Button 
                          onClick={() => window.open('https://www.policybazaar.com/motor-insurance/', '_blank')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Compare & Renew on PolicyBazaar
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                          {/* Official Insurer Website */}
                          {vehicle.insuranceCompany && (
                            <Button 
                              onClick={() => window.open(getProviderWebsite(vehicle.insuranceCompany!), '_blank')}
                              variant="outline"
                              className="border-orange-200 text-orange-700 hover:bg-orange-50 h-8 text-[10px]"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Visit {vehicle.insuranceCompany.split(' ')[0]} Site
                            </Button>
                          )}

                          {/* Update Insurance Info */}
                          <Button 
                            onClick={() => setLocation(`/vehicle/${vehicle.id}/upload-documents`)}
                            variant="outline"
                            className="border-gray-200 text-gray-700 hover:bg-gray-50 h-8 text-[10px]"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Update Documents
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}