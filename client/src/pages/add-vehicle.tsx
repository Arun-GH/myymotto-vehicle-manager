import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Car, Save, FileText, Calendar, Camera, Settings, AlertTriangle, Shield, TrendingUp, AlertCircle, CheckCircle, Upload } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


import ColorfulLogo from "@/components/colorful-logo";
import ReferralDialog from "@/components/referral-dialog";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";



export default function AddVehicle() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [isCustomMake, setIsCustomMake] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);

  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showDocumentUpdateDialog, setShowDocumentUpdateDialog] = useState(false);
  const [createdVehicleId, setCreatedVehicleId] = useState<number | null>(null);
  
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
      vehicleType: "4-wheeler",
      fuelType: "",
      userType: "Private",
    },
  });

  const watchedMake = form.watch("make");
  const watchedVehicleType = form.watch("vehicleType");

  // Calculate vehicle completeness based on current form values
  const formValues = form.watch();
  // Include thumbnail image for completeness calculation
  const completenessData = {
    ...formValues,
    thumbnailPath: thumbnailImage ? 'photo-selected' : null,
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
  const handleMakeChange = (make: string, fieldOnChange?: (value: string) => void) => {
    setSelectedMake(make);
    if (make === "Other") {
      setIsCustomMake(true);
      form.setValue("make", "");
      if (fieldOnChange) fieldOnChange("");
    } else {
      setIsCustomMake(false);
      form.setValue("make", make);
      if (fieldOnChange) fieldOnChange(make);
    }
    form.setValue("model", ""); // Reset model when make changes
    setIsCustomModel(false);
  };

  const handleModelChange = (model: string, fieldOnChange?: (value: string) => void) => {
    if (model === "Other") {
      setIsCustomModel(true);
      form.setValue("model", "");
      if (fieldOnChange) fieldOnChange("");
    } else {
      setIsCustomModel(false);
      form.setValue("model", model);
      if (fieldOnChange) fieldOnChange(model);
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
        // Ensure string fields are properly null if empty
        chassisNumber: data.chassisNumber?.trim() || null,
        engineNumber: data.engineNumber?.trim() || null,
        ownerPhone: data.ownerPhone?.trim() || null,
        fuelType: data.fuelType?.trim() || null,
        userType: data.userType?.trim() || "Private", // Default to Private if not provided
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
      
      // Store created vehicle ID and show document update dialog
      setCreatedVehicleId(vehicle.id);
      setShowDocumentUpdateDialog(true);
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
                className="w-12 h-12 rounded-lg"
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
            
            {/* Fixed Vehicle Completeness Tracker */}
            <Card className="shadow-lg border border-orange-300 bg-white mb-4">
              <CardContent className="p-3">
                {/* Header with Progress */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Form Completion</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{completeness.percentage}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completeness.percentage}%` }}
                  ></div>
                </div>
                
                {/* Stats */}
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{completeness.completedFields}/{completeness.totalFields} fields completed</span>
                  <span className="text-orange-600 font-medium">
                    {completeness.percentage >= 90 ? "Almost done!" : 
                     completeness.percentage >= 50 ? "Keep going" : "Getting started"}
                  </span>
                </div>
              </CardContent>
            </Card>
            
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('vehicle-photo-input')?.click()}
                        className="w-full h-12 flex items-center justify-center border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        <span className="text-sm">Photos & Documents</span>
                      </Button>
                      <input
                        id="vehicle-photo-input"
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">📱 Choose photos and documents from storage</p>
                    </div>
                  </div>
                  

                </div>
                {/* Vehicle Type and User Type - Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">User Type *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select user type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Private">Private</SelectItem>
                              <SelectItem value="Commercial">Commercial</SelectItem>
                              <SelectItem value="Taxi services">Taxi services</SelectItem>
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
                            <Select onValueChange={(value) => handleMakeChange(value, field.onChange)} value={field.value}>
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
                            <Select onValueChange={(value) => handleModelChange(value, field.onChange)} value={field.value} disabled={!watchedMake && !isCustomMake}>
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
                          <Select onValueChange={field.onChange} value={field.value || ""}>
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
                          <Input placeholder="MAT123456789" className="h-9" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
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
                          <Input placeholder="ENG987654321" className="h-9" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
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
                          <Input placeholder="+91 98765 43210" className="h-9" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>







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



      {/* Document Update Dialog */}
      <AlertDialog open={showDocumentUpdateDialog} onOpenChange={setShowDocumentUpdateDialog}>
        <AlertDialogContent className="w-[95%] max-w-sm mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl shadow-orange-500/20 rounded-xl">
          <AlertDialogHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-gray-900 leading-tight">
              Complete Your Vehicle Profile
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed mt-2 px-2">
              Your vehicle has been added successfully! Complete your profile by uploading essential documents like insurance policy, RC book, and emission certificate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 pt-4">
            <AlertDialogAction 
              onClick={() => {
                setShowDocumentUpdateDialog(false);
                if (createdVehicleId) {
                  setLocation(`/vehicle/${createdVehicleId}/upload`);
                }
              }}
              className="w-full h-11 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-base"
            >
              Upload Documents Now
            </AlertDialogAction>
            <AlertDialogCancel 
              onClick={() => {
                setShowDocumentUpdateDialog(false);
                setShowReferralDialog(true);
              }}
              className="w-full h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-lg transition-all duration-200 text-sm"
            >
              Skip for Now
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
