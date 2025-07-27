import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Car, Save, Camera, Settings, Shield, Upload, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { insertVehicleSchema, type InsertVehicle } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getAllMakesForType, getModelsForMake, getVehicleTypes, getVehicleColors } from "@/lib/vehicle-data";
import { formatToddmmyyyy, parseFromddmmyyyy, formatForDatabase, calculateVehicleCompleteness, toStandardDateFormat } from "@/lib/date-format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

// Date conversion functions moved to standardized utilities

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

export default function EditVehicle() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const vehicleId = parseInt(params.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [isCustomMake, setIsCustomMake] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [isCustomInsuranceProvider, setIsCustomInsuranceProvider] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

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
      vehicleType: "",
      fuelType: "",
      userType: "Private",
    },
  });

  // Update form when vehicle data is loaded
  useEffect(() => {
    if (vehicle) {
      form.reset({
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year || new Date().getFullYear(),
        color: vehicle.color || "",
        licensePlate: vehicle.licensePlate || "",
        chassisNumber: vehicle.chassisNumber || "",
        engineNumber: vehicle.engineNumber || "",
        ownerName: vehicle.ownerName || "",
        ownerPhone: vehicle.ownerPhone || "",
        insuranceExpiry: formatToddmmyyyy(vehicle.insuranceExpiry) || "",
        insuranceExpiryDate: formatToddmmyyyy(vehicle.insuranceExpiryDate) || "",
        insuranceSumInsured: vehicle.insuranceSumInsured || "",
        insurancePremiumAmount: vehicle.insurancePremiumAmount || "",
        emissionExpiry: formatToddmmyyyy(vehicle.emissionExpiry) || "",
        rcExpiry: formatToddmmyyyy(vehicle.rcExpiry) || "",
        lastServiceDate: formatToddmmyyyy(vehicle.lastServiceDate) || "",
        currentOdometerReading: vehicle.currentOdometerReading || null,
        averageUsagePerMonth: vehicle.averageUsagePerMonth || null,
        serviceIntervalKms: vehicle.serviceIntervalKms || null,
        serviceIntervalMonths: vehicle.serviceIntervalMonths || null,
        vehicleType: vehicle.vehicleType || "",
        fuelType: vehicle.fuelType || "",
        userType: vehicle.userType || "Private",
      });
      
      // Check if make or model are custom (not in dropdown)
      const vehicleType = vehicle.vehicleType || "4-wheeler";
      const availableMakes = getAllMakesForType(vehicleType);
      const vehicleMake = vehicle.make || "";
      const vehicleModel = vehicle.model || "";
      
      if (vehicleMake && !availableMakes.includes(vehicleMake)) {
        setIsCustomMake(true);
        setSelectedMake("");
      } else {
        setIsCustomMake(false);
        setSelectedMake(vehicleMake);
      }
      
      if (vehicleModel && vehicleMake && !getModelsForMake(vehicleMake, vehicleType).includes(vehicleModel)) {
        setIsCustomModel(true);
      } else {
        setIsCustomModel(false);
      }

      // Check if color is custom (not in dropdown)
      const availableColors = getVehicleColors();
      if (vehicle.color && !availableColors.includes(vehicle.color)) {
        setIsCustomColor(true);
      } else {
        setIsCustomColor(false);
      }

      // Check if insurance company is custom (not in dropdown)
      if (vehicle.insuranceCompany && !indianInsuranceProviders.includes(vehicle.insuranceCompany)) {
        setIsCustomInsuranceProvider(true);
      } else {
        setIsCustomInsuranceProvider(false);
      }
      
      if (vehicle.thumbnailPath) {
        setThumbnailPreview(vehicle.thumbnailPath);
      }
    }
  }, [vehicle, form]);

  const watchedMake = form.watch("make");
  const watchedVehicleType = form.watch("vehicleType");

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
    setThumbnailPreview(vehicle?.thumbnailPath || null);
  };

  const updateVehicleMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      // Upload new thumbnail if exists
      let thumbnailPath = vehicle?.thumbnailPath || null;
      if (thumbnailImage) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append("file", thumbnailImage);
        thumbnailFormData.append("type", "thumbnail");
        
        const thumbnailResponse = await apiRequest("POST", "/api/upload", thumbnailFormData);
        const thumbnailResult = await thumbnailResponse.json();
        thumbnailPath = thumbnailResult.filePath;
      }

      // Clean up date fields - convert dd/mm/yyyy to database format
      const cleanedData = {
        ...data,
        thumbnailPath,
        insuranceExpiry: formatForDatabase(data.insuranceExpiry?.trim() || "") || null,
        insuranceExpiryDate: formatForDatabase(data.insuranceExpiryDate?.trim() || "") || null,
        emissionExpiry: formatForDatabase(data.emissionExpiry?.trim() || "") || null,
        rcExpiry: formatForDatabase(data.rcExpiry?.trim() || "") || null,
        lastServiceDate: formatForDatabase(data.lastServiceDate?.trim() || "") || null,
        currentOdometerReading: data.currentOdometerReading || null,
        averageUsagePerMonth: data.averageUsagePerMonth || null,
        serviceIntervalKms: data.serviceIntervalKms || null,
        serviceIntervalMonths: data.serviceIntervalMonths || null,
        userType: data.userType?.trim() || "Private", // Default to Private if not provided
      };


      const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";
      const response = await apiRequest("PUT", `/api/vehicles/${vehicleId}?userId=${currentUserId}`, cleanedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Vehicle Updated",
        description: "Your vehicle has been successfully updated.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertVehicle) => {
    updateVehicleMutation.mutate(data);
  };

  // Calculate vehicle completeness
  const completeness = vehicle ? calculateVehicleCompleteness(vehicle) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading vehicle details...</p>
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
                <p className="text-xs text-red-600">Edit Vehicle</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-red-50 p-1">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 pb-20 bg-warm-pattern">
        <Card className="card-hover shadow-orange">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg py-3">
            <CardTitle className="flex items-center space-x-2 text-gray-800 text-base">
              <Car className="w-4 h-4 text-red-600" />
              <span>Edit Vehicle Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Vehicle Completeness Tracker */}
            {completeness && (
              <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-semibold text-gray-800">Vehicle Info</h3>
                  </div>
                  <span className="text-base font-bold text-orange-600">{completeness.percentage}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completeness.percentage}%` }}
                  ></div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>{completeness.completedFields}/{completeness.totalFields} fields completed</span>
                  <span>Vehicle information completeness</span>
                </div>
                
                {/* Missing Fields */}
                {completeness.missingFields.length > 0 && completeness.percentage < 100 && (
                  <div className="pt-2 border-t border-orange-200">
                    <div className="flex items-center space-x-1 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-medium text-gray-700">Missing:</span>
                    </div>
                    <div className="text-[10px] text-gray-600 leading-tight">
                      {completeness.missingFields.slice(0, 4).map((field, idx) => field.name).join(', ')}
                      {completeness.missingFields.length > 4 && ` +${completeness.missingFields.length - 4} more`}
                    </div>
                  </div>
                )}
                
                {/* Achievement */}
                {completeness.percentage >= 90 && (
                  <div className="pt-2 border-t border-green-200 bg-green-50 rounded p-1.5 mt-2">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-medium text-green-800">
                        {completeness.percentage === 100 ? 'Complete Vehicle Info!' : 'Almost complete!'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
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
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-center">
                        <label className="block w-full">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.txt"
                            onChange={handleThumbnailChange}
                            className="hidden"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="h-8 text-xs px-3 w-full"
                            onClick={(e) => {
                              e.preventDefault();
                              (e.target as HTMLElement).parentElement?.querySelector('input')?.click();
                            }}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Photos & Documents
                          </Button>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">Choose photos and documents from storage</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Type and User Type Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Vehicle Type *</FormLabel>
                        <FormControl>
                          <Select onValueChange={handleVehicleTypeChange} value={field.value}>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            <SelectContent>
                              {getVehicleTypes().map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
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
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">User Type *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-8">
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

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Make *</FormLabel>
                        <FormControl>
                          {isCustomMake ? (
                            <Input 
                              placeholder="Enter make manually" 
                              className="h-8" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          ) : (
                            <Select onValueChange={(value) => handleMakeChange(value, field.onChange)} value={field.value}>
                              <SelectTrigger className="h-8">
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
                        <FormLabel className="text-xs">Model *</FormLabel>
                        <FormControl>
                          {isCustomModel ? (
                            <Input 
                              placeholder="Enter model manually" 
                              className="h-8" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          ) : (
                            <Select onValueChange={(value) => handleModelChange(value, field.onChange)} value={field.value} disabled={!watchedMake && !isCustomMake}>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                              <SelectContent>
                                {watchedMake && getModelsForMake(watchedMake, watchedVehicleType || "4-wheeler").map((model) => (
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

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Year *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2024" 
                            className="h-8"
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
                        <FormLabel className="text-xs">Color *</FormLabel>
                        <FormControl>
                          {isCustomColor ? (
                            <Input 
                              placeholder="Enter color manually" 
                              className="h-8" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.trim())}
                            />
                          ) : (
                            <Select onValueChange={handleColorChange} value={field.value}>
                              <SelectTrigger className="h-8">
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
                </div>

                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">License Plate *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="DL 01 AB 1234" 
                          className="h-8"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Fuel Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger className="h-8">
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

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="chassisNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Chassis Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="MAT123456789" 
                            className="h-8"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
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
                        <FormLabel className="text-xs">Engine Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ENG987654321" 
                            className="h-8"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Owner Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          className="h-8"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
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
                      <FormLabel className="text-xs">Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+1 234 567 8900" 
                          className="h-8"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />







                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1 h-8"
                    onClick={() => setLocation("/")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-8"
                    disabled={updateVehicleMutation.isPending}
                  >
                    <Save className="w-3 h-3 mr-1" />
                    {updateVehicleMutation.isPending ? "Updating..." : "Update Vehicle"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}