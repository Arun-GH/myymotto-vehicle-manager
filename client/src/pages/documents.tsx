import { useQuery } from "@tanstack/react-query";
import { FileText, Search, Filter } from "lucide-react";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";
import { type Vehicle, type Document } from "@shared/schema";
import BottomNav from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Documents() {
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  return (
    <>
      {/* Header */}
      <header className="gradient-warm text-white shadow-lg sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-1 rounded-xl">
                <img 
                  src={logoImage} 
                  alt="Myymotto Logo" 
                  className="w-8 h-8 rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Myymotto</h1>
                <p className="text-xs text-white/80">Documents</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Filter className="w-5 h-5" />
              </Button>
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
            <Button>Add Vehicle</Button>
          </div>
        ) : (
          <div className="space-y-4">
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
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/vehicles", vehicle.id, "documents"],
  });

  return (
    <Card>
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
            <Button variant="outline" size="sm">Upload Documents</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.slice(0, 3).map((doc) => (
              <div key={doc.id} className="flex items-center space-x-3 p-2 border rounded">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">{doc.type}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">View</Button>
              </div>
            ))}
            {documents.length > 3 && (
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all {documents.length} documents
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
