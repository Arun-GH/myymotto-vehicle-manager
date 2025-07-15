import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, FileText, Calendar, Eye, Download, Folder } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { type Document, type Vehicle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

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
      <header className="gradient-warm text-white shadow-lg sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="bg-white/20 p-1 rounded-xl">
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-8 h-8 rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Myymotto</h1>
              <p className="text-xs text-white/80">
                {selectedDocument ? "Document Viewer" :
                 selectedCategory ? `${documentCategories.find(c => c.key === selectedCategory)?.label} Documents` :
                 "View Documents"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        {/* Vehicle Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {vehicle.thumbnailPath ? (
                <img 
                  src={vehicle.thumbnailPath} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-12 h-12 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-800">{vehicle.make} {vehicle.model}</h3>
                <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Selection View */}
        {!selectedCategory && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Document Category</h2>
            {documentCategories.map((category) => {
              const categoryDocuments = getDocumentsByCategory(category.key);
              const Icon = category.icon;
              
              return (
                <Card 
                  key={category.key} 
                  className="card-hover shadow-lg cursor-pointer"
                  onClick={() => setSelectedCategory(category.key)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center shadow-md`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{category.label}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
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
              <h2 className="text-lg font-semibold text-gray-800">
                {documentCategories.find(c => c.key === selectedCategory)?.label} Documents
              </h2>
              <Badge variant="outline">
                {getDocumentsByCategory(selectedCategory).length} files
              </Badge>
            </div>

            {documentsLoading ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Loading documents...</p>
              </div>
            ) : getDocumentsByCategory(selectedCategory).length === 0 ? (
              <Card className="p-8 text-center">
                <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Documents Found</h3>
                <p className="text-gray-600 mb-4">
                  No {documentCategories.find(c => c.key === selectedCategory)?.label.toLowerCase()} documents have been uploaded yet.
                </p>
                <Button onClick={() => setLocation(`/vehicle/${vehicleId}/upload`)}>
                  Upload Documents
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {getDocumentsByCategory(selectedCategory)
                  .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                  .map((document) => (
                    <Card key={document.id} className="card-hover shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 truncate">{document.fileName}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDocument(document)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
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