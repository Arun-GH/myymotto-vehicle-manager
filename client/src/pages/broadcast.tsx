import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Plus, MessageSquare, Eye, Calendar, User, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBroadcastSchema } from "@shared/schema";
import { z } from "zod";
import ColorfulLogo from "@/components/colorful-logo";

const broadcastFormSchema = z.object({
  type: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  contactPhone: z.string().min(10, "Valid phone number required"),
  contactEmail: z.string().email().optional().or(z.literal("")),
  price: z.number().optional(),
  location: z.string().optional(),
});

type BroadcastFormData = z.infer<typeof broadcastFormSchema>;

export default function BroadcastPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [selectedVehicleForSell, setSelectedVehicleForSell] = useState<any>(null);

  const form = useForm<BroadcastFormData>({
    resolver: zodResolver(broadcastFormSchema),
    defaultValues: {
      type: "general",
      title: "",
      description: "",
      contactPhone: "",
      contactEmail: "",
      price: undefined,
      location: "",
    },
  });

  // Fetch all broadcasts
  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ["/api/broadcasts"],
  });

  // Fetch user vehicles for selling
  const { data: userVehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  // Create broadcast mutation
  const createBroadcastMutation = useMutation({
    mutationFn: async (data: BroadcastFormData & { vehicleId?: number }) => {
      return apiRequest("POST", "/api/broadcasts", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your broadcast has been posted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts"] });
      setShowCreateDialog(false);
      setSelectedVehicleForSell(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create broadcast",
        variant: "destructive",
      });
    },
  });

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicleForSell(vehicle);
    setShowVehicleSelector(false);
    // Pre-fill form with selling information
    form.setValue("type", "sell");
    form.setValue("title", `${vehicle.make} ${vehicle.model} ${vehicle.year} for Sale`);
    form.setValue("description", `Selling my ${vehicle.make} ${vehicle.model} ${vehicle.year}. Well maintained vehicle.`);
  };

  const onSubmit = (data: BroadcastFormData) => {
    const broadcastData = {
      type: data.type,
      title: data.title,
      description: data.description,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail || undefined,
      price: data.price || null,
      location: data.location || null,
      vehicleId: selectedVehicleForSell?.id || null,
    };
    createBroadcastMutation.mutate(broadcastData);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getBroadcastTypeIcon = (type: string) => {
    switch (type) {
      case "sell":
        return <Car className="w-4 h-4 text-orange-600" />;
      case "buy":
        return <Eye className="w-4 h-4 text-blue-600" />;
      case "query":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBroadcastTypeLabel = (type: string) => {
    switch (type) {
      case "sell": return "Vehicle for Sale";
      case "buy": return "Looking to Buy";
      case "query": return "Community Query";
      default: return "General Post";
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="header-gradient-border px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-gray-600 hover:bg-red-50 p-1 h-6 w-6"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <ColorfulLogo className="w-8 h-8" />
          <div>
            <h1 className="text-sm font-semibold text-gray-800">Broadcast</h1>
            <p className="text-[10px] text-red-600">Community for MMians</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white h-7 px-2 text-[10px]"
        >
          <Plus className="w-3 h-3 mr-1" />
          Post
        </Button>
      </div>

      {/* Content */}
      <div className="px-3 py-3 space-y-3">
        {broadcasts.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No broadcasts yet</h3>
            <p className="text-xs text-gray-500 mb-4">Be the first to share with the MMian community!</p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Create First Post
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {broadcasts.map((broadcast: any) => (
              <Card key={broadcast.id} className="shadow-orange border-orange-100">
                <CardHeader className="pb-1 px-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {getBroadcastTypeIcon(broadcast.type)}
                      <span className="text-[10px] font-medium text-gray-600">
                        {getBroadcastTypeLabel(broadcast.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-400">
                      <Calendar className="w-2 h-2" />
                      {formatDate(broadcast.createdAt)}
                    </div>
                  </div>
                  <CardTitle className="text-sm text-gray-900 leading-tight">{broadcast.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 pb-2">
                  <p className="text-xs text-gray-700 mb-2 leading-tight">{broadcast.description}</p>
                  
                  {/* Vehicle Details for Sell Posts */}
                  {broadcast.type === "sell" && broadcast.vehicle && (
                    <div className="bg-orange-50 rounded-lg p-2 mb-2">
                      <h4 className="text-[10px] font-semibold text-orange-800 mb-1 flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        Vehicle Details
                      </h4>
                      <div className="grid grid-cols-3 gap-1 text-[9px]">
                        <div className="bg-white rounded p-1">
                          <span className="text-gray-500 block leading-none">Model</span>
                          <span className="font-medium text-gray-800 leading-tight">{broadcast.vehicle.make} {broadcast.vehicle.model}</span>
                        </div>
                        <div className="bg-white rounded p-1">
                          <span className="text-gray-500 block leading-none">Year</span>
                          <span className="font-medium text-gray-800 leading-tight">{broadcast.vehicle.year}</span>
                        </div>
                        <div className="bg-white rounded p-1">
                          <span className="text-gray-500 block leading-none">Fuel</span>
                          <span className="font-medium text-gray-800 leading-tight capitalize">{broadcast.vehicle.fuelType || 'Petrol'}</span>
                        </div>
                        <div className="bg-white rounded p-1">
                          <span className="text-gray-500 block leading-none">Registration</span>
                          <span className="font-medium text-gray-800 leading-tight">{broadcast.vehicle.licenseNumber}</span>
                        </div>
                        <div className="bg-white rounded p-1">
                          <span className="text-gray-500 block leading-none">Km Run</span>
                          <span className="font-medium text-gray-800 leading-tight">{broadcast.vehicle.currentOdometerReading?.toLocaleString() || 'N/A'} km</span>
                        </div>
                        <div className="bg-white rounded p-1">
                          <span className="text-gray-500 block leading-none">Insured Date</span>
                          <span className="font-medium text-gray-800 leading-tight">{broadcast.vehicle.insuranceExpiry ? formatDate(broadcast.vehicle.insuranceExpiry) : 'N/A'}</span>
                        </div>
                        <div className="bg-white rounded p-1 col-span-2">
                          <span className="text-gray-500 block leading-none">RC Valid Till</span>
                          <span className="font-medium text-gray-800 leading-tight">{broadcast.vehicle.rcExpiry ? formatDate(broadcast.vehicle.rcExpiry) : 'N/A'}</span>
                        </div>
                        {broadcast.vehicle.thumbnailPath && (
                          <div className="bg-white rounded p-1">
                            <span className="text-gray-500 block leading-none mb-1">Photo</span>
                            <img 
                              src={`/uploads/${broadcast.vehicle.thumbnailPath}`} 
                              alt="Vehicle" 
                              className="w-full h-8 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact and Price Info */}
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      {broadcast.contactPhone && (
                        <span className="text-gray-600 bg-gray-50 px-1 py-0.5 rounded">📞 {broadcast.contactPhone}</span>
                      )}
                      {broadcast.location && (
                        <span className="text-gray-600 bg-gray-50 px-1 py-0.5 rounded">📍 {broadcast.location}</span>
                      )}
                    </div>
                    {broadcast.price && (
                      <span className="font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded">
                        ₹{broadcast.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* View Count */}
                  <div className="flex items-center justify-end mt-1 pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400">
                      <Eye className="w-2 h-2" />
                      {broadcast.viewCount || 0} views
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Broadcast Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[95%] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Create Broadcast</DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              Share your message with the MMian community
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Broadcast Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General Post</SelectItem>
                        <SelectItem value="sell">Vehicle for Sale</SelectItem>
                        <SelectItem value="buy">Looking to Buy</SelectItem>
                        <SelectItem value="query">Community Query</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vehicle Selection for Sell Type */}
              {form.watch("type") === "sell" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Select Vehicle to Sell</label>
                  {selectedVehicleForSell ? (
                    <div className="bg-orange-50 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {selectedVehicleForSell.make} {selectedVehicleForSell.model} {selectedVehicleForSell.year}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedVehicleForSell(null)}
                        className="h-6 text-xs text-gray-500"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowVehicleSelector(true)}
                      className="w-full h-8 text-xs"
                    >
                      <Car className="w-3 h-3 mr-1" />
                      Choose Vehicle
                    </Button>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief title for your post" className="h-8 text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description..."
                        className="min-h-[60px] text-xs resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" className="h-8 text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" className="h-8 text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City" className="h-8 text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {(form.watch("type") === "sell" || form.watch("type") === "buy") && (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          {form.watch("type") === "sell" ? "Expected Price (₹)" : "Budget (₹)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            className="h-8 text-xs"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setSelectedVehicleForSell(null);
                    form.reset();
                  }}
                  className="flex-1 h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createBroadcastMutation.isPending || (form.watch("type") === "sell" && !selectedVehicleForSell)}
                  className="flex-1 h-8 text-xs bg-orange-500 hover:bg-orange-600"
                >
                  {createBroadcastMutation.isPending ? "Posting..." : "Post Broadcast"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Vehicle Selector Dialog */}
      <Dialog open={showVehicleSelector} onOpenChange={setShowVehicleSelector}>
        <DialogContent className="w-[95%] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Car className="w-4 h-4 text-orange-600" />
              Select Vehicle to Sell
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              Choose which vehicle you want to sell on broadcast
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {userVehicles.length === 0 ? (
              <div className="text-center py-6">
                <Car className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Add a vehicle first to sell it on broadcast.</p>
              </div>
            ) : (
              userVehicles.map((vehicle: any) => (
                <div
                  key={vehicle.id}
                  onClick={() => handleVehicleSelect(vehicle)}
                  className="p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {vehicle.thumbnailPath ? (
                      <img 
                        src={`/uploads/${vehicle.thumbnailPath}`}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-800">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {vehicle.year} • {vehicle.licensePlate}
                      </p>
                      <p className="text-xs text-gray-500">
                        {vehicle.fuelType} • {vehicle.vehicleType}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}