import { useQuery, useMutation } from "@tanstack/react-query";
import { FileText, Search, Filter, ArrowLeft, CreditCard, Eye, Trash2, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";
import { type Vehicle, type Document, type UserProfile } from "@shared/schema";
import BottomNav from "@/components/bottom-nav";
import NotificationBell from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ColorfulLogo from "@/components/colorful-logo";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { localDocumentStorage, type LocalDocument } from "@/lib/local-storage";

function DriversLicenseCard({ profile, profileLoading }: { profile: UserProfile | undefined, profileLoading: boolean }) {
  const [, setLocation] = useLocation();

  if (profileLoading) {
    return (
      <Card className="shadow-orange">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base">
            <CreditCard className="w-5 h-5 mr-2" />
            Driver's License
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (!profile || (!profile.driversLicenseNumber && !profile.driversLicenseCopy)) {
    return (
      <Card className="shadow-orange">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base">
            <CreditCard className="w-5 h-5 mr-2" />
            Driver's License
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">No driver's license uploaded</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation("/profile")}
            >
              Upload License
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-orange">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Driver's License
          </div>
          <Badge variant="outline" className="text-xs">
            Personal Document
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* License Number and Valid Till */}
          <div className="grid grid-cols-2 gap-4">
            {profile.driversLicenseNumber && (
              <div>
                <p className="text-xs text-muted-foreground">License Number</p>
                <p className="text-sm font-medium">{profile.driversLicenseNumber}</p>
              </div>
            )}
            {profile.driversLicenseValidTill && (
              <div>
                <p className="text-xs text-muted-foreground">Valid Till</p>
                <p className="text-sm font-medium">{new Date(profile.driversLicenseValidTill).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* License Copy */}
          {profile.driversLicenseCopy && (
            <div className="border rounded p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">License Copy</p>
                    <p className="text-xs text-muted-foreground">Image file</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(profile.driversLicenseCopy, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Documents() {
  const [, setLocation] = useLocation();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Fetch user profile for driver's license
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile", 1], // Using user ID 1 as default
    queryFn: async () => {
      const response = await fetch("/api/profile/1");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
  });

  return (
    <>
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-red-50"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-14 h-14 rounded-lg"
              />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">Documents</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                <Filter className="w-5 h-5" />
              </Button>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-red-50"
                >
                  <Settings className="w-6 h-6" />
                </Button>
              </Link>
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        {vehiclesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Documents</h2>
            <p className="text-muted-foreground mb-4">Add vehicles to start uploading documents</p>
            <Link href="/add-vehicle">
              <Button>Add Vehicle</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Driver's License Document Card */}
            <DriversLicenseCard profile={profile} profileLoading={profileLoading} />
            
            {vehicles.map((vehicle) => (
              <VehicleDocumentCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>

      <BottomNav currentPath="/documents" />
    </>
  );
}

function VehicleDocumentCard({ vehicle }: { vehicle: Vehicle }) {
  const { toast } = useToast();
  const { data: documents = [], isLoading } = useQuery<LocalDocument[]>({
    queryKey: ["local-documents", vehicle.id],
    queryFn: () => localDocumentStorage.getDocumentsByVehicle(vehicle.id),
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      return localDocumentStorage.deleteDocument(docId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-documents", vehicle.id] });
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted from your device.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (docId: string, fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}" from your device? This action cannot be undone.`)) {
      deleteMutation.mutate(docId);
    }
  };

  return (
    <Card className="shadow-orange">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{vehicle.make} {vehicle.model}</span>
          <Badge variant="outline" className="text-xs">
            {vehicle.licensePlate}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">No documents uploaded</p>
            <Link href={`/vehicle/${vehicle.id}/upload`}>
              <Button variant="outline" size="sm">Upload Documents</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.slice(0, 3).map((doc) => (
              <div key={doc.id} className="flex items-center space-x-3 p-2 border rounded">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                  const url = localDocumentStorage.createObjectURL(doc);
                  const link = document.createElement('a');
                  link.href = url;
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}>
                  <p className="text-sm font-medium truncate">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">{doc.type}</p>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => {
                      const url = localDocumentStorage.createObjectURL(doc);
                      const link = document.createElement('a');
                      link.href = url;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
                    onClick={() => handleDelete(doc.id, doc.fileName)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {documents.length > 3 && (
              <Link href={`/vehicle/${vehicle.id}/local-documents`}>
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View all {documents.length} documents
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
