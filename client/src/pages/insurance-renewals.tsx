import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Calendar, AlertTriangle, Shield, Clock, Building2 } from "lucide-react";
import { type Vehicle } from "@shared/schema";
import { getExpiryStatus } from "@/lib/date-utils";
import { format } from "date-fns";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";
import { useToast } from "@/hooks/use-toast";

export default function InsuranceRenewals() {
  const { toast } = useToast();
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Filter vehicles that need insurance renewal (expired or expiring soon)
  const vehiclesNeedingRenewal = vehicles.filter(vehicle => {
    if (!vehicle.insuranceExpiry) return true;
    const status = getExpiryStatus(vehicle.insuranceExpiry);
    return status.status === "expired" || status.status === "expiring";
  });

  const handlePolicyBazarClick = (vehicle: Vehicle) => {
    // Copy vehicle number to clipboard for easy pasting
    if (vehicle.licensePlate) {
      navigator.clipboard.writeText(vehicle.licensePlate).then(() => {
        toast({
          title: "Vehicle Number Copied!",
          description: `${vehicle.licensePlate} copied to clipboard. Paste it in PolicyBazar to get quotes.`,
        });
      }).catch(() => {
        // Fallback if clipboard API fails
        toast({
          title: "Ready for PolicyBazar",
          description: `Use vehicle number: ${vehicle.licensePlate}`,
        });
      });
    }
    
    // Open PolicyBazar car insurance page
    const policyBazarUrl = 'https://www.policybazaar.com/motor-insurance/car-insurance/';
    window.open(policyBazarUrl, '_blank');
  };

  const handleOtherInsuranceClick = () => {
    window.open('https://www.acko.com/car-insurance/', '_blank');
  };

  const getInsuranceRenewalInfo = (companyName: string): { url: string; name: string } => {
    const renewalPages: { [key: string]: { url: string; name: string } } = {
      'HDFC ERGO': { 
        url: 'https://www.hdfcergo.com/renew-hdfc-ergo-policy',
        name: 'HDFC ERGO'
      },
      'ICICI LOMBARD': { 
        url: 'https://www.icicilombard.com/renew-policy-online',
        name: 'ICICI Lombard'
      },
      'BAJAJ ALLIANZ': { 
        url: 'https://www.bajajallianz.com/quick-renew/',
        name: 'Bajaj Allianz'
      },
      'TATA AIG': { 
        url: 'https://www.tataaig.com/motor-insurance/renew-car-insurance',
        name: 'Tata AIG'
      },
      'NEW INDIA ASSURANCE': { 
        url: 'https://www.newindia.co.in/online-renewal',
        name: 'New India Assurance'
      },
      'RELIANCE GENERAL': { 
        url: 'https://www.reliancegeneral.co.in/Insurance/motor-insurance-renewal.aspx',
        name: 'Reliance General'
      },
      'ORIENTAL INSURANCE': { 
        url: 'https://www.orientalinsurance.org.in/motor-insurance',
        name: 'Oriental Insurance'
      },
      'UNITED INDIA': { 
        url: 'https://www.uiic.co.in/renewal',
        name: 'United India'
      },
      'NATIONAL INSURANCE': { 
        url: 'https://www.nationalinsurance.nic.co.in/motor-insurance',
        name: 'National Insurance'
      },
      'SBI GENERAL': { 
        url: 'https://www.sbigeneral.in/motor-insurance/car-insurance-renewal',
        name: 'SBI General'
      },
      'IFFCO TOKIO': { 
        url: 'https://www.iffcotokio.co.in/motor-insurance/car-insurance',
        name: 'IFFCO Tokio'
      },
      'ROYAL SUNDARAM': { 
        url: 'https://www.royalsundaram.in/motor-insurance/car-insurance',
        name: 'Royal Sundaram'
      },
      'CHOLAMANDALAM': { 
        url: 'https://www.cholamandalam.com/motor-insurance/car-insurance-renewal.aspx',
        name: 'Cholamandalam'
      },
      'LIBERTY GENERAL': { 
        url: 'https://www.libertyinsurance.in/motor-insurance/car-insurance',
        name: 'Liberty General'
      },
      'FUTURE GENERALI': { 
        url: 'https://www.futuregenerali.in/motor-insurance/car-insurance',
        name: 'Future Generali'
      },
      'DIGIT INSURANCE': { 
        url: 'https://www.godigit.com/motor-insurance/car-insurance-renewal',
        name: 'Digit Insurance'
      },
      'ACKO': { 
        url: 'https://www.acko.com/car-insurance/',
        name: 'Acko'
      },
      'BHARTI AXA': { 
        url: 'https://www.bharti-axagi.co.in/motor-insurance/car-insurance',
        name: 'Bharti AXA'
      }
    };
    
    const normalizedName = companyName?.toUpperCase().trim();
    return renewalPages[normalizedName] || { 
      url: `https://www.google.com/search?q=${encodeURIComponent(companyName + ' car insurance renewal')}`,
      name: companyName
    };
  };

  const handleCurrentInsurerRenewal = (vehicle: Vehicle) => {
    const renewalInfo = getInsuranceRenewalInfo(vehicle.insuranceCompany!);
    
    // Copy vehicle number to clipboard for easy pasting
    if (vehicle.licensePlate) {
      navigator.clipboard.writeText(vehicle.licensePlate).then(() => {
        toast({
          title: "Vehicle Number Copied!",
          description: `${vehicle.licensePlate} copied for ${renewalInfo.name} renewal page.`,
        });
      }).catch(() => {
        // Fallback if clipboard API fails
        toast({
          title: "Ready for Renewal",
          description: `Use vehicle number: ${vehicle.licensePlate}`,
        });
      });
    }
    
    // Open the specific renewal page
    window.open(renewalInfo.url, '_blank');
  };

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
            <Shield className="w-8 h-8 text-blue-800 font-bold" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Insurance Renewals</h1>
          <p className="text-gray-600">Compare and renew your vehicle insurance policies</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-lg shadow-orange-100 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vehiclesNeedingRenewal.length === 0 ? (
          <Card className="shadow-lg shadow-orange-100">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">All Insurance Up to Date</h3>
                <p className="text-gray-600">
                  All your vehicles have valid insurance policies.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {vehiclesNeedingRenewal.map((vehicle) => {
              const insuranceStatus = vehicle.insuranceExpiry 
                ? getExpiryStatus(vehicle.insuranceExpiry)
                : { status: "unknown" as const, daysLeft: 0 };

              return (
                <Card key={vehicle.id} className="shadow-lg shadow-orange-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {vehicle.make?.toUpperCase()} {vehicle.model} ({vehicle.year})
                      </CardTitle>
                      <Badge 
                        className={
                          insuranceStatus.status === "expired" ? "bg-red-100 text-red-800" :
                          insuranceStatus.status === "expiring" ? "bg-orange-100 text-orange-800" :
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {insuranceStatus.status === "expired" ? "EXPIRED" :
                         insuranceStatus.status === "expiring" ? "EXPIRING SOON" :
                         "NEEDS RENEWAL"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Current Insurance Info */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          {insuranceStatus.status === "expired" ? 
                            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" /> :
                            <Clock className="w-4 h-4 text-orange-600 mr-2" />
                          }
                          <span className="text-sm font-medium text-gray-700">Current Insurance</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Provider:</span>
                            <p className="font-medium">{vehicle.insuranceCompany || "Not specified"}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Expires:</span>
                            <p className="font-medium">
                              {vehicle.insuranceExpiry 
                                ? format(new Date(vehicle.insuranceExpiry), "MMM dd, yyyy")
                                : "Not set"
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Renewal Options */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-800">Compare & Renew Insurance</h4>
                        
                        {/* Current Insurer Direct Renewal */}
                        {vehicle.insuranceCompany && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Renew with Current Provider</h5>
                            <Button
                              onClick={() => handleCurrentInsurerRenewal(vehicle)}
                              variant="outline"
                              className="w-full border-green-200 bg-green-50 hover:bg-green-100 text-green-800 flex items-center justify-between p-3 h-auto"
                            >
                              <div className="flex items-center">
                                <Building2 className="w-4 h-4 mr-2" />
                                <div className="text-left">
                                  <div className="font-medium">{vehicle.insuranceCompany}</div>
                                  <div className="text-xs opacity-80">Vehicle number copied • Direct renewal</div>
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                          💡 <strong>Smart Feature:</strong> Vehicle number ({vehicle.licensePlate}) will be copied automatically - just paste it on PolicyBazar for instant quotes!
                        </div>
                        
                        {/* PolicyBazar Option */}
                        <Button
                          onClick={() => handlePolicyBazarClick(vehicle)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-between p-4 h-auto"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-bold text-xs">PB</span>
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">PolicyBazar</div>
                              <div className="text-xs opacity-90">Vehicle number copied • Compare 20+ insurers</div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4" />
                        </Button>

                        {/* Other Options */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={handleOtherInsuranceClick}
                            variant="outline"
                            className="flex items-center justify-center space-x-2 p-3 h-auto"
                          >
                            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-bold text-xs">A</span>
                            </div>
                            <span className="text-sm">Acko</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            onClick={() => window.open('https://www.bajajallianz.com/motor-insurance/car-insurance.html', '_blank')}
                            variant="outline"
                            className="flex items-center justify-center space-x-2 p-3 h-auto"
                          >
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-bold text-xs">BA</span>
                            </div>
                            <span className="text-sm">Bajaj</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Reminder to update */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex items-start space-x-2">
                            <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="text-sm">
                              <p className="text-blue-800 font-medium">Don't forget to update Myymotto!</p>
                              <p className="text-blue-600">After renewing, update your insurance details in the vehicle edit page.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Tips */}
        <Card className="shadow-lg shadow-orange-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Insurance Renewal Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Start renewal process 15-30 days before expiry</p>
              <p>• Compare quotes from multiple insurers</p>
              <p>• Check for No Claim Bonus discounts</p>
              <p>• Review coverage limits and add-ons</p>
              <p>• Keep all documents ready: RC, previous policy, etc.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}