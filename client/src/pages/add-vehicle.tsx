import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Car, Save, FileText, Calendar, Camera, Settings, AlertTriangle } from "lucide-react";
import { insertVehicleSchema, type InsertVehicle } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getAllMakes, getModelsForMake } from "@/lib/vehicle-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VehicleDocumentSection from "@/components/vehicle-document-section";
import CameraCapture from "@/components/camera-capture";
import ColorfulLogo from "@/components/colorful-logo";
import ReferralDialog from "@/components/referral-dialog";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function AddVehicle() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  
  // Document states for different types
  const [emissionDocuments, setEmissionDocuments] = useState<File[]>([]);
  const [rcDocuments, setRcDocuments] = useState<File[]>([]);
  const [insuranceDocuments, setInsuranceDocuments] = useState<File[]>([]);
  const [serviceDocuments, setServiceDocuments] = useState<File[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Get current vehicle count to check vehicle limit and referral trigger
  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
    queryFn: () => apiRequest("GET", "/api/vehicles").then(res => res.json()),
  });

  // Check vehicle limits and subscription requirements
  const vehicleLimitReached = vehicles.length >= 4;
  const needsSubscription = vehicles.length >= 2; // Need subscription for 3rd and 4th vehicle

  const form = useForm<InsertVehicle>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      licensePlate: "",
      chassisNumber: "",
      engineNumber: "",
      ownerName: "",
      ownerPhone: "",
      insuranceExpiry: "",
      emissionExpiry: "",
      rcExpiry: "",
      lastServiceDate: "",
      currentOdometerReading: null,
      averageUsagePerMonth: null,
      serviceIntervalKms: null,
      serviceIntervalMonths: null,
    },
  });

  const watchedMake = form.watch("make");

  // Reset model when make changes
  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    form.setValue("make", make);
    form.setValue("model", ""); // Reset model when make changes
  };

  const createVehicleMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      // Upload thumbnail first if exists
      let thumbnailPath = null;
      if (thumbnailImage) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append("file", thumbnailImage);
        thumbnailFormData.append("type", "thumbnail");
        
        const thumbnailResponse = await apiRequest("POST", "/api/upload", thumbnailFormData);
        const thumbnailResult = await thumbnailResponse.json();
        thumbnailPath = thumbnailResult.filePath;
      }

      // Clean up date fields - convert empty strings to null
      const cleanedData = {
        ...data,
        thumbnailPath,
        insuranceExpiry: data.insuranceExpiry?.trim() || null,
        emissionExpiry: data.emissionExpiry?.trim() || null,
        rcExpiry: data.rcExpiry?.trim() || null,
        lastServiceDate: data.lastServiceDate?.trim() || null,
        currentOdometerReading: data.currentOdometerReading || null,
        averageUsagePerMonth: data.averageUsagePerMonth || null,
        serviceIntervalKms: data.serviceIntervalKms || null,
        serviceIntervalMonths: data.serviceIntervalMonths || null,
      };
      const response = await apiRequest("POST", "/api/vehicles", cleanedData);
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.requiresSubscription) {
          throw new Error(errorData.message);
        }
        throw new Error(errorData.message || "Failed to add vehicle");
      }
      return response.json();
    },
    onSuccess: async (vehicle) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // Upload documents by type
      const documentUploads = [
        { files: emissionDocuments, type: "emission" },
        { files: rcDocuments, type: "rc" },
        { files: insuranceDocuments, type: "insurance" },
        { files: serviceDocuments, type: "service" }
      ];

      for (const { files, type } of documentUploads) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", type);
          
          try {
            await apiRequest("POST", `/api/vehicles/${vehicle.id}/documents`, formData);
          } catch (error) {
            console.error(`Failed to upload ${type} document:`, error);
          }
        }
      }
      
      toast({
        title: "Vehicle Added",
        description: "Your vehicle has been successfully added with all documents.",
      });

      // Show referral dialog for every vehicle addition
      setShowReferralDialog(true);
    },
    onError: (error) => {
      // Check if it's a subscription error
      if (error.message.includes("Subscribe for just ₹100/-")) {
        toast({
          title: "Subscription Required",
          description: error.message,
          variant: "destructive",
          action: (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setLocation("/subscribe")}
            >
              Subscribe Now
            </Button>
          ),
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add vehicle",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: InsertVehicle) => {
    createVehicleMutation.mutate(data);
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailImage(null);
    setThumbnailPreview(null);
  };

  const handleCameraCapture = (file: File) => {
    setThumbnailImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setShowCamera(false);
  };

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
                <p className="text-sm text-red-600">Add Vehicle</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        <Card className="card-hover shadow-orange border-l-4 border-l-red-500">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg py-3">
            <CardTitle className="flex items-center space-x-2 text-gray-800 text-base">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Car className="w-4 h-4 text-red-600" />
              </div>
              <span>Vehicle Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {vehicleLimitReached && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Vehicle Limit Reached</p>
                    <p className="text-xs text-red-700">You can add a maximum of 4 vehicles per account.</p>
                  </div>
                </div>
              </div>
            )}
            
            {needsSubscription && !vehicleLimitReached && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Subscription Required</p>
                    <p className="text-xs text-orange-700">To add more than 2 vehicles, subscribe for just ₹100/- per year and add up to 4 vehicles.</p>
                    <Button 
                      type="button" 
                      size="sm" 
                      className="mt-2 bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => setLocation("/subscribe")}
                    >
                      Subscribe Now - ₹100/- per year
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Vehicle Thumbnail Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Photo</label>
                  <div className="flex items-center space-x-4">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img 
                          src={thumbnailPreview} 
                          alt="Vehicle thumbnail" 
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeThumbnail}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
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
                      <p className="text-xs text-gray-500 mt-1">Upload a photo of your vehicle or use camera</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Make *</FormLabel>
                        <FormControl>
                          <Select onValueChange={handleMakeChange} value={field.value}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select make" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAllMakes().map((make) => (
                                <SelectItem key={make} value={make}>
                                  {make}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Model *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchedMake}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {getModelsForMake(watchedMake).map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Year *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            className="h-9"
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Color</FormLabel>
                        <FormControl>
                          <Input placeholder="Red" className="h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">License Plate *</FormLabel>
                        <FormControl>
                          <Input placeholder="DL 01 AB 1234" className="h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="chassisNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Chassis Number</FormLabel>
                        <FormControl>
                          <Input placeholder="MAT123456789" className="h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="engineNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Engine Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ENG987654321" className="h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Owner Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ownerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" className="h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="rcExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">RC Expiry</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="h-9"
                            {...field} 
                            value={field.value || ""} 
                            onChange={(e) => field.onChange(e.target.value.trim() || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastServiceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Last Service Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="h-9"
                            {...field} 
                            value={field.value || ""} 
                            onChange={(e) => field.onChange(e.target.value.trim() || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Service Details Section */}
                <Card className="mt-4 shadow-orange border-l-4 border-l-blue-500">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg py-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-800 text-base">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Settings className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>Service Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="currentOdometerReading"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Current Odometer (km)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="85000" 
                                className="h-9"
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="averageUsagePerMonth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Monthly Usage (km)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1200" 
                                className="h-9"
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="serviceIntervalKms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Service Interval (km)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="10000" 
                                className="h-9"
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="serviceIntervalMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Service Interval (mths)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="6" 
                                className="h-9"
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

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
                    type="submit" 
                    className="flex-1 h-9 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    disabled={createVehicleMutation.isPending}
                  >
                    {createVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Document Upload Sections */}
        <div className="mt-6 space-y-4">
          <VehicleDocumentSection
            title="Emission Certificate"
            documentType="emission"
            documents={emissionDocuments}
            onDocumentsChange={setEmissionDocuments}
            dateValue={form.watch("emissionExpiry")}
            onDateChange={(date) => form.setValue("emissionExpiry", date)}
            dateLabel="Emission Expiry Date"
          />

          <VehicleDocumentSection
            title="RC Book Copy"
            documentType="rc"
            documents={rcDocuments}
            onDocumentsChange={setRcDocuments}
          />

          <VehicleDocumentSection
            title="Insurance Copy"
            documentType="insurance"
            documents={insuranceDocuments}
            onDocumentsChange={setInsuranceDocuments}
            dateValue={form.watch("insuranceExpiry")}
            onDateChange={(date) => form.setValue("insuranceExpiry", date)}
            dateLabel="Insurance Expiry Date"
          />

          <VehicleDocumentSection
            title="Service Invoice/Copy"
            documentType="service"
            documents={serviceDocuments}
            onDocumentsChange={setServiceDocuments}
          />
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Referral Dialog */}
      <ReferralDialog 
        open={showReferralDialog} 
        onOpenChange={(open) => {
          setShowReferralDialog(open);
          if (!open) {
            setLocation("/");
          }
        }} 
      />
    </div>
  );
}
