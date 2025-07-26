import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { ArrowLeft, Upload, Camera, FileText, Calendar, CheckCircle, Bell, Settings, Scan, DollarSign, File, Edit2 } from "lucide-react";
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
import { localDocumentStorage, type LocalDocument } from "@/lib/local-storage";
import { OCRInsuranceScanner } from "@/components/ocr-insurance-scanner";
import { type InsurancePolicyData } from "@/lib/ocr-utils";
import { formatForDatabase } from "@/lib/date-format";

type DocumentType = "emission" | "insurance" | "rc" | "fuel" | "miscellaneous" | "road_tax" | "travel_permits" | "fitness_certificate" | "fast_tag_renewals";

interface DocumentUpload {
  type: DocumentType;
  file: File;
  expiryDate?: string;
}

interface FileWithCustomName extends File {
  customName?: string;
}

interface FilePreviewCardProps {
  file: FileWithCustomName;
  index: number;
  onRename: (newName: string) => void;
  onRemove: () => void;
}

function FilePreviewCard({ file, onRename, onRemove }: FilePreviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const displayName = file.customName || file.name;
  const [fileName, setFileName] = useState(() => {
    const name = displayName;
    const lastDotIndex = name.lastIndexOf('.');
    return lastDotIndex > 0 ? name.substring(0, lastDotIndex) : name;
  });

  const handleSave = () => {
    if (fileName.trim()) {
      onRename(fileName.trim());
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      // Reset to original name
      const name = file.name;
      const lastDotIndex = name.lastIndexOf('.');
      setFileName(lastDotIndex > 0 ? name.substring(0, lastDotIndex) : name);
    }
  };

  return (
    <div className="flex items-center justify-between p-1.5 bg-orange-50 border border-orange-100 rounded-lg">
      <div className="flex items-center space-x-1.5 flex-1 min-w-0">
        <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center shrink-0">
          <FileText className="w-2.5 h-2.5 text-orange-600" />
        </div>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
              className="h-6 text-xs font-medium p-1 border-orange-200 focus:border-orange-400"
              autoFocus
            />
          ) : (
            <p className="text-xs font-medium truncate cursor-pointer" onClick={() => setIsEditing(true)}>
              {displayName}
            </p>
          )}
          <p className="text-[10px] text-gray-500">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 shrink-0">
        {!isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 h-5 w-5 p-0"
            title="Rename file"
          >
            <Edit2 className="w-2.5 h-2.5" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 h-5 w-5 p-0"
          title="Remove file"
        >
          ×
        </Button>
      </div>
    </div>
  );
}

