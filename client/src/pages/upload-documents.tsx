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
      setLocation(`/vehicle/${vehicleId}`);
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
      <header className="gradient-warm text-white shadow-lg sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setLocation(`/vehicle/${vehicleId}`)}
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
              <p className="text-xs text-white/80">Upload Documents</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        {/* Vehicle Info */}
        <Card className="mb-4 shadow-orange">
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

        {/* Document Upload Form */}
        <Card className="card-hover shadow-orange">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Upload className="w-5 h-5 text-red-600" />
              <span>Upload Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={selectedType} onValueChange={(value: DocumentType) => setSelectedType(value)}>
                <SelectTrigger>
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
                <Label htmlFor="expiry-date">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Expiry Date</span>
                  </div>
                </Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="Select expiry date"
                />
              </div>
            )}

            {/* File Upload Section */}
            <div className="space-y-4">
              <Label>Upload Files</Label>
              
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCamera(true)}
                  className="shrink-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, WebP, PDF. Max size: 10MB per file.
              </p>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({selectedFiles.length})</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-48">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline"
                className="flex-1"
                onClick={() => setLocation(`/vehicle/${vehicleId}`)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploadDocuments.isPending}
                className="flex-1"
              >
                {uploadDocuments.isPending ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Upload {selectedFiles.length} Document{selectedFiles.length !== 1 ? 's' : ''}
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