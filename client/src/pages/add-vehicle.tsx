import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Car, Save, FileText, Calendar, Camera } from "lucide-react";
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
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function AddVehicle() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMake, setSelectedMake] = useState<string>("");
  
  // Document states for different types
  const [emissionDocuments, setEmissionDocuments] = useState<File[]>([]);
  const [rcDocuments, setRcDocuments] = useState<File[]>([]);
  const [insuranceDocuments, setInsuranceDocuments] = useState<File[]>([]);
  const [serviceDocuments, setServiceDocuments] = useState<File[]>([]);

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
      // Clean up date fields - convert empty strings to null
      const cleanedData = {
        ...data,
        insuranceExpiry: data.insuranceExpiry?.trim() || null,
        emissionExpiry: data.emissionExpiry?.trim() || null,
        rcExpiry: data.rcExpiry?.trim() || null,
      };
      const response = await apiRequest("POST", "/api/vehicles", cleanedData);
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
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertVehicle) => {
    createVehicleMutation.mutate(data);
  };

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
              onClick={() => setLocation("/")}
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
              <p className="text-xs text-white/80">Add Vehicle</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        <Card className="card-hover shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Car className="w-5 h-5 text-red-600" />
              <span>Vehicle Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Select onValueChange={handleMakeChange} value={field.value}>
                            <SelectTrigger>
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
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchedMake}>
                            <SelectTrigger>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
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
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input placeholder="Red" {...field} />
                        </FormControl>
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
                      <FormLabel>License Plate</FormLabel>
                      <FormControl>
                        <Input placeholder="DL 01 AB 1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="chassisNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chassis Number</FormLabel>
                        <FormControl>
                          <Input placeholder="MAT123456789" {...field} />
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
                        <FormLabel>Engine Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ENG987654321" {...field} />
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
                      <FormLabel>Owner Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 8900" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rcExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RC Expiry</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createVehicleMutation.isPending}
                >
                  {createVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
                </Button>
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
    </div>
  );
}
