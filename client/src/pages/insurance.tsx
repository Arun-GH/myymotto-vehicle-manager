import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Car, Calendar, Building2, FileText, ExternalLink, Shield, Eye, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { type Vehicle } from "@shared/schema";
import ColorfulLogo from "@/components/colorful-logo";
import { localDocumentStorage, type LocalDocument } from "@/lib/local-storage";
import { format, addDays } from "date-fns";
import NotificationBell from "@/components/notification-bell";
import InfoDropdown from "@/components/info-dropdown";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

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
  const [insuranceDocuments, setInsuranceDocuments] = useState<Record<number, LocalDocument[]>>({});

  const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";

  // Fetch all vehicles for selection
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["/api/vehicles"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles?userId=${currentUserId}`);
      return response.json();
    },
  });

  // Fetch insurance documents for all vehicles
  useEffect(() => {
    const fetchInsuranceDocuments = async () => {
      if (vehicles.length > 0) {
        const documentsByVehicle: Record<number, LocalDocument[]> = {};
        
        for (const vehicle of vehicles) {
          try {
            const docs = await localDocumentStorage.getDocumentsByVehicle(vehicle.id);
            const insuranceDocs = docs.filter((doc: LocalDocument) => doc.type === 'insurance');
            documentsByVehicle[vehicle.id] = insuranceDocs;
          } catch (error) {
            console.error(`Error fetching insurance documents for vehicle ${vehicle.id}:`, error);
            documentsByVehicle[vehicle.id] = [];
          }
        }
        
        setInsuranceDocuments(documentsByVehicle);
      }
    };

    fetchInsuranceDocuments();
  }, [vehicles]);

  const handleVehicleToggle = (vehicleId: number) => {
    setExpandedVehicleId(expandedVehicleId === vehicleId ? null : vehicleId);
  };

  const openDocument = async (document: LocalDocument) => {
    try {
      if (document.fileData) {
        const blob = new Blob([document.fileData], { type: document.mimeType });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening document:', error);
    }
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
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/')}
                className="text-gray-600 hover:bg-red-50 p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Timely Care For Your Carrier</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-red-50 p-1"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <NotificationBell />
              <InfoDropdown />
            </div>
          </div>
        </div>
      </header>

      <div className="p-3">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Insurance Details</h2>
          <p className="text-xs text-gray-600">Tap a vehicle to view insurance information and financial details</p>
        </div>

        {vehicles.length === 0 ? (
          <Card className="shadow-orange p-4">
            <div className="text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">No Vehicles Found</h3>
              <p className="text-sm text-gray-600 mb-4">Add a vehicle first to view insurance details</p>
              <Button 
                onClick={() => setLocation('/add-vehicle')}
                className="bg-orange-500 hover:bg-orange-600 text-white h-9 text-sm"
              >
                Add Vehicle
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {vehicles.map((vehicle: Vehicle) => {
              const vehicleInsuranceDocs = insuranceDocuments[vehicle.id] || [];
              const latestInsuranceDoc = vehicleInsuranceDocs.length > 0 ? vehicleInsuranceDocs[0] : null;
              const insuranceStatus = latestInsuranceDoc?.metadata?.insuranceExpiryDate 
                ? getInsuranceStatus(latestInsuranceDoc.metadata.insuranceExpiryDate) 
                : { status: "No Data", color: "gray" };
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
                          <div className="font-medium text-base text-gray-900">
                            {vehicle.make.toUpperCase()} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-600">{vehicle.licensePlate}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-1 border-${insuranceStatus.color}-200 text-${insuranceStatus.color}-700 bg-${insuranceStatus.color}-50`}
                          >
                            {insuranceStatus.status}
                          </Badge>
                          {latestInsuranceDoc?.metadata?.insuranceProvider && (
                            <div className="text-xs text-gray-500 mt-1 max-w-24 truncate">
                              {latestInsuranceDoc.metadata.insuranceProvider}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-2 space-y-2">
                      {/* Dates & Provider in single row */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <div className="text-xs text-blue-600 font-medium">Issue</div>
                          <div className="text-sm font-semibold">
                            {latestInsuranceDoc?.metadata?.insuranceIssuedDate ? format(new Date(latestInsuranceDoc.metadata.insuranceIssuedDate), 'dd/MM/yy') : 'N/A'}
                          </div>
                        </div>
                        <div className="bg-red-50 p-2 rounded text-center">
                          <div className="text-xs text-red-600 font-medium">Expires</div>
                          <div className="text-sm font-semibold">
                            {latestInsuranceDoc?.metadata?.insuranceExpiryDate ? format(new Date(latestInsuranceDoc.metadata.insuranceExpiryDate), 'dd/MM/yy') : 'N/A'}
                          </div>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-center">
                          <div className="text-xs text-green-600 font-medium">Provider</div>
                          <div className="text-xs font-semibold truncate">
                            {latestInsuranceDoc?.metadata?.insuranceProvider ? latestInsuranceDoc.metadata.insuranceProvider.split(' ')[0] : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Financial Details - Single Row */}
                      {(latestInsuranceDoc?.metadata?.sumInsured || latestInsuranceDoc?.metadata?.insurancePremium) && (
                        <div className="grid grid-cols-2 gap-2">
                          {latestInsuranceDoc?.metadata?.sumInsured && (
                            <div className="bg-green-50 p-2 rounded text-center">
                              <div className="text-xs text-green-600 font-medium">Sum Insured</div>
                              <div className="text-sm font-bold text-green-700">
                                ₹{Number(latestInsuranceDoc.metadata.sumInsured).toLocaleString('en-IN')}
                              </div>
                            </div>
                          )}
                          {latestInsuranceDoc?.metadata?.insurancePremium && (
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <div className="text-xs text-blue-600 font-medium">Premium</div>
                              <div className="text-sm font-bold text-blue-700">
                                ₹{Number(latestInsuranceDoc.metadata.insurancePremium).toLocaleString('en-IN')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Policy Info - Show when available */}
                      {latestInsuranceDoc && (
                        <div className="bg-purple-50 p-2 rounded">
                          <div className="flex justify-between items-center text-xs">
                            <div>
                              <span className="text-purple-600 font-medium">Document: </span>
                              <span className="font-semibold">Insurance Copy</span>
                            </div>
                            <div className="text-right">
                              <span className="text-purple-600 font-medium">Uploaded: </span>
                              <span className="font-semibold">{format(new Date(latestInsuranceDoc.uploadedAt), 'dd/MM/yy')}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Documents - Compact */}
                      {insuranceDocuments[vehicle.id] && insuranceDocuments[vehicle.id].length > 0 && (
                        <div className="bg-orange-50 p-2 rounded">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-orange-600 font-medium">
                              Policy Document
                            </span>
                            <div className="flex space-x-1">
                              {insuranceDocuments[vehicle.id].slice(0, 2).map((doc, index) => (
                                <Button
                                  key={index}
                                  onClick={() => openDocument(doc)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-orange-100"
                                >
                                  <Eye className="w-3 h-3 text-orange-600" />
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Horizontal */}
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => window.open('https://www.policybazaar.com/motor-insurance/', '_blank')}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs px-2"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Renew via PolicyBazaar
                        </Button>
                        {latestInsuranceDoc?.metadata?.insuranceProvider && (
                          <Button 
                            onClick={() => window.open(getProviderWebsite(latestInsuranceDoc.metadata.insuranceProvider!), '_blank')}
                            variant="outline"
                            className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 h-8 text-xs px-2"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {latestInsuranceDoc.metadata.insuranceProvider.split(' ')[0]}
                          </Button>
                        )}
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