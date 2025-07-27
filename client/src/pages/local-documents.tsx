import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, Eye, Trash2, Download, HardDrive, Car, Plus, Edit, Share2 } from "lucide-react";
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
      const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";
      const response = await apiRequest("GET", `/api/vehicles/${vehicleId}?userId=${currentUserId}`);
      return response.json();
    },
    enabled: !!vehicleId,
  });

  const documentTypes: Record<string, { label: string; color: string }> = {
    emission: { label: "Emission Certificates", color: "bg-green-500" },
    insurance: { label: "Insurance Documents", color: "bg-blue-500" },
    service: { label: "Service Invoices", color: "bg-orange-500" },
    rc: { label: "RC Book Copies", color: "bg-purple-500" },
    fuel: { label: "Fuel Bills", color: "bg-yellow-500" },
    road_tax: { label: "Road Tax", color: "bg-red-500" },
    travel_permits: { label: "Travel Permits", color: "bg-indigo-500" },
    fitness_certificate: { label: "Fitness Certificate", color: "bg-teal-500" },
    fast_tag_renewals: { label: "Fast Tag Renewals", color: "bg-pink-500" },
    miscellaneous: { label: "Miscellaneous Documents", color: "bg-gray-500" },
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

  const handleShareDocument = async (document: LocalDocument) => {
    try {
      // Create blob URL for sharing
      const blob = new Blob([document.fileData], { type: document.mimeType });
      const file = new File([blob], document.fileName, { type: document.mimeType });
      
      // Check if Web Share API is supported and can share files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${document.fileName} - ${vehicle.make} ${vehicle.model}`,
          text: `Sharing document: ${document.fileName} for ${vehicle.make} ${vehicle.model}`,
          files: [file]
        });
      } else {
        // Fallback: Show share options
        const blob2 = new Blob([document.fileData], { type: document.mimeType });
        const url = URL.createObjectURL(blob2);
        
        // Try different share methods
        const shareOptions = [
          {
            name: "WhatsApp",
            action: () => {
              const message = `Sharing document: ${document.fileName} for ${vehicle.make} ${vehicle.model}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
              // Note: WhatsApp Web doesn't support direct file sharing via URL, user will need to manually attach
              toast({
                title: "WhatsApp Share",
                description: "Please manually attach the downloaded file to your WhatsApp message.",
              });
              localDocumentStorage.downloadDocument(document);
            }
          },
          {
            name: "Email",
            action: () => {
              const subject = `Document: ${document.fileName} - ${vehicle.make} ${vehicle.model}`;
              const body = `Please find attached the document: ${document.fileName} for ${vehicle.make} ${vehicle.model}`;
              window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
              toast({
                title: "Email Share",
                description: "Please manually attach the downloaded file to your email.",
              });
              localDocumentStorage.downloadDocument(document);
            }
          }
        ];

        // Show a toast with share instructions
        toast({
          title: "Share Document",
          description: "Document will be downloaded. You can then share it via your preferred app.",
        });
        localDocumentStorage.downloadDocument(document);
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      toast({
        title: "Share Failed",
        description: "Unable to share document. File will be downloaded instead.",
        variant: "destructive",
      });
      localDocumentStorage.downloadDocument(document);
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return { status: "unknown", color: "gray", text: "No expiry" };
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: "expired", color: "red", text: "Expired" };
    } else if (daysUntilExpiry <= 7) {
      return { status: "critical", color: "red", text: `${daysUntilExpiry}d left` };
    } else if (daysUntilExpiry <= 30) {
      return { status: "warning", color: "orange", text: `${daysUntilExpiry}d left` };
    } else if (daysUntilExpiry <= 90) {
      return { status: "due_soon", color: "yellow", text: `${daysUntilExpiry}d left` };
    } else {
      return { status: "active", color: "green", text: `${daysUntilExpiry}d left` };
    }
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
      <div className="header-gradient-border sticky top-0 z-10 bg-white px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/")}
              className="text-gray-600 hover:bg-red-50 p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img 
              src={logoImage} 
              alt="Myymotto Logo" 
              className="w-12 h-12 rounded-lg"
            />
            <div>
              <div className="text-base font-bold">
                <ColorfulLogo />
              </div>
              <p className="text-xs text-red-600">Vehicle Documents</p>
            </div>
          </div>
          
          <div className="w-8"></div>
        </div>
      </div>

      <div className="p-1.5 pb-20 bg-warm-pattern">
        {/* Vehicle Info */}
        <Card className="mb-1.5 shadow-orange border-l-4 border-l-blue-500">
          <CardContent className="p-1.5">
            <div className="flex items-center space-x-1.5">
              {vehicle.thumbnailPath ? (
                <img 
                  src={vehicle.thumbnailPath} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-6 h-6 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                  <Car className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 text-sm">{vehicle.make?.toUpperCase()} {vehicle.model} {vehicle.year && `(${vehicle.year})`}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">{vehicle.licensePlate}</p>
                  <div className="text-xs text-blue-600">
                    <FileText className="w-3 h-3 inline mr-0.5" />
                    {documents.length} doc{documents.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card className="mb-1.5 shadow-orange border-l-4 border-l-green-500">
          <CardContent className="p-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                  <HardDrive className="w-2.5 h-2.5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-800">Device Storage</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-blue-600">{documents.length} docs • {formatFileSize(storageInfo.used)}</div>
              </div>
            </div>
            <div className="text-xs text-green-600 mt-0.5 flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
              Secured locally
            </div>
          </CardContent>
        </Card>

        {/* Documents by Type */}
        {Object.keys(groupedDocuments).length === 0 ? (
          <Card className="card-hover shadow-orange border-l-4 border-l-orange-500">
            <CardContent className="text-center py-3">
              <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-sm font-semibold mb-1">No Documents Stored</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Upload documents to store them securely
              </p>
              <Button 
                onClick={() => setLocation(`/vehicle/${vehicleId}/upload`)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-7 text-xs"
              >
                Upload Documents
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedDocuments).map(([type, docs]) => (
            <Card key={type} className="card-hover shadow-orange border-l-4 border-l-purple-500 mb-1.5">
              <CardHeader className="pb-0.5 px-1.5 pt-1.5">
                <CardTitle className="flex items-center space-x-1.5 text-xs">
                  <div className={`w-3 h-3 rounded-full ${documentTypes[type]?.color || 'bg-gray-500'}`} />
                  <span>{documentTypes[type]?.label || type}</span>
                  <Badge variant="secondary" className="ml-auto text-xs h-4 px-1.5">{docs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5 px-1.5 pb-1.5">
                {docs.map((document) => (
                  <div key={document.id} className="border rounded-lg p-1.5 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1 mb-0.5">
                          <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm">
                            {documentTypes[document.type]?.label || document.type}
                          </span>
                          {document.metadata?.documentName && (
                            <span className="text-[10px] text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded-sm">
                              {document.metadata.documentName}
                            </span>
                          )}
                          {/* Expiry Status Indicator */}
                          {(document.metadata?.expiryDate || document.metadata?.insuranceExpiryDate) && (
                            (() => {
                              const expiryDate = document.metadata?.expiryDate || document.metadata?.insuranceExpiryDate;
                              if (!expiryDate) return null;
                              const status = getExpiryStatus(expiryDate);
                              const colorClasses: Record<string, string> = {
                                red: "text-red-700 bg-red-50 border-red-200",
                                orange: "text-orange-700 bg-orange-50 border-orange-200", 
                                yellow: "text-yellow-700 bg-yellow-50 border-yellow-200",
                                green: "text-green-700 bg-green-50 border-green-200",
                                gray: "text-gray-700 bg-gray-50 border-gray-200"
                              };
                              return (
                                <span className={`text-[9px] font-medium px-1 py-0.5 rounded-sm border ${colorClasses[status.color] || colorClasses.gray}`}>
                                  {status.text}
                                </span>
                              );
                            })()
                          )}
                        </div>
                        <p className="font-medium text-xs truncate">{document.fileName}</p>
                        <div className="text-[10px] text-muted-foreground flex items-center space-x-1.5 mt-0.5">
                          {document.fileSize > 0 && (
                            <span>{formatFileSize(document.fileSize)} • {formatDate(document.uploadedAt)}</span>
                          )}
                          {document.fileSize === 0 && (
                            <span>Added: {formatDate(document.uploadedAt)}</span>
                          )}
                          {document.metadata?.billDate && (
                            <span className="text-yellow-600">Bill: {formatDate(document.metadata.billDate)}</span>
                          )}
                          {document.metadata?.expiryDate && (
                            <span className="text-green-600">Expiry: {formatDate(document.metadata.expiryDate)}</span>
                          )}
                          {document.metadata?.insuranceExpiryDate && (
                            <span className="text-red-600">Insurance Expiry: {formatDate(document.metadata.insuranceExpiryDate)}</span>
                          )}

                        </div>
                        
                        {/* Insurance Details - Provider and Financial Info */}
                        {document.type === 'insurance' && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {document.metadata?.insuranceProvider && (
                              <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-sm border border-blue-200">
                                Provider: {document.metadata.insuranceProvider}
                              </span>
                            )}
                            {document.metadata?.insuranceIssuedDate && (
                              <span className="text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-sm border border-green-200">
                                Issued: {formatDate(document.metadata.insuranceIssuedDate)}
                              </span>
                            )}
                            {document.metadata?.sumInsured && (
                              <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-sm border border-purple-200">
                                Sum Insured: {formatCurrency(document.metadata.sumInsured)}
                              </span>
                            )}
                            {document.metadata?.insurancePremium && (
                              <span className="text-[10px] font-medium text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded-sm border border-orange-200">
                                Premium: {formatCurrency(document.metadata.insurancePremium)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Amount Fields Display for Other Documents */}
                        {document.type !== 'insurance' && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {document.metadata?.billAmount && (
                              <span className="text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-sm border border-green-200">
                                Bill: {formatCurrency(document.metadata.billAmount)}
                              </span>
                            )}
                            {document.metadata?.taxAmount && (
                              <span className="text-[10px] font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded-sm border border-red-200">
                                Tax: {formatCurrency(document.metadata.taxAmount)}
                              </span>
                            )}
                            {document.metadata?.permitFee && (
                              <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-sm border border-indigo-200">
                                Permit Fee: {formatCurrency(document.metadata.permitFee)}
                              </span>
                            )}
                            {document.metadata?.rechargeAmount && (
                              <span className="text-[10px] font-medium text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded-sm border border-pink-200">
                                Recharge: {formatCurrency(document.metadata.rechargeAmount)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      {/* Edit button for unique document types */}
                      {localDocumentStorage.isUniqueDocumentType(document.type) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setLocation(`/vehicle/${vehicleId}/upload?edit=${document.type}`)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-6 px-1.5 py-0"
                        >
                          <Edit className="w-2.5 h-2.5" />
                        </Button>
                      )}
                      
                      {document.fileSize > 0 ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDocument(document)}
                            className="flex-1 h-6 text-[10px] py-0"
                          >
                            <Eye className="w-2.5 h-2.5 mr-0.5" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareDocument(document)}
                            className="flex-1 h-6 text-[10px] py-0"
                          >
                            <Share2 className="w-2.5 h-2.5 mr-0.5" />
                            Share
                          </Button>
                        </>
                      ) : (
                        <div className="flex-1 text-center text-[10px] text-gray-500 py-1">
                          No file - Amount only
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDocument(document)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-1.5 py-0"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
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
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-7 text-xs"
        >
          Upload More Documents
        </Button>
      </div>

      {/* Floating Action Button for Upload */}
      <div className="fixed bottom-20 right-3 z-50">
        <Button
          onClick={() => setLocation(`/vehicle/${vehicleId}/upload`)}
          className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white"
          size="icon"
        >
          <Plus className="h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
}