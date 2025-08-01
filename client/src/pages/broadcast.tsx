import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Plus, MessageSquare, Eye, Calendar, User, Car, Trash2, Radio } from "lucide-react";
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
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

const broadcastFormSchema = z.object({
  type: z.string(),
  title: z.string().optional(), // Made optional since buy posts auto-generate title
  description: z.string()
    .min(1, "Description is required")
    .refine((val) => {
      const wordCount = val.trim().split(/\s+/).filter(word => word.length > 0).length;
      return wordCount <= 75;
    }, "Description must be 75 words or less"),
  contactPhone: z.string().min(10, "Valid phone number required"),
  contactEmail: z.string().email().optional().or(z.literal("")),
  price: z.number().optional(),
  location: z.string().optional(),
});

type BroadcastFormData = z.infer<typeof broadcastFormSchema>;

export default function BroadcastPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get current user ID from localStorage
  const currentUserId = parseInt(localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1");
  
  // Check if this is view-only mode from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isViewOnly = urlParams.get('view') === 'only';
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [selectedVehicleForSell, setSelectedVehicleForSell] = useState<any>(null);
  const [broadcastToDelete, setBroadcastToDelete] = useState<number | null>(null);

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

  // Function to auto-populate form with user profile data
  const initializeFormWithProfile = () => {
    if (userProfile && typeof userProfile === 'object') {
      const profile = userProfile as any;
      form.setValue("contactPhone", profile.alternatePhone || "");
      form.setValue("contactEmail", profile.email || "");
      form.setValue("location", profile.city || "");
    }
  };

  // Fetch all broadcasts
  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ["/api/broadcasts"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/broadcasts?userId=${currentUserId}`);
      return response.json();
    },
  });

  // Fetch user vehicles for selling
  const { data: userVehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles?userId=${currentUserId}`);
      return response.json();
    },
  });

  // Fetch user profile for auto-populating contact details
  const { data: userProfile } = useQuery({
    queryKey: [`/api/profile/${currentUserId}`],
  });

  // Auto-populate form with profile data when available
  useEffect(() => {
    if (userProfile && typeof userProfile === 'object') {
      const profile = userProfile as any;
      // Always populate contact fields when dialog opens or data becomes available
      if (profile.alternatePhone) {
        form.setValue("contactPhone", profile.alternatePhone, { shouldValidate: false });
      }
      if (profile.email) {
        form.setValue("contactEmail", profile.email, { shouldValidate: false });
      }
      if (profile.city) {
        form.setValue("location", profile.city, { shouldValidate: false });
      }
    }
  }, [userProfile, form]);

  // Auto-populate when type changes to "buy" or "query"
  useEffect(() => {
    if ((form.watch("type") === "buy" || form.watch("type") === "query") && userProfile && typeof userProfile === 'object') {
      const profile = userProfile as any;
      // Ensure contact details are always populated for buy and query posts
      if (profile.alternatePhone) {
        form.setValue("contactPhone", profile.alternatePhone, { shouldValidate: false });
      }
      if (profile.email) {
        form.setValue("contactEmail", profile.email, { shouldValidate: false });
      }
      if (profile.city) {
        form.setValue("location", profile.city, { shouldValidate: false });
      }
    }
  }, [form.watch("type"), userProfile, form]);

  // Auto-populate when dialog opens
  useEffect(() => {
    if (showCreateDialog && userProfile && typeof userProfile === 'object') {
      const profile = userProfile as any;
      // Auto-fill contact details when dialog opens
      setTimeout(() => {
        if (profile.alternatePhone) {
          form.setValue("contactPhone", profile.alternatePhone, { shouldValidate: false });
        }
        if (profile.email) {
          form.setValue("contactEmail", profile.email, { shouldValidate: false });
        }
        if (profile.city) {
          form.setValue("location", profile.city, { shouldValidate: false });
        }
      }, 100); // Small delay to ensure form is ready
    }
  }, [showCreateDialog, userProfile, form]);

  // Create broadcast mutation
  const createBroadcastMutation = useMutation({
    mutationFn: async (data: BroadcastFormData & { vehicleId?: number }) => {
      return apiRequest("POST", "/api/broadcasts", { ...data, userId: currentUserId });
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

  // Delete broadcast mutation
  const deleteBroadcastMutation = useMutation({
    mutationFn: async (broadcastId: number) => {
      return apiRequest("DELETE", `/api/broadcasts/${broadcastId}?userId=${currentUserId}`);
    },
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Your broadcast has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete broadcast",
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
    // Auto-generate title for "buy" posts
    const title = data.type === "buy" 
      ? "Looking for a Vehicle" 
      : data.title;

    const broadcastData = {
      type: data.type,
      title: title,
      description: data.description,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail || undefined,
      price: data.price || undefined,
      location: data.location || undefined,
      vehicleId: selectedVehicleForSell?.id || undefined,
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
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLocation("/")}
                className="text-gray-600 hover:text-gray-800 hover:bg-red-50 p-1 rounded-full mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Community for MMians</p>
              </div>
            </div>
            {!isViewOnly && (
              <Button
                onClick={() => {
                  initializeFormWithProfile();
                  setShowCreateDialog(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create Post
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-3 py-3 space-y-3">
        {(broadcasts as any[]).length === 0 ? (
          <div className="text-center py-8">
            <Radio className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No broadcasts yet</h3>
            <p className="text-xs text-gray-500 mb-4">{isViewOnly ? "Check back later for new posts from the MMian community!" : "Be the first to share with the MMian community!"}</p>
            {!isViewOnly && (
              <Button
                onClick={() => {
                  initializeFormWithProfile();
                  setShowCreateDialog(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {(broadcasts as any[]).map((broadcast: any) => (
              <Card key={broadcast.id} className="shadow-orange border-orange-100">
                <CardHeader className="pb-1 px-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {getBroadcastTypeIcon(broadcast.type)}
                      <span className="text-xs font-medium text-gray-600">
                        {getBroadcastTypeLabel(broadcast.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[9px] text-gray-400">
                        <Calendar className="w-2 h-2" />
                        {formatDate(broadcast.createdAt)}
                      </div>
                      {/* Show delete button only for user's own posts */}
                      {broadcast.userId === currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setBroadcastToDelete(broadcast.id);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-auto w-auto"
                          disabled={deleteBroadcastMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
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
                          <span className="text-gray-500 block leading-none">Color</span>
                          <span className="font-medium text-gray-800 leading-tight capitalize">{broadcast.vehicle.color || 'N/A'}</span>
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

      {/* Create Broadcast Dialog - Hidden in view-only mode */}
      {!isViewOnly && (
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[90%] max-w-md mx-auto max-h-[85vh] overflow-y-auto p-6 rounded-xl shadow-2xl bg-white border-0">
          <DialogHeader className="pb-4 text-center">
            <DialogTitle className="text-lg font-bold flex items-center justify-center gap-2 text-gray-800">
              <Radio className="w-5 h-5 text-orange-600" />
              Create New Post
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-2 leading-relaxed">
              Share your thoughts, questions, or vehicle listings with the Myymotto community
            </DialogDescription>
            
            {/* Community Guidelines Disclaimer */}
            <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="text-left">
                  <p className="text-xs font-medium text-red-800 mb-1">Community Guidelines</p>
                  <p className="text-[10px] text-red-700 leading-relaxed">
                    Please avoid posts containing illegal content or content against any Religion, Caste, Creed, Gender, or Nationality. 
                    Keep our community respectful and inclusive for all members.
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Post Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                          <SelectValue placeholder="Choose your post type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-50">
                        <SelectItem value="general">💬 General Post</SelectItem>
                        <SelectItem value="sell">🚗 Vehicle for Sale</SelectItem>
                        <SelectItem value="buy">🔍 Looking to Buy</SelectItem>
                        <SelectItem value="query">❓ Community Query</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Vehicle Selection for Sell Type */}
              {form.watch("type") === "sell" && (
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold text-gray-700">Vehicle to Sell</label>
                  {selectedVehicleForSell ? (
                    <div className="bg-orange-50 rounded-lg p-3 flex items-center justify-between border border-orange-200">
                      <span className="text-sm font-medium text-gray-800">
                        {selectedVehicleForSell.make} {selectedVehicleForSell.model} {selectedVehicleForSell.year}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedVehicleForSell(null)}
                        className="h-8 text-xs text-orange-600 hover:text-orange-700 px-3"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowVehicleSelector(true)}
                      className="w-full h-11 text-sm border-dashed border-2 border-gray-300 hover:border-orange-400"
                    >
                      <Car className="w-4 h-4 mr-2" />
                      Select Vehicle to Sell
                    </Button>
                  )}
                </div>
              )}

              {/* Title field - hidden for "buy" type */}
              {form.watch("type") !== "buy" && (
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            form.watch("type") === "query" 
                              ? "Your question or topic" 
                              : "Brief title for your post"
                          } 
                          className="h-11 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  const wordCount = field.value ? field.value.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
                  const maxWords = 75;
                  
                  return (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          {form.watch("type") === "buy" ? "Vehicle Requirements" : 
                           form.watch("type") === "query" ? "Your Question" : "Description"}
                        </FormLabel>
                        <span className={`text-xs ${wordCount > maxWords ? 'text-red-500' : 'text-gray-500'}`}>
                          {wordCount}/{maxWords} words
                        </span>
                      </div>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            form.watch("type") === "buy" 
                              ? "Describe what vehicle you're looking for (make, model, year, budget, etc.)"
                              : form.watch("type") === "query"
                              ? "Ask your question or describe your query to the MMian community..."
                              : "Detailed description..."
                          }
                          className="min-h-[80px] text-sm resize-none border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          {...field}
                          onChange={(e) => {
                            const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0);
                            if (words.length <= maxWords || e.target.value === '') {
                              field.onChange(e);
                            }
                          }}
                        />
                      </FormControl>
                      {wordCount > maxWords && (
                        <p className="text-xs text-red-500">Description must be 75 words or less</p>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  );
                }}
              />

              {/* Contact Details for Buy and Query posts */}
              {(form.watch("type") === "buy" || form.watch("type") === "query") && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" className="h-11 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" className="h-11 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Contact Details for other post types */}
              {form.watch("type") !== "buy" && form.watch("type") !== "query" && (
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-medium">Contact Phone (auto-filled)</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" className="h-7 text-[10px]" {...field} />
                        </FormControl>
                        <FormMessage className="text-[9px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-medium">Email (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" className="h-7 text-[10px]" {...field} />
                        </FormControl>
                        <FormMessage className="text-[9px]" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City" className="h-11 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {form.watch("type") === "sell" && (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Amount"
                            className="h-11 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setSelectedVehicleForSell(null);
                    form.reset();
                  }}
                  className="flex-1 h-12 text-sm border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createBroadcastMutation.isPending || (form.watch("type") === "sell" && !selectedVehicleForSell)}
                  className="flex-1 h-12 text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg"
                >
                  {createBroadcastMutation.isPending ? "Posting..." : 
                   form.watch("type") === "buy" ? "🔍 Post Request" :
                   form.watch("type") === "sell" ? "🚗 List Vehicle" :
                   form.watch("type") === "query" ? "❓ Ask Community" : "📝 Share Post"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      )}

      {/* Vehicle Selector Dialog */}
      <Dialog open={showVehicleSelector} onOpenChange={setShowVehicleSelector}>
        <DialogContent className="w-[96%] max-w-sm mx-auto max-h-[70vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm flex items-center gap-2">
              <Car className="w-3 h-3 text-orange-600" />
              Select Vehicle to Sell
            </DialogTitle>
            <DialogDescription className="text-[10px] text-gray-600">
              Choose which vehicle you want to sell
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {(userVehicles as any[]).length === 0 ? (
              <div className="text-center py-4">
                <Car className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                <p className="text-[10px] text-gray-600">Add a vehicle first to sell it on broadcast.</p>
              </div>
            ) : (
              (userVehicles as any[]).map((vehicle: any) => (
                <div
                  key={vehicle.id}
                  onClick={() => handleVehicleSelect(vehicle)}
                  className="p-2 bg-orange-50 rounded border border-orange-100 hover:bg-orange-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {vehicle.thumbnailPath ? (
                      <img 
                        src={`/uploads/${vehicle.thumbnailPath}`}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded flex items-center justify-center">
                        <Car className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-[10px] text-gray-800 leading-tight">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-[9px] text-gray-600 leading-tight">
                        {vehicle.year} • {vehicle.licensePlate}
                      </p>
                      <p className="text-[9px] text-gray-500 leading-tight">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={broadcastToDelete !== null} onOpenChange={() => setBroadcastToDelete(null)}>
        <DialogContent className="w-[90%] max-w-xs mx-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm text-red-600">Delete Post</DialogTitle>
            <DialogDescription className="text-[10px] text-gray-600">
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBroadcastToDelete(null)}
              className="flex-1 h-7 text-[10px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (broadcastToDelete) {
                  deleteBroadcastMutation.mutate(broadcastToDelete);
                  setBroadcastToDelete(null);
                }
              }}
              disabled={deleteBroadcastMutation.isPending}
              className="flex-1 h-7 text-[10px] bg-red-500 hover:bg-red-600"
            >
              {deleteBroadcastMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}