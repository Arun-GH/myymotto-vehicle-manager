import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Calendar, MapPin, NotebookPen, Upload, Camera, Save, Wrench } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ColorfulLogo from "@/components/colorful-logo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Vehicle } from "@shared/schema";
import { formatForDatabase } from "@/lib/date-format";
import { useState, useRef } from "react";
import logoImage from "@assets/Mymotto_Logo_Green_Revised_1752603344750.png";

// Common 4-wheeler service types for dropdown
const fourWheelerServiceTypes = [
  'Engine Oil Change',
  'Oil Filter Replacement', 
  'Air Filter Replacement',
  'Brake Service & Inspection',
  'Brake Pad Replacement',
  'Brake Fluid Change',
  'Transmission Service',
  'Coolant System Service',
  'AC Service & Regassing',
  'Battery Check & Replacement',
  'Battery Replacement',
  'Tire Rotation & Balancing',
  'Tyre Replacement',
  'Wheel Alignment',
  'Suspension Service',
  'Spark Plug Replacement',
  'Timing Belt Service',
  'General Service (Paid)',
  'Free Service',
  'Car Wash & Detailing',
  'Engine Tune-up',
  'Clutch Service',
  'Radiator Service',
  'Exhaust System Service',
  'Power Steering Service',
  'Fuel System Cleaning',
  'Electrical System Check',
  'Body Work & Painting',
  'Denting & Painting',
  'Insurance Claim Work',
  'Other (Please specify)'
];

// Common 2-wheeler service types for dropdown
const twoWheelerServiceTypes = [
  'Engine Oil Change',
  'Oil Filter Replacement',
  'Air Filter Cleaning/Replacement',
  'Brake Service (Front/Rear)',
  'Brake Pad Replacement',
  'Chain Cleaning & Lubrication',
  'Chain Adjustment',
  'Chain Replacement',
  'Sprocket Replacement',
  'Spark Plug Replacement',
  'Battery Service/Replacement',
  'Tire Replacement (Front/Rear)',
  'Tube Replacement',
  'Puncture Repair',
  'Carburetor Cleaning',
  'Fuel Injector Cleaning',
  'General Service (Paid)',
  'Free Service',
  'Clutch Plate Replacement',
  'Clutch Cable Adjustment',
  'Gear Oil Change',
  'Brake Oil Change',
  'Suspension Service',
  'Fork Oil Change',
  'Shock Absorber Service',
  'Headlight/Taillight Service',
  'Horn & Electrical Check',
  'Speedometer Service',
  'Exhaust Service/Repair',
  'Engine Tuning',
  'Carburetor Tuning',
  'Washing & Cleaning',
  'Insurance Claim Work',
  'Accident Repair',
  'Engine Overhaul/Rebore',
  'Other (Please specify)'
];

// Common 3-wheeler service types for dropdown
const threeWheelerServiceTypes = [
  'Engine Oil Change',
  'Oil Filter Replacement',
  'Air Filter Replacement',
  'Brake Service & Inspection',
  'Brake Pad Replacement',
  'Brake Fluid Change',
  'Transmission Service',
  'Clutch Service & Adjustment',
  'Battery Check & Replacement',
  'Tire Replacement',
  'Wheel Alignment',
  'Suspension Service',
  'Spark Plug Replacement',
  'General Service (Paid)',
  'Free Service',
  'Chain/Belt Drive Service',
  'Fuel System Cleaning',
  'Electrical System Check',
  'Cooling System Service',
  'Carburetor Service',
  'Horn & Light Check',
  'Speedometer Service',
  'Body Work & Repairs',
  'Insurance Claim Work',
  'Accident Repair',
  'Engine Overhaul',
  'Other (Please specify)'
];

const serviceLogSchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  serviceDate: z.string().min(1, "Service date is required"),
  serviceCentre: z.string().min(1, "Service centre is required"),
  billAmount: z.number().positive("Bill amount must be positive").optional().nullable(),
  serviceIntervalMonths: z.number().min(1, "Service interval must be at least 1 month").max(24, "Service interval cannot exceed 24 months").optional().nullable(),
  notes: z.string().optional(),
});

type ServiceLogForm = z.infer<typeof serviceLogSchema>;

