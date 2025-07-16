import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, FileText, Calendar, Eye, Download, Folder } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { type Document, type Vehicle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ColorfulLogo from "@/components/colorful-logo";

type DocumentCategory = "all" | "insurance" | "emission" | "service" | "rc";

interface DocumentCategoryInfo {
  key: DocumentCategory;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const documentCategories: DocumentCategoryInfo[] = [
  {
    key: "insurance",
    label: "Insurance",
    description: "Insurance policy documents and certificates",
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    key: "emission",
    label: "Emission",
    description: "Pollution control certificates",
    icon: FileText,
    color: "bg-green-500",
  },
  {
    key: "service",
    label: "Service Logs",
    description: "Service invoices and maintenance records",
    icon: FileText,
    color: "bg-orange-500",
  },
  {
    key: "rc",
    label: "RC Book",
    description: "Registration certificate copies",
    icon: FileText,
    color: "bg-purple-500",
  },
];

export default function ViewDocuments() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const vehicleId = parseInt(params.id || "0");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Fetch vehicle data
  const { data: vehicle, isLoading: vehicleLoading } = useQuery({
    queryKey: ["/api/vehicles", vehicleId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles/${vehicleId}`);
      return response.json() as Promise<Vehicle>;
    },
    enabled: !!vehicleId,
  });

  // Fetch documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/vehicles", vehicleId, "documents"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles/${vehicleId}/documents`);
      return response.json() as Promise<Document[]>;
    },
    enabled: !!vehicleId,
  });

  const getDocumentsByCategory = (category: DocumentCategory): Document[] => {
    if (category === "all") return documents;
    return documents.filter(doc => doc.type === category);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openDocument = (document: Document) => {
    // Open the document in a new tab/window
    window.open(document.filePath, '_blank');
  };

  const handleBack = () => {
    if (selectedDocument) {
      setSelectedDocument(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      setLocation(`/vehicle/${vehicleId}`);
    }
  };

  if (vehicleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
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
      <header className="bg-white border-t-4 border-b-4 border-orange-400 shadow-lg sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-red-50"
                onClick={handleBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-14 h-14 bg-white rounded-lg shadow-md flex items-center justify-center">
                <img 
                  src="/attached_assets/Mymotto_Logo_Green_Revised_1752603344750.png" 
                  alt="Myymotto Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <ColorfulLogo className="text-lg font-bold" />
                <p className="text-sm text-red-600 font-medium">
                  {selectedDocument ? "Document Viewer" :
                   selectedCategory ? `${documentCategories.find(c => c.key === selectedCategory)?.label} Documents` :
                   "View Documents"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                  <FileText className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-800 text-sm">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                <p className="text-xs text-gray-600">{vehicle.licensePlate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Selection View */}
        {!selectedCategory && (
          <div className="space-y-3">
            <h2 className="text-base font-medium text-gray-800 mb-3">Select Document Category</h2>
            {documentCategories.map((category) => {
              const categoryDocuments = getDocumentsByCategory(category.key);
              const Icon = category.icon;
              
              return (
                <Card 
                  key={category.key} 
                  className="card-hover shadow-orange cursor-pointer border-l-4 border-l-gray-300 hover:border-l-orange-400"
                  onClick={() => setSelectedCategory(category.key)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center shadow-md`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 text-sm">{category.label}</h3>
                          <p className="text-xs text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {categoryDocuments.length} files
                        </Badge>
                        <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Document List View */}
        {selectedCategory && !selectedDocument && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-gray-800">
                {documentCategories.find(c => c.key === selectedCategory)?.label} Documents
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 text-xs"
                onClick={() => setSelectedCategory(null)}
              >
                Back to Categories
              </Button>
            </div>

            {documentsLoading ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Loading documents...</p>
              </div>
            ) : getDocumentsByCategory(selectedCategory).length === 0 ? (
              <Card className="shadow-orange border-l-4 border-l-gray-300">
                <CardContent className="p-6 text-center">
                  <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">No Documents Found</h3>
                  <p className="text-gray-600 mb-3 text-xs">
                    No {documentCategories.find(c => c.key === selectedCategory)?.label.toLowerCase()} documents have been uploaded yet.
                  </p>
                  <Button 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => setLocation(`/vehicle/${vehicleId}/upload`)}
                  >
                    Upload Documents
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {getDocumentsByCategory(selectedCategory)
                  .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                  .map((document) => (
                    <Card key={document.id} className="card-hover shadow-orange border-l-4 border-l-gray-300 hover:border-l-orange-400">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 truncate text-sm">{document.fileName}</h4>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span>{formatFileSize(document.fileSize)}</span>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {new Date(document.uploadedAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2"
                              onClick={() => openDocument(document)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}