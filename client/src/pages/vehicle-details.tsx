import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { ArrowLeft, Calendar, FileText, Edit, Trash2 } from "lucide-react";
import { type Vehicle, type Document } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function VehicleDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const vehicleId = parseInt(id || "0");

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", vehicleId],
    enabled: !!vehicleId,
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/vehicles", vehicleId, "documents"],
    enabled: !!vehicleId,
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/vehicles/${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Vehicle Deleted",
        description: "The vehicle has been successfully deleted.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

  if (vehicleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-xl"></div>
            <div className="h-20 bg-muted rounded-xl"></div>
            <div className="h-40 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
          <p className="text-muted-foreground mb-4">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  const getExpiryStatus = (date: string | null) => {
    if (!date) return { status: "unknown", text: "Not set", color: "secondary" };
    
    const expiryDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: "expired", text: `Expired ${Math.abs(diffDays)} days ago`, color: "destructive" };
    } else if (diffDays <= 30) {
      return { status: "expiring", text: `Expires in ${diffDays} days`, color: "warning" };
    } else {
      return { status: "valid", text: formatDistanceToNow(expiryDate), color: "success" };
    }
  };

  const insuranceStatus = getExpiryStatus(vehicle.insuranceExpiry);
  const emissionStatus = getExpiryStatus(vehicle.emissionExpiry);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient-border border-4 border-red-500 shadow-lg relative z-10">
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
                <p className="text-sm text-red-600">Vehicle Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/vehicle/${vehicleId}/edit`}>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                  <Edit className="w-5 h-5" />
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this vehicle? This action cannot be undone and will also delete all associated documents.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteVehicleMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 space-y-6">
        {/* Vehicle Info Card */}
        <Card className="shadow-orange">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{vehicle.make} {vehicle.model}</span>
              <Badge variant="outline">{vehicle.year}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">License Plate</span>
                <p className="font-medium">{vehicle.licensePlate}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Color</span>
                <p className="font-medium">{vehicle.color}</p>
              </div>
              <div>
                <span className="text-muted-foreground">VIN</span>
                <p className="font-medium text-xs">{vehicle.vin}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Owner</span>
                <p className="font-medium">{vehicle.ownerName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expiry Status Card */}
        <Card className="shadow-orange">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Document Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Insurance</span>
                  <Badge 
                    variant={insuranceStatus.color === "destructive" ? "destructive" : 
                             insuranceStatus.color === "warning" ? "secondary" : "default"}
                    className={
                      insuranceStatus.color === "success" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
                      insuranceStatus.color === "warning" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" : ""
                    }
                  >
                    {insuranceStatus.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{insuranceStatus.text}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Emission</span>
                  <Badge 
                    variant={emissionStatus.color === "destructive" ? "destructive" : 
                             emissionStatus.color === "warning" ? "secondary" : "default"}
                    className={
                      emissionStatus.color === "success" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
                      emissionStatus.color === "warning" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" : ""
                    }
                  >
                    {emissionStatus.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{emissionStatus.text}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card className="shadow-orange">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Documents</span>
              </div>
              <Badge variant="outline">{documents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No documents uploaded</p>
                <Link href={`/vehicle/${vehicleId}/upload`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    Upload Documents
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type} • {Math.round(doc.fileSize / 1024)} KB
                      </p>
                    </div>
                    <Link href={`/vehicle/${vehicleId}/documents`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Actions Card */}
        <Card className="shadow-orange">
          <CardHeader>
            <CardTitle className="text-base">Vehicle Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/vehicle/${vehicleId}/edit`}>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="w-4 h-4 mr-2" />
                Edit Vehicle Details
              </Button>
            </Link>
            <Link href={`/vehicle/${vehicleId}/upload`}>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Vehicle (Sold)
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Vehicle</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove this vehicle from your account? This is typically done when the vehicle has been sold. This action cannot be undone and will also delete all associated documents and notifications.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteVehicleMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteVehicleMutation.isPending}
                  >
                    {deleteVehicleMutation.isPending ? "Removing..." : "Remove Vehicle"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