export default function AddServiceLog() {
  const { id: vehicleId } = useParams() as { id: string };
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCustomServiceInput, setShowCustomServiceInput] = useState(false);

  // Get service type from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedServiceType = urlParams.get('serviceType') || "";

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`],
  });

  const form = useForm<ServiceLogForm>({
    resolver: zodResolver(serviceLogSchema),
    defaultValues: {
      serviceType: preSelectedServiceType,
      serviceDate: "",
      serviceCentre: "",
      billAmount: null,
      serviceIntervalMonths: null,
      notes: "",
    },
  });

  const createServiceLog = useMutation({
    mutationFn: async (data: ServiceLogForm & { invoice?: File }) => {
      const formData = new FormData();
      formData.append("vehicleId", vehicleId);
      formData.append("serviceType", data.serviceType);
      formData.append("serviceDate", data.serviceDate || "");
      formData.append("serviceCentre", data.serviceCentre);
      if (data.billAmount !== null && data.billAmount !== undefined) {
        formData.append("billAmount", (data.billAmount * 100).toString()); // Convert to paise
      }
      if (data.serviceIntervalMonths !== null && data.serviceIntervalMonths !== undefined) {
        formData.append("serviceIntervalMonths", data.serviceIntervalMonths.toString());
      }
      if (data.notes) formData.append("notes", data.notes);
      if (data.invoice) formData.append("invoice", data.invoice);

      const response = await fetch("/api/service-logs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create service log");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-logs/${vehicleId}`] });
      toast({
        title: "Service Log Added",
        description: "Service log has been added successfully.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add service log",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      setIsCapturing(true);
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
      setIsCapturing(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: ServiceLogForm) => {
    createServiceLog.mutate({
      ...data,
      invoice: selectedFile || undefined,
    });
  };

  if (vehicleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-red-50 p-1">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Add Service Log</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-md p-4 space-y-4">
        {/* Vehicle Info */}
        {vehicle && (
          <Card className="shadow-orange">
            <CardContent className="p-4">
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800">
                  {vehicle.make?.toUpperCase()} {vehicle.model?.toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Service Log Form */}
        <Card className="shadow-orange">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Wrench className="w-5 h-5 text-green-600" />
              <span>Service Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Service Type */}
              <div className="space-y-2">
                <Label htmlFor="serviceType" className="text-sm font-medium text-gray-700">
                  Service Type *
                </Label>
                {['4-wheeler', '2-wheeler', '3-wheeler'].includes(vehicle?.vehicleType || '') ? (
                  <div className="space-y-2">
                    <Select 
                      value={showCustomServiceInput ? 'Other (Please specify)' : form.watch("serviceType")} 
                      onValueChange={(value) => {
                        if (value === 'Other (Please specify)') {
                          setShowCustomServiceInput(true);
                          form.setValue("serviceType", "");
                        } else {
                          setShowCustomServiceInput(false);
                          form.setValue("serviceType", value);
                        }
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select service type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          if (vehicle?.vehicleType === '4-wheeler') return fourWheelerServiceTypes;
                          if (vehicle?.vehicleType === '2-wheeler') return twoWheelerServiceTypes;
                          if (vehicle?.vehicleType === '3-wheeler') return threeWheelerServiceTypes;
                          return [];
                        })().map((serviceType) => (
                          <SelectItem key={serviceType} value={serviceType}>
                            {serviceType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showCustomServiceInput && (
                      <Input
                        {...form.register("serviceType")}
                        placeholder="Enter custom service type..."
                        className="h-9"
                      />
                    )}
                  </div>
                ) : (
                  <Input
                    id="serviceType"
                    placeholder="e.g., Oil Change, Brake Service, General Service"
                    className="h-9"
                    {...form.register("serviceType", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toUpperCase();
                      }
                    })}
                  />
                )}
                {form.formState.errors.serviceType && (
                  <p className="text-sm text-red-600">{form.formState.errors.serviceType.message}</p>
                )}
              </div>

              {/* Service Date */}
              <div className="space-y-2">
                <Label htmlFor="serviceDate" className="text-sm font-medium text-gray-700">
                  Service Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="serviceDate"
                    type="date"
                    className="h-9 pl-10"
                    {...form.register("serviceDate")}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {form.formState.errors.serviceDate && (
                  <p className="text-sm text-red-600">{form.formState.errors.serviceDate.message}</p>
                )}
              </div>

              {/* Bill Amount */}
              <div className="space-y-2">
                <Label htmlFor="billAmount" className="text-sm font-medium text-gray-700">
                  Bill Amount (₹)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <Input
                    id="billAmount"
                    type="number"
                    className="h-9 pl-8"
                    {...form.register("billAmount", { 
                      setValueAs: (v: string) => v === "" ? null : parseFloat(v) 
                    })}
                    placeholder="Enter service bill amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                {form.formState.errors.billAmount && (
                  <p className="text-sm text-red-600">{form.formState.errors.billAmount.message}</p>
                )}
              </div>

              {/* Service Interval Fields - Only for General Service (Paid) */}
              {form.watch("serviceType") === "General Service (Paid)" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="serviceIntervalMonths" className="text-sm font-medium text-gray-700">
                      Months to Next Service
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="serviceIntervalMonths"
                        type="number"
                        className="h-9 pl-10"
                        {...form.register("serviceIntervalMonths", { 
                          setValueAs: (v: string) => v === "" ? null : parseInt(v) 
                        })}
                        placeholder="e.g., 6"
                        min="1"
                        max="24"
                      />
                    </div>
                    {form.formState.errors.serviceIntervalMonths && (
                      <p className="text-sm text-red-600">{form.formState.errors.serviceIntervalMonths.message}</p>
                    )}
                  </div>

                  {/* Calculated Next Service Date */}
                  {form.watch("serviceDate") && form.watch("serviceIntervalMonths") && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Next Service Date (Calculated)</Label>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800 font-medium">
                            {(() => {
                              const serviceDate = form.watch("serviceDate");
                              const intervalMonths = form.watch("serviceIntervalMonths");
                              if (serviceDate && intervalMonths) {
                                const date = new Date(serviceDate);
                                date.setMonth(date.getMonth() + intervalMonths);
                                return date.toLocaleDateString('en-GB', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                });
                              }
                              return "";
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Service Centre */}
              <div className="space-y-2">
                <Label htmlFor="serviceCentre" className="text-sm font-medium text-gray-700">
                  Service Centre *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="serviceCentre"
                    placeholder="e.g., Maruti Service Center, Local Garage"
                    className="h-9 pl-10"
                    {...form.register("serviceCentre", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toUpperCase();
                      }
                    })}
                  />
                </div>
                {form.formState.errors.serviceCentre && (
                  <p className="text-sm text-red-600">{form.formState.errors.serviceCentre.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes
                </Label>
                <div className="relative">
                  <NotebookPen className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about the service..."
                    className="pl-10 min-h-[80px]"
                    {...form.register("notes")}
                  />
                </div>
              </div>

              {/* Invoice Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Invoice/Warranty cards (Optional)</Label>
                
                {/* File input (hidden) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Upload className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">
                          {selectedFile.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        ✕
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      File selected ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCameraCapture}
                      className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                      disabled={isCapturing}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Camera
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={createServiceLog.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {createServiceLog.isPending ? "Saving..." : "Save Service Log"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}