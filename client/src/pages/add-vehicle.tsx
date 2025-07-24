import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Car, Save, FileText, Calendar, Camera, Settings, AlertTriangle, Shield, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { insertVehicleSchema, type InsertVehicle } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getAllMakesForType, getModelsForMake, getVehicleTypes, getVehicleColors } from "@/lib/vehicle-data";
import { formatForDatabase, calculateVehicleCompleteness, toStandardDateFormat } from "@/lib/date-format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import ColorfulLogo from "@/components/colorful-logo";
import ReferralDialog from "@/components/referral-dialog";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

// Top Indian Insurance Providers
const indianInsuranceProviders = [
  "HDFC ERGO General Insurance",
  "ICICI Lombard General Insurance",
  "Bajaj Allianz General Insurance",
  "Reliance General Insurance",
  "Tata AIG General Insurance",
  "New India Assurance",
  "United India Insurance",
  "National Insurance Company",
  "Oriental Insurance Company",
  "SBI General Insurance",
  "Future Generali India Insurance",
  "Cholamandalam MS General Insurance",
  "Royal Sundaram General Insurance",
  "Bharti AXA General Insurance",
  "IFFCO Tokio General Insurance",
  "Kotak Mahindra General Insurance",
  "Universal Sompo General Insurance",
  "Shriram General Insurance",
  "Acko General Insurance",
  "Digit Insurance",
  "Other (Enter manually)"
];

