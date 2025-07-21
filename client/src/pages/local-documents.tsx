import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, Eye, Trash2, Download, HardDrive, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { localDocumentStorage, type LocalDocument } from "@/lib/local-storage";
import { apiRequest } from "@/lib/queryClient";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function LocalDocuments() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const vehicleId = parseInt(params.id || "0");
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0 });

  // Fetch vehicle data
  const { data: vehicle, isLoading: vehicleLoading } = useQuery({
    queryKey: ["/api/vehicles", vehicleId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles/${vehicleId}`);
      return response.json();
    },
    enabled: !!vehicleId,
  });

  const documentTypes = {
    emission: { label: "Emission Certificates", color: "bg-green-500" },
    insurance: { label: "Insurance Documents", color: "bg-blue-500" },
    service: { label: "Service Invoices", color: "bg-orange-500" },
    rc: { label: "RC Book Copies", color: "bg-purple-500" },
  };

  useEffect(() => {
    loadDocuments();
    loadStorageInfo();
  }, [vehicleId]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await localDocumentStorage.getDocumentsByVehicle(vehicleId);
      setDocuments(docs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load documents from local storage",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    const info = await localDocumentStorage.getStorageInfo();
    setStorageInfo(info);
  };

  const handleViewDocument = (document: LocalDocument) => {
    const url = localDocumentStorage.createObjectURL(document);
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (document: LocalDocument) => {
    localDocumentStorage.downloadDocument(document);
  };

  const handleDeleteDocument = async (document: LocalDocument) => {
    try {
      await localDocumentStorage.deleteDocument(document.id);
      setDocuments(docs => docs.filter(doc => doc.id !== document.id));
      toast({
        title: "Document Deleted",
        description: "Document removed from local storage",
      });
      loadStorageInfo(); // Refresh storage info
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, LocalDocument[]>);

  if (isLoading || vehicleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading vehicle documents...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Vehicle not found</p>
          <Button className="mt-4" onClick={() => setLocation("/")}>
            Go Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="header-gradient-border sticky top-0 z-10 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/")}
            className="text-gray-600 hover:bg-red-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <img 
              src={logoImage} 
              alt="Myymotto Logo" 
              className="w-14 h-14 rounded-lg"
            />
            <div>
              <ColorfulLogo />
              <p className="text-sm text-red-600">Vehicle Documents</p>
            </div>
          </div>
          
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 pb-20 bg-warm-pattern">
        {/* Vehicle Info */}
        <Card className="mb-4 shadow-orange border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              {vehicle.thumbnailPath ? (
                <img 
                  src={vehicle.thumbnailPath} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-10 h-10 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                  <Car className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-800 text-sm">{vehicle.make?.toUpperCase()} {vehicle.model} ({vehicle.year})</h3>
                <p className="text-xs text-gray-600">{vehicle.licensePlate}</p>
                <div className="text-xs text-blue-600 mt-1">
                  <FileText className="w-3 h-3 inline mr-1" />
                  {documents.length} document{documents.length !== 1 ? 's' : ''} stored locally
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card className="mb-4 shadow-orange border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg py-3">
            <CardTitle className="flex items-center space-x-2 text-gray-800 text-base">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-green-600" />
              </div>
              <span>Device Storage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Documents for this vehicle:</span>
                <span className="font-medium text-blue-600">{documents.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Storage used:</span>
                <span className="font-medium">{formatFileSize(storageInfo.used)}</span>
              </div>
              <div className="text-xs text-green-600 mt-2 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Documents secured on your device
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents by Type */}
        {Object.keys(groupedDocuments).length === 0 ? (
          <Card className="card-hover shadow-orange border-l-4 border-l-orange-500">
            <CardContent className="text-center py-8">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Documents Stored</h3>
              <p className="text-muted-foreground mb-4">
                Upload documents for this vehicle to store them securely on your device
              </p>
              <Button 
                onClick={() => setLocation(`/vehicle/${vehicleId}/upload`)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Upload Documents
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedDocuments).map(([type, docs]) => (
            <Card key={type} className="card-hover shadow-orange border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <div className={`w-3 h-3 rounded-full ${documentTypes[type]?.color || 'bg-gray-500'}`} />
                  <span>{documentTypes[type]?.label || type}</span>
                  <Badge variant="secondary" className="ml-auto">{docs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {docs.map((document) => (
                  <div key={document.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{document.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(document.fileSize)} • {formatDate(document.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(document)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(document)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDocument(document)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}

        {/* Upload More Button */}
        <Button 
          onClick={() => setLocation(`/vehicle/${vehicleId}/upload`)}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          Upload More Documents
        </Button>
      </div>
    </div>
  );
}