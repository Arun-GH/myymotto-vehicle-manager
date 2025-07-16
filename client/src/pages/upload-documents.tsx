import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Upload, Camera, FileText, Calendar, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CameraCapture from "@/components/camera-capture";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

type DocumentType = "emission" | "insurance" | "service" | "rc";

interface DocumentUpload {
  type: DocumentType;
  file: File;
  expiryDate?: string;
}

export default function UploadDocuments() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const vehicleId = parseInt(params.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedType, setSelectedType] = useState<DocumentType>("emission");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch vehicle data
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["/api/vehicles", vehicleId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles/${vehicleId}`);
      return response.json();
    },
    enabled: !!vehicleId,
  });

  const documentTypes = [
    { value: "emission" as DocumentType, label: "Emission Certificate", icon: FileText, requiresExpiry: true },
    { value: "insurance" as DocumentType, label: "Insurance Copy", icon: FileText, requiresExpiry: true },
    { value: "service" as DocumentType, label: "Service Invoice", icon: FileText, requiresExpiry: false },
    { value: "rc" as DocumentType, label: "RC Book Copy", icon: FileText, requiresExpiry: true },
  ];

  const selectedDocumentType = documentTypes.find(type => type.value === selectedType);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleCameraCapture = (file: File) => {
    setSelectedFiles(prev => [...prev, file]);
    setShowCamera(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = useMutation({
    mutationFn: async () => {
      if (selectedFiles.length === 0) {
        throw new Error("Please select at least one file to upload");
      }

      const uploadedDocuments = [];

      for (const file of selectedFiles) {
        // Upload file
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", selectedType);
        
        const uploadResponse = await apiRequest("POST", "/api/upload", formData);
        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.message || "Failed to upload file");
        }
        const uploadResult = await uploadResponse.json();

        // Create document record
        const documentData = {
          vehicleId,
          type: selectedType,
          fileName: uploadResult.fileName,
          filePath: uploadResult.filePath,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
          expiryDate: expiryDate || null,
        };

        const documentResponse = await apiRequest("POST", "/api/documents", documentData);
        if (!documentResponse.ok) {
          const error = await documentResponse.json();
          throw new Error(error.message || "Failed to create document record");
        }
        const document = await documentResponse.json();
        uploadedDocuments.push(document);
      }

      return uploadedDocuments;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", vehicleId, "documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Documents Uploaded",
        description: `Successfully uploaded ${selectedFiles.length} ${selectedDocumentType?.label.toLowerCase()} document(s).`,
      });
      
      // Reset form
      setSelectedFiles([]);
      setExpiryDate("");
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload documents",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    uploadDocuments.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
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
                <p className="text-sm text-red-600">Upload Documents</p>
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

        {/* Document Upload Form */}
        <Card className="card-hover shadow-orange border-l-4 border-l-orange-500">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg py-3">
            <CardTitle className="flex items-center space-x-2 text-gray-800 text-base">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Upload className="w-4 h-4 text-orange-600" />
              </div>
              <span>Upload Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="document-type" className="text-sm font-medium">Document Type</Label>
              <Select value={selectedType} onValueChange={(value: DocumentType) => setSelectedType(value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Date (if required) */}
            {selectedDocumentType?.requiresExpiry && (
              <div className="space-y-2">
                <Label htmlFor="expiry-date" className="text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Expiry Date</span>
                  </div>
                </Label>
                <Input
                  id="expiry-date"
                  type="date"
                  className="h-9"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="Select expiry date"
                />
              </div>
            )}

            {/* File Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Upload Files</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="h-9 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCamera(true)}
                  className="h-9 flex items-center justify-center"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
              </div>
              
              <p className="text-xs text-gray-500">
                Supported: JPEG, PNG, WebP, PDF • Max: 10MB per file
              </p>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Files ({selectedFiles.length})</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-orange-50 border border-orange-100 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                          <FileText className="w-3 h-3 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 h-6 w-6 p-0 shrink-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Button 
                type="button" 
                variant="outline"
                className="flex-1 h-9"
                onClick={() => setLocation("/")}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploadDocuments.isPending}
                className="flex-1 h-9 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {uploadDocuments.isPending ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Upload {selectedFiles.length || ''} {selectedFiles.length === 1 ? 'File' : 'Files'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}