export default function AddVehicle() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [isCustomMake, setIsCustomMake] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [isCustomInsuranceProvider, setIsCustomInsuranceProvider] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Get current vehicle count to check vehicle limit and referral trigger
  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
    queryFn: () => {
      const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";
      return apiRequest("GET", `/api/vehicles?userId=${currentUserId}`).then(res => res.json());
    },
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
      insuranceCompany: "",
      insuranceExpiry: "",
      insuranceExpiryDate: "",
      insuranceSumInsured: "",
      insurancePremiumAmount: "",
      emissionExpiry: "",
      rcExpiry: "",
      lastServiceDate: "",
      currentOdometerReading: null,
      averageUsagePerMonth: null,
      serviceIntervalKms: null,
      serviceIntervalMonths: null,
      vehicleType: "4-wheeler",
      fuelType: "",
    },
  });

  const watchedMake = form.watch("make");
  const watchedVehicleType = form.watch("vehicleType");

  // Calculate vehicle completeness based on current form values
  const formValues = form.watch();
  // Include thumbnail image and insurance provider info for completeness calculation
  const completenessData = {
    ...formValues,
    thumbnailPath: thumbnailImage ? 'photo-selected' : null,
    insuranceProvider: formValues.insuranceCompany,
  };
  const completeness = calculateVehicleCompleteness(completenessData);

  // Reset make and model when vehicle type changes
  const handleVehicleTypeChange = (vehicleType: string) => {
    form.setValue("vehicleType", vehicleType);
    form.setValue("make", ""); // Reset make when vehicle type changes
    form.setValue("model", ""); // Reset model when vehicle type changes
    setSelectedMake("");
    setIsCustomMake(false);
    setIsCustomModel(false);
  };

  // Reset model when make changes
  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    if (make === "Other") {
      setIsCustomMake(true);
      form.setValue("make", "");
    } else {
      setIsCustomMake(false);
      form.setValue("make", make);
    }
    form.setValue("model", ""); // Reset model when make changes
    setIsCustomModel(false);
  };

  const handleModelChange = (model: string) => {
    if (model === "Other") {
      setIsCustomModel(true);
      form.setValue("model", "");
    } else {
      setIsCustomModel(false);
      form.setValue("model", model);
    }
  };

  const handleInsuranceProviderChange = (provider: string) => {
    if (provider === "Other (Enter manually)") {
      setIsCustomInsuranceProvider(true);
      form.setValue("insuranceCompany", "");
    } else {
      setIsCustomInsuranceProvider(false);
      form.setValue("insuranceCompany", provider);
    }
  };

  const handleColorChange = (value: string) => {
    if (value === "Other") {
      setIsCustomColor(true);
      form.setValue("color", "");
    } else {
      setIsCustomColor(false);
      form.setValue("color", value);
    }
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

      // Clean up date fields and convert to proper database format if needed
      const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";
      
      // Helper function to convert date to database format
      const formatDateForDb = (dateStr: string | null | undefined) => {
        if (!dateStr || dateStr.trim() === '') return null;
        
        // Use standardized date format conversion
        const standardDate = toStandardDateFormat(dateStr);
        if (!standardDate) return null;
        
        // Verify it's a valid date
        const testDate = new Date(standardDate);
        if (isNaN(testDate.getTime())) {
          return null;
        }
        
        return standardDate;
      };
      
      const cleanedData = {
        ...data,
        userId: parseInt(currentUserId),
        thumbnailPath,
        // Convert dates to proper database format - ensure dates are properly formatted or null
        insuranceExpiry: formatDateForDb(data.insuranceExpiry),
        insuranceExpiryDate: formatDateForDb(data.insuranceExpiryDate),
        emissionExpiry: formatDateForDb(data.emissionExpiry),
        rcExpiry: formatDateForDb(data.rcExpiry),
        lastServiceDate: formatDateForDb(data.lastServiceDate),
        // Ensure numeric fields are properly converted or null if empty
        currentOdometerReading: data.currentOdometerReading ? Number(data.currentOdometerReading) : null,
        averageUsagePerMonth: data.averageUsagePerMonth ? Number(data.averageUsagePerMonth) : null,
        serviceIntervalKms: data.serviceIntervalKms ? Number(data.serviceIntervalKms) : null,
        serviceIntervalMonths: data.serviceIntervalMonths ? Number(data.serviceIntervalMonths) : null,
        // Ensure string fields are properly null if empty
        insuranceSumInsured: data.insuranceSumInsured?.trim() || null,
        insurancePremiumAmount: data.insurancePremiumAmount?.trim() || null,
        chassisNumber: data.chassisNumber?.trim() || null,
        engineNumber: data.engineNumber?.trim() || null,
        ownerPhone: data.ownerPhone?.trim() || null,
        insuranceCompany: data.insuranceCompany?.trim() || null,
        fuelType: data.fuelType?.trim() || null,
        // Ensure year is a number
        year: Number(data.year),
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
      
      toast({
        title: "Vehicle Added",
        description: "Your vehicle has been successfully added.",
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

  const handleCameraCapture = () => {
    // Trigger the hidden camera input to open device camera app
    const cameraInput = document.getElementById('camera-input') as HTMLInputElement;
    if (cameraInput) {
      cameraInput.click();
    }
  };

  const handleCameraInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailImage(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      
      toast({
        title: "Photo Captured",
        description: "Vehicle photo has been successfully captured from camera.",
      });
    }
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-red-50 p-1"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Add Vehicle</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 pb-20 bg-warm-pattern">
        <Card className="card-hover shadow-orange border-l-4 border-l-red-500">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg py-2">
            <CardTitle className="flex items-center space-x-2 text-gray-800 text-sm">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <Car className="w-3 h-3 text-red-600" />
              </div>
              <span>Vehicle Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
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
            
            {/* Floating Vehicle Completeness Tracker - Ultra Compact */}
            <div className="fixed top-4 right-4 z-50 w-56 max-w-[calc(100vw-2rem)]">
              <Card className="shadow-lg border border-orange-300 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-2">
                  {/* Inline Header with Progress */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-orange-500" />
                      <span className="text-xs font-medium text-gray-700">Complete</span>
                    </div>
                    <span className="text-sm font-bold text-orange-600">{completeness.percentage}%</span>
                  </div>
                  
                  {/* Compact Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${completeness.percentage}%` }}
                    ></div>
                  </div>
                  
                  {/* Single Line Stats */}
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>{completeness.completedFields}/{completeness.totalFields} fields</span>
                    <span className="text-orange-600 font-medium">
                      {completeness.percentage >= 90 ? "Almost done!" : 
                       completeness.percentage >= 50 ? "Keep going" : "Getting started"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                
                {/* Vehicle Thumbnail Upload */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Vehicle Photo</label>
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
                          onClick={handleCameraCapture}
                          className="shrink-0"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Take a photo with camera app or upload from gallery</p>
                    </div>
                  </div>
                  
                  {/* Hidden camera input for device camera access */}
                  <input
                    id="camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraInputChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {/* Vehicle Type - First Field */}
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Vehicle Type *</FormLabel>
                      <FormControl>
                        <Select onValueChange={handleVehicleTypeChange} value={field.value}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2-wheeler">2-Wheeler</SelectItem>
                            <SelectItem value="3-wheeler">3-Wheeler</SelectItem>
                            <SelectItem value="4-wheeler">4-Wheeler</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Make *</FormLabel>
                        <FormControl>
                          {isCustomMake ? (
                            <Input 
                              placeholder="Enter make manually" 
                              className="h-9" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          ) : (
                            <Select onValueChange={handleMakeChange} value={selectedMake}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select make" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAllMakesForType(watchedVehicleType || "4-wheeler").map((make) => (
                                  <SelectItem key={make} value={make}>
                                    {make.toUpperCase()}
                                  </SelectItem>
                                ))}
                                <SelectItem value="Other">Other (Enter manually)</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        {isCustomMake && (
                          <p className="text-xs text-gray-500 mt-1">
                            <button 
                              type="button" 
                              onClick={() => {
                                setIsCustomMake(false);
                                setSelectedMake("");
                                form.setValue("make", "");
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ← Back to dropdown
                            </button>
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Model *</FormLabel>
                        <FormControl>
                          {isCustomModel ? (
                            <Input 
                              placeholder="Enter model manually" 
                              className="h-9" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          ) : (
                            <Select onValueChange={handleModelChange} value={field.value} disabled={!watchedMake && !isCustomMake}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                              <SelectContent>
                                {getModelsForMake(watchedMake, watchedVehicleType || "4-wheeler").map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))}
                                <SelectItem value="Other">Other (Enter manually)</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        {isCustomModel && (
                          <p className="text-xs text-gray-500 mt-1">
                            <button 
                              type="button" 
                              onClick={() => {
                                setIsCustomModel(false);
                                form.setValue("model", "");
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ← Back to dropdown
                            </button>
                          </p>
                        )}
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
                        <FormLabel className="text-xs font-medium">Year * (e.g. 2020)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2020"
                            className="h-9"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
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
                        <FormLabel className="text-xs font-medium">Color</FormLabel>
                        <FormControl>
                          {isCustomColor ? (
                            <Input 
                              placeholder="Enter color manually" 
                              className="h-9" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.trim())}
                            />
                          ) : (
                            <Select onValueChange={handleColorChange} value={field.value}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                              <SelectContent>
                                {getVehicleColors().map((color) => (
                                  <SelectItem key={color} value={color}>
                                    {color}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        {isCustomColor && (
                          <p className="text-xs text-gray-500 mt-1">
                            <button 
                              type="button" 
                              onClick={() => {
                                setIsCustomColor(false);
                                form.setValue("color", "");
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ← Back to dropdown
                            </button>
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">License Plate *</FormLabel>
                        <FormControl>
                          <Input placeholder="DL 01 AB 1234" className="h-9" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Fuel Type</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select fuel type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="petrol">Petrol</SelectItem>
                              <SelectItem value="diesel">Diesel</SelectItem>
                              <SelectItem value="electric">Electric (EV)</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Input placeholder="MAT123456789" className="h-9" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
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
                          <Input placeholder="ENG987654321" className="h-9" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
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
                          <Input placeholder="John Doe" className="h-9" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
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
                          <Input placeholder="+91 98765 43210" className="h-9" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                            value={toStandardDateFormat(field.value) || ""} 
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emissionExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Latest Emission</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="h-9"
                            {...field} 
                            value={toStandardDateFormat(field.value) || ""} 
                            onChange={(e) => field.onChange(e.target.value)}
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
                            value={toStandardDateFormat(field.value) || ""} 
                            onChange={(e) => field.onChange(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Insurance Details Section */}
                <Card className="mt-4 shadow-orange border-l-4 border-l-orange-500">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg py-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-800 text-base">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-orange-600" />
                      </div>
                      <span>Insurance Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="insuranceCompany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Insurance Provider</FormLabel>
                            <FormControl>
                              {isCustomInsuranceProvider ? (
                                <Input 
                                  placeholder="Enter insurance company name" 
                                  className="h-9" 
                                  {...field}
                                  value={field.value || ""}
                                />
                              ) : (
                                <Select onValueChange={handleInsuranceProviderChange} value={field.value || ""}>
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select insurance provider" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {indianInsuranceProviders.map((provider) => (
                                      <SelectItem key={provider} value={provider}>
                                        {provider}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </FormControl>
                            {isCustomInsuranceProvider && (
                              <p className="text-xs text-gray-500 mt-1">
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setIsCustomInsuranceProvider(false);
                                    form.setValue("insuranceCompany", "");
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  ← Back to dropdown
                                </button>
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="insuranceExpiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Issue Date (When policy was issued)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  className="h-9"
                                  {...field} 
                                  value={toStandardDateFormat(field.value) || ""} 
                                  onChange={(e) => field.onChange(e.target.value)}
                                  max={new Date().toISOString().split('T')[0]}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="insuranceExpiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Expiry Date (When policy expires)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  className="h-9"
                                  {...field} 
                                  value={toStandardDateFormat(field.value) || ""} 
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="insuranceSumInsured"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Sum Insured (₹) (e.g. 500000)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  placeholder="500000" 
                                  className="h-9"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                    field.onChange(value);
                                  }}
                                  onKeyPress={(e) => {
                                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                                      e.preventDefault();
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="insurancePremiumAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Premium Amount (₹) (e.g. 15000)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  placeholder="15000" 
                                  className="h-9"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                    field.onChange(value);
                                  }}
                                  onKeyPress={(e) => {
                                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                                      e.preventDefault();
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                            <FormLabel className="text-sm font-medium">Current Odometer (km) (e.g. 85000)</FormLabel>
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
                            <FormLabel className="text-sm font-medium">Monthly Usage (km) (e.g. 1200)</FormLabel>
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
                            <FormLabel className="text-sm font-medium">Service Interval (km) (e.g. 10000)</FormLabel>
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
                            <FormLabel className="text-sm font-medium">Service Interval (mths) (e.g. 6)</FormLabel>
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
      </div>



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