export default function UploadDocuments() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const vehicleId = parseInt(params.id || "0");
  
  // Check for edit mode from URL query parameter
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editType = urlParams.get('edit');
    if (editType && localDocumentStorage.isUniqueDocumentType(editType)) {
      setSelectedType(editType as DocumentType);
      setIsEditMode(true);
    }
  }, []);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedType, setSelectedType] = useState<DocumentType>("emission");
  const [selectedFiles, setSelectedFiles] = useState<FileWithCustomName[]>([]);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [documentName, setDocumentName] = useState<string>("");
  const [billAmount, setBillAmount] = useState<string>("");
  const [taxAmount, setTaxAmount] = useState<string>("");
  const [permitFee, setPermitFee] = useState<string>("");
  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState<string>("");
  const [sumInsured, setSumInsured] = useState<string>("");
  const [insurancePremium, setInsurancePremium] = useState<string>("");
  const [insuranceProvider, setInsuranceProvider] = useState<string>("");

  const [showCamera, setShowCamera] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrData, setOcrData] = useState<InsurancePolicyData | null>(null);
  const [existingDocument, setExistingDocument] = useState<LocalDocument | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch vehicle data
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["/api/vehicles", vehicleId],
    queryFn: async () => {
      const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";
      const response = await apiRequest("GET", `/api/vehicles/${vehicleId}?userId=${currentUserId}`);
      return response.json();
    },
    enabled: !!vehicleId,
  });

  // Check for existing document when type changes
  const checkExistingDocument = async (type: DocumentType) => {
    if (localDocumentStorage.isUniqueDocumentType(type)) {
      const existing = await localDocumentStorage.getExistingDocumentByType(vehicleId, type);
      setExistingDocument(existing || null);
      
      // Pre-populate form with existing data if in edit mode
      if (existing && existing.metadata) {
        setExpiryDate(existing.metadata.expiryDate || "");
        setDocumentName(existing.metadata.documentName || "");
        setBillAmount(existing.metadata.billAmount?.toString() || "");
        setTaxAmount(existing.metadata.taxAmount?.toString() || "");
        setPermitFee(existing.metadata.permitFee?.toString() || "");
        setRechargeAmount(existing.metadata.rechargeAmount?.toString() || "");
        setInsuranceExpiryDate(existing.metadata.insuranceExpiryDate || "");
        setSumInsured(existing.metadata.sumInsured?.toString() || "");
        setInsurancePremium(existing.metadata.insurancePremium?.toString() || "");
        setInsuranceProvider(existing.metadata.insuranceProvider || "");
      }
    } else {
      setExistingDocument(null);
    }
  };

  // Check for existing document when component mounts or type changes
  React.useEffect(() => {
    if (vehicleId && selectedType) {
      checkExistingDocument(selectedType);
    }
  }, [vehicleId, selectedType]);

  const documentTypes = [
    { value: "emission" as DocumentType, label: "Emission Certificate", icon: FileText, requiresExpiry: true },
    { value: "insurance" as DocumentType, label: "Insurance Copy", icon: FileText, requiresExpiry: true },
    { value: "rc" as DocumentType, label: "RC Book Copy", icon: FileText, requiresExpiry: true },
    { value: "fuel" as DocumentType, label: "Fuel Bills", icon: DollarSign, requiresExpiry: false },
    { value: "road_tax" as DocumentType, label: "Road Tax", icon: FileText, requiresExpiry: true },
    { value: "travel_permits" as DocumentType, label: "Travel Permits", icon: FileText, requiresExpiry: true },
    { value: "fitness_certificate" as DocumentType, label: "Fitness Certificate", icon: FileText, requiresExpiry: true },
    { value: "fast_tag_renewals" as DocumentType, label: "Fast Tag Renewals", icon: FileText, requiresExpiry: true },
    { value: "miscellaneous" as DocumentType, label: "Miscellaneous", icon: File, requiresExpiry: false },
  ];

  const selectedDocumentType = documentTypes.find(type => type.value === selectedType);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };



  const handleOCRDataExtracted = async (data: InsurancePolicyData) => {
    setOcrData(data);
    
    // Auto-fill form fields with OCR data if available
    if (data.expiryDate) {
      setExpiryDate(data.expiryDate);
    }
    
    // Update vehicle with OCR data via API
    try {
      const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";
      await apiRequest("PUT", `/api/vehicles/${vehicleId}/ocr-data?userId=${currentUserId}`, {
        ocrPolicyNumber: data.policyNumber,
        ocrSumInsured: data.sumInsured,
        ocrPremiumAmount: data.premiumAmount,
        ocrInsuredName: data.insuredName,
      });
      
      toast({
        title: "Insurance Data Extracted",
        description: "Policy information has been automatically extracted and saved.",
      });
    } catch (error) {
      console.error('Failed to save OCR data:', error);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renameFile = (index: number, newName: string) => {
    setSelectedFiles(prev => prev.map((file, i) => {
      if (i === index) {
        const extension = file.name.split('.').pop() || '';
        const finalName = newName.endsWith(`.${extension}`) ? newName : `${newName}.${extension}`;
        
        // Add customName property to track the renamed file
        const fileWithCustomName = file as FileWithCustomName;
        fileWithCustomName.customName = finalName;
        return fileWithCustomName;
      }
      return file;
    }));
  };

  const uploadDocuments = useMutation({
    mutationFn: async () => {
      // Fast Tag Renewals and Insurance copy allow optional file upload
      if (selectedFiles.length === 0 && selectedType !== "fast_tag_renewals" && selectedType !== "insurance") {
        throw new Error("Please select at least one file to upload");
      }

      const uploadedDocuments = [];

      // Store documents locally on device instead of server upload
      // For Fast Tag Renewals and Insurance, create a metadata-only entry if no files selected
      if (selectedFiles.length === 0 && (selectedType === "fast_tag_renewals" || selectedType === "insurance")) {
        const metadata: { 
          expiryDate?: string; 
          rechargeAmount?: number;
          insuranceExpiryDate?: string;
          sumInsured?: number;
          insurancePremium?: number;
          insuranceProvider?: string;
        } = {};
        
        if (selectedType === "fast_tag_renewals") {
          if (expiryDate) metadata.expiryDate = expiryDate;
          if (rechargeAmount) metadata.rechargeAmount = parseFloat(rechargeAmount);
        } else if (selectedType === "insurance") {
          if (insuranceExpiryDate) metadata.insuranceExpiryDate = insuranceExpiryDate;
          if (sumInsured) metadata.sumInsured = parseFloat(sumInsured);
          if (insurancePremium) metadata.insurancePremium = parseFloat(insurancePremium);
          if (insuranceProvider) metadata.insuranceProvider = insuranceProvider;
        }
        
        // Create a dummy document entry for metadata storage
        const localDoc = await localDocumentStorage.storeOrReplaceDocument(
          vehicleId, 
          selectedType, 
          null, // No file
          metadata, 
          selectedType === "fast_tag_renewals" 
            ? `Fast Tag Recharge - ${new Date().toLocaleDateString()}`
            : `Insurance Details - ${new Date().toLocaleDateString()}`
        );
        uploadedDocuments.push(localDoc);
      }
      
      for (const file of selectedFiles) {
        const metadata: { 
          billDate?: string; 
          documentName?: string; 
          expiryDate?: string; 
          billAmount?: number;
          taxAmount?: number;
          permitFee?: number;
          rechargeAmount?: number;
          insuranceExpiryDate?: string;
          sumInsured?: number;
          insurancePremium?: number;
          insuranceProvider?: string;
        } = {};
        
        // Add metadata based on document type
        if (selectedType === "fuel" && expiryDate) {
          metadata.billDate = expiryDate;
          if (billAmount) {
            metadata.billAmount = parseFloat(billAmount);
          }
        } else if (selectedType === "road_tax") {
          if (expiryDate) metadata.expiryDate = expiryDate;
          if (taxAmount) metadata.taxAmount = parseFloat(taxAmount);
        } else if (selectedType === "travel_permits") {
          if (expiryDate) metadata.expiryDate = expiryDate;
          if (permitFee) metadata.permitFee = parseFloat(permitFee);
        } else if (selectedType === "fast_tag_renewals") {
          if (expiryDate) metadata.expiryDate = expiryDate;
          if (rechargeAmount) metadata.rechargeAmount = parseFloat(rechargeAmount);
        } else if (selectedType === "insurance") {
          if (insuranceExpiryDate) metadata.insuranceExpiryDate = insuranceExpiryDate;
          if (sumInsured) metadata.sumInsured = parseFloat(sumInsured);
          if (insurancePremium) metadata.insurancePremium = parseFloat(insurancePremium);
          if (insuranceProvider) metadata.insuranceProvider = insuranceProvider;
        } else if (selectedType === "miscellaneous" && documentName) {
          metadata.documentName = documentName;
        } else if (selectedDocumentType?.requiresExpiry && expiryDate) {
          metadata.expiryDate = expiryDate;
        }
        
        // Use the file as-is, but we'll override the name in storage
        let fileToStore = file;
        const customName = (file as FileWithCustomName).customName;
        
        // Use storeOrReplaceDocument for unique document types in edit mode
        let localDoc;
        if (isEditMode && existingDocument && localDocumentStorage.isUniqueDocumentType(selectedType)) {
          localDoc = await localDocumentStorage.updateDocument(existingDocument.id, fileToStore, metadata, customName);
        } else {
          localDoc = await localDocumentStorage.storeOrReplaceDocument(vehicleId, selectedType, fileToStore, metadata, customName);
        }
        uploadedDocuments.push(localDoc);
      }



      return uploadedDocuments;
    },
    onSuccess: async () => {
      // Invalidate local document queries 
      queryClient.invalidateQueries({ queryKey: ["local-documents", vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      const actionText = isEditMode && existingDocument ? "updated" : "saved";
      const countText = selectedFiles.length === 0 && selectedType === "fast_tag_renewals" ? "metadata entry" : `${selectedFiles.length} document(s)`;
      
      toast({
        title: `Document${selectedFiles.length === 1 ? '' : 's'} ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
        description: `Successfully ${actionText} ${countText} on your device.`,
      });
      
      // Reset form and exit edit mode
      setSelectedFiles([]);
      setExpiryDate("");
      setDocumentName("");
      setBillAmount("");
      setTaxAmount("");
      setPermitFee("");
      setRechargeAmount("");
      setIsEditMode(false);
      
      // Refresh existing document data
      await checkExistingDocument(selectedType);
      
      setLocation(`/vehicle/${vehicleId}/local-documents`);
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save documents locally",
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
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-red-50 h-8 w-8"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <div>
                <div className="text-sm font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Upload Documents</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50 h-8 w-8">
                <Bell className="w-4 h-4" />
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50 h-8 w-8">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="p-2 pb-20 bg-warm-pattern">
        {/* Vehicle Info */}
        <Card className="mb-2 shadow-orange border-l-4 border-l-blue-500">
          <CardContent className="p-2">
            <div className="flex items-center space-x-2">
              {vehicle.thumbnailPath ? (
                <img 
                  src={vehicle.thumbnailPath} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-8 h-8 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                  <FileText className="w-4 h-4 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-800 text-xs">{vehicle.make?.toUpperCase()} {vehicle.model} ({vehicle.year})</h3>
                <p className="text-[10px] text-gray-600">{vehicle.licensePlate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Document Display for Unique Types */}
        {existingDocument && localDocumentStorage.isUniqueDocumentType(selectedType) && (
          <Card className="card-hover shadow-blue border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg py-1.5">
              <CardTitle className="flex items-center justify-between text-gray-800 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-3 h-3 text-blue-600" />
                  </div>
                  <span>Existing {selectedDocumentType?.label}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="text-blue-600 hover:text-blue-700 h-6 text-xs px-2"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  {isEditMode ? "Cancel Edit" : "Edit"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-blue-800">{existingDocument.fileName}</p>
                  <span className="text-[10px] text-blue-600">
                    {(existingDocument.fileSize / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                {existingDocument.metadata && (
                  <div className="text-[10px] text-blue-700 space-y-0.5">
                    {existingDocument.metadata.expiryDate && (
                      <p>Expiry: {new Date(existingDocument.metadata.expiryDate).toLocaleDateString()}</p>
                    )}
                    {existingDocument.metadata.insuranceProvider && (
                      <p>Provider: {existingDocument.metadata.insuranceProvider}</p>
                    )}
                    {existingDocument.metadata.insuranceExpiryDate && (
                      <p>Insurance Expiry: {new Date(existingDocument.metadata.insuranceExpiryDate).toLocaleDateString()}</p>
                    )}
                    {existingDocument.metadata.sumInsured && (
                      <p>Sum Insured: ₹{existingDocument.metadata.sumInsured.toLocaleString()}</p>
                    )}
                    {existingDocument.metadata.insurancePremium && (
                      <p>Premium: ₹{existingDocument.metadata.insurancePremium.toLocaleString()}</p>
                    )}
                    {existingDocument.metadata.taxAmount && (
                      <p>Tax Amount: ₹{existingDocument.metadata.taxAmount.toLocaleString()}</p>
                    )}
                    {existingDocument.metadata.permitFee && (
                      <p>Permit Fee: ₹{existingDocument.metadata.permitFee.toLocaleString()}</p>
                    )}
                  </div>
                )}
                <p className="text-[9px] text-blue-600 mt-1">
                  Uploaded: {new Date(existingDocument.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              {!isEditMode && (
                <p className="text-xs text-blue-700 mt-2 text-center">
                  Only one {selectedDocumentType?.label} allowed per vehicle. Click Edit to update.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Document Upload Form - Show if not unique type OR no existing document OR in edit mode */}
        {(!localDocumentStorage.isUniqueDocumentType(selectedType) || !existingDocument || isEditMode) && (
          <Card className="card-hover shadow-orange border-l-4 border-l-orange-500">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg py-1.5">
            <CardTitle className="flex items-center space-x-2 text-gray-800 text-xs">
              <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                <Upload className="w-3 h-3 text-orange-600" />
              </div>
              <span>
                {isEditMode && existingDocument ? `Update ${selectedDocumentType?.label}` : 'Upload Documents'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-2">
            
            {/* Document Type Selection */}
            <div className="space-y-1">
              <Label htmlFor="document-type" className="text-xs font-medium">Document Type</Label>
              <Select value={selectedType} onValueChange={(value: DocumentType) => {
                setSelectedType(value);
                setIsEditMode(false);
                // Reset form fields when document type changes
                setExpiryDate("");
                setDocumentName("");
                setBillAmount("");
                setTaxAmount("");
                setPermitFee("");
                setRechargeAmount("");
                setInsuranceExpiryDate("");
                setSumInsured("");
                setInsurancePremium("");
                setInsuranceProvider("");
              }}>
                <SelectTrigger className="h-8">
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

            {/* Date Fields */}
            {selectedDocumentType?.requiresExpiry && selectedType !== "insurance" && (
              <div className="space-y-1">
                <Label htmlFor="expiry-date" className="text-xs font-medium">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {selectedType === "emission" ? "Emission certificate issue date" : "Expiry Date"}
                    </span>
                  </div>
                </Label>
                <Input
                  id="expiry-date"
                  type="date"
                  className="h-8"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  max={selectedType === "emission" ? new Date().toISOString().split('T')[0] : undefined}
                />
              </div>
            )}

            {/* Insurance-specific fields */}
            {selectedType === "insurance" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="insurance-provider" className="text-xs font-medium">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>Insurance Provider</span>
                    </div>
                  </Label>
                  <Select value={insuranceProvider} onValueChange={setInsuranceProvider}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select insurance provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HDFC ERGO">HDFC ERGO General Insurance</SelectItem>
                      <SelectItem value="ICICI Lombard">ICICI Lombard General Insurance</SelectItem>
                      <SelectItem value="Bajaj Allianz">Bajaj Allianz General Insurance</SelectItem>
                      <SelectItem value="New India Assurance">New India Assurance</SelectItem>
                      <SelectItem value="National Insurance">National Insurance Company</SelectItem>
                      <SelectItem value="Oriental Insurance">Oriental Insurance</SelectItem>
                      <SelectItem value="United India Insurance">United India Insurance</SelectItem>
                      <SelectItem value="TATA AIG">TATA AIG General Insurance</SelectItem>
                      <SelectItem value="Reliance General">Reliance General Insurance</SelectItem>
                      <SelectItem value="Royal Sundaram">Royal Sundaram General Insurance</SelectItem>
                      <SelectItem value="Future Generali">Future Generali India Insurance</SelectItem>
                      <SelectItem value="Kotak Mahindra">Kotak Mahindra General Insurance</SelectItem>
                      <SelectItem value="Bharti AXA">Bharti AXA General Insurance</SelectItem>
                      <SelectItem value="Cholamandalam MS">Cholamandalam MS General Insurance</SelectItem>
                      <SelectItem value="Liberty General">Liberty General Insurance</SelectItem>
                      <SelectItem value="SBI General">SBI General Insurance</SelectItem>
                      <SelectItem value="Digit Insurance">Digit General Insurance</SelectItem>
                      <SelectItem value="Go Digit">Go Digit General Insurance</SelectItem>
                      <SelectItem value="Acko General">ACKO General Insurance</SelectItem>
                      <SelectItem value="Magma HDI">Magma HDI General Insurance</SelectItem>
                      <SelectItem value="Universal Sompo">Universal Sompo General Insurance</SelectItem>
                      <SelectItem value="Iffco Tokio">IFFCO Tokio General Insurance</SelectItem>
                      <SelectItem value="Shriram General">Shriram General Insurance</SelectItem>
                      <SelectItem value="Raheja QBE">Raheja QBE General Insurance</SelectItem>
                      <SelectItem value="L&T General">L&T General Insurance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="insurance-expiry-date" className="text-xs font-medium">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Insurance Expiry Date</span>
                    </div>
                  </Label>
                  <Input
                    id="insurance-expiry-date"
                    type="date"
                    className="h-8"
                    value={insuranceExpiryDate}
                    onChange={(e) => setInsuranceExpiryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sum-insured" className="text-xs font-medium">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span>Sum Insured For (₹)</span>
                    </div>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">₹</span>
                    <Input
                      id="sum-insured"
                      type="number"
                      className="h-8 pl-8"
                      value={sumInsured}
                      onChange={(e) => setSumInsured(e.target.value)}
                      placeholder="Enter sum insured amount"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="insurance-premium" className="text-xs font-medium">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span>Insurance Premium (₹)</span>
                    </div>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">₹</span>
                    <Input
                      id="insurance-premium"
                      type="number"
                      className="h-8 pl-8"
                      value={insurancePremium}
                      onChange={(e) => setInsurancePremium(e.target.value)}
                      placeholder="Enter premium amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Bill Date and Amount for Fuel Bills */}
            {selectedType === "fuel" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="bill-date" className="text-xs font-medium">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Bill Date</span>
                    </div>
                  </Label>
                  <Input
                    id="bill-date"
                    type="date"
                    className="h-8"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bill-amount" className="text-xs font-medium">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span>Bill Amount (₹)</span>
                    </div>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">₹</span>
                    <Input
                      id="bill-amount"
                      type="number"
                      className="h-8 pl-8"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      placeholder="Enter bill amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Tax Amount for Road Tax */}
            {selectedType === "road_tax" && (
              <div className="space-y-1">
                <Label htmlFor="tax-amount" className="text-xs font-medium">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Tax Amount (₹)</span>
                  </div>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">₹</span>
                  <Input
                    id="tax-amount"
                    type="number"
                    className="h-8 pl-8"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    placeholder="Enter tax amount paid"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            {/* Permit Fee for Travel Permits */}
            {selectedType === "travel_permits" && (
              <div className="space-y-1">
                <Label htmlFor="permit-fee" className="text-xs font-medium">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Permit Fee (₹)</span>
                  </div>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">₹</span>
                  <Input
                    id="permit-fee"
                    type="number"
                    className="h-8 pl-8"
                    value={permitFee}
                    onChange={(e) => setPermitFee(e.target.value)}
                    placeholder="Enter permit fee paid"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            {/* Recharge Amount for Fast Tag Renewals */}
            {selectedType === "fast_tag_renewals" && (
              <div className="space-y-1">
                <Label htmlFor="recharge-amount" className="text-xs font-medium">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Recharge Amount (₹)</span>
                  </div>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">₹</span>
                  <Input
                    id="recharge-amount"
                    type="number"
                    className="h-8 pl-8"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    placeholder="Enter recharge amount"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            {/* Document Type/Name for Miscellaneous */}
            {selectedType === "miscellaneous" && (
              <div className="space-y-1">
                <Label htmlFor="document-name" className="text-xs font-medium">
                  <div className="flex items-center space-x-1">
                    <File className="w-3 h-3" />
                    <span>Document Type/Name</span>
                  </div>
                </Label>
                <Input
                  id="document-name"
                  type="text"
                  className="h-8"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document type or name"
                />
              </div>
            )}



            {/* File Upload Section */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Upload Files {(selectedType === "fast_tag_renewals" || selectedType === "insurance") && <span className="text-gray-500">(Optional)</span>}
              </Label>
              
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) {
                        const fileArray = Array.from(files);
                        setSelectedFiles(prev => [...prev, ...fileArray]);
                      }
                    };
                    input.click();
                  }}
                  className="h-10 flex items-center justify-center border-green-300 text-green-700 hover:bg-green-50 w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="text-xs">Photos & Documents</span>
                </Button>
              </div>
              
              {selectedType === "insurance" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOCRScanner(true)}
                  className="h-8 flex items-center justify-center w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mt-2"
                >
                  <Scan className="w-3 h-3 mr-1" />
                  <span className="text-xs">Scan Policy</span>
                </Button>
              )}
              
              <p className="text-[10px] text-gray-500 text-center">
                Supported: JPEG, PNG, WebP, PDF • Max: 10MB per file
              </p>
              

            </div>

            {/* Selected Files Preview with Renaming */}
            {selectedFiles.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs font-medium">Selected Files ({selectedFiles.length})</Label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <FilePreviewCard 
                      key={index}
                      file={file}
                      index={index}
                      onRename={(newName) => renameFile(index, newName)}
                      onRemove={() => removeFile(index)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-1">
              <Button 
                type="button" 
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={() => setLocation("/")}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploadDocuments.isPending}
                className="flex-1 h-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs"
              >
                {uploadDocuments.isPending ? (
                  <>
                    <Upload className="w-3 h-3 mr-1 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Upload {selectedFiles.length || ''} {selectedFiles.length === 1 ? 'File' : 'Files'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        )}
      </div>



      {/* OCR Scanner Modal */}
      {showOCRScanner && (
        <OCRInsuranceScanner
          onDataExtracted={handleOCRDataExtracted}
          onClose={() => setShowOCRScanner(false)}
        />
      )}

      {/* OCR Extracted Data Display */}
      {ocrData && selectedType === "insurance" && (
        <Card className="mt-2 mx-2 shadow-orange border-l-4 border-l-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg py-1.5">
            <CardTitle className="flex items-center space-x-2 text-gray-800 text-xs">
              <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-purple-600" />
              </div>
              <span>Extracted Insurance Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {ocrData.provider && (
                <div>
                  <Label className="text-[10px] text-gray-600">Provider</Label>
                  <p className="font-medium">{ocrData.provider}</p>
                </div>
              )}
              {ocrData.policyNumber && (
                <div>
                  <Label className="text-[10px] text-gray-600">Policy Number</Label>
                  <p className="font-medium">{ocrData.policyNumber}</p>
                </div>
              )}
              {ocrData.sumInsured && (
                <div>
                  <Label className="text-[10px] text-gray-600">Sum Insured</Label>
                  <p className="font-medium text-green-600">{ocrData.sumInsured}</p>
                </div>
              )}
              {ocrData.premiumAmount && (
                <div>
                  <Label className="text-[10px] text-gray-600">Premium</Label>
                  <p className="font-medium text-blue-600">{ocrData.premiumAmount}</p>
                </div>
              )}
              {ocrData.insuredName && (
                <div className="col-span-2">
                  <Label className="text-[10px] text-gray-600">Insured Name</Label>
                  <p className="font-medium">{ocrData.insuredName}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}