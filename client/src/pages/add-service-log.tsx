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
import ColorfulLogo from "@/components/colorful-logo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Vehicle } from "@shared/schema";
import { useState, useRef } from "react";

const serviceLogSchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  serviceDate: z.string().min(1, "Service date is required"),
  serviceCentre: z.string().min(1, "Service centre is required"),
  notes: z.string().optional(),
});

type ServiceLogForm = z.infer<typeof serviceLogSchema>;

export default function AddServiceLog() {
  const { vehicleId } = useParams() as { vehicleId: string };
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`],
  });

  const form = useForm<ServiceLogForm>({
    resolver: zodResolver(serviceLogSchema),
    defaultValues: {
      serviceType: "",
      serviceDate: "",
      serviceCentre: "",
      notes: "",
    },
  });

  const createServiceLog = useMutation({
    mutationFn: async (data: ServiceLogForm & { invoice?: File }) => {
      const formData = new FormData();
      formData.append("vehicleId", vehicleId);
      formData.append("serviceType", data.serviceType);
      formData.append("serviceDate", data.serviceDate);
      formData.append("serviceCentre", data.serviceCentre);
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
      setLocation(`/vehicle/${vehicleId}/service-logs`);
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
      <header className="header-gradient-border shadow-lg relative px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/vehicle/${vehicleId}/service-logs`}>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-red-50 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center space-x-2">
              <ColorfulLogo className="w-14 h-14" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Add Service Log</h1>
                <p className="text-sm text-red-600">Timely Care for your carrier</p>
              </div>
            </div>
          </div>

          <div className="w-8" /> {/* Spacer for centering */}
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
                  />
                </div>
                {form.formState.errors.serviceDate && (
                  <p className="text-sm text-red-600">{form.formState.errors.serviceDate.message}</p>
                )}
              </div>

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
                <Label className="text-sm font-medium text-gray-700">Service Invoice</Label>
                
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