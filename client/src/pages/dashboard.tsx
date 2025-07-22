import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Car, Camera, Search, Bell, Plus, FileText, AlertTriangle, CheckCircle, Clock, Users, Zap, Shield, Settings, Gamepad2, Puzzle, Newspaper, Files, Wrench, Radio } from "lucide-react";
import { Link } from "wouter";
import { type Vehicle } from "@shared/schema";
import VehicleCard from "@/components/vehicle-card";
import { apiRequest } from "@/lib/queryClient";

import BottomNav from "@/components/bottom-nav";
import FloatingActionButton from "@/components/floating-action-button";
import NotificationBell from "@/components/notification-bell";
import InfoDropdown from "@/components/info-dropdown";
import VehicleSelectorModal from "@/components/vehicle-selector-modal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

// Broadcast form schema
const broadcastFormSchema = z.object({
  type: z.string(),
  title: z.string().optional(),
  description: z.string().min(1, "Description is required").refine((val) => {
    const wordCount = val.trim().split(/\s+/).filter(word => word.length > 0).length;
    return wordCount <= 75;
  }, "Description must be 75 words or less"),
  contactPhone: z.string().min(10, "Valid phone number required"),
  contactEmail: z.string().email().optional().or(z.literal("")),
  price: z.number().optional(),
  location: z.string().optional(),
});

type BroadcastFormData = z.infer<typeof broadcastFormSchema>;

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [selectorActionType, setSelectorActionType] = useState<'documents' | 'service-logs'>('documents');
  const [showCreateBroadcast, setShowCreateBroadcast] = useState(false);
  
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Fetch user profile for auto-populating contact details
  const { data: userProfile } = useQuery({
    queryKey: ["/api/profile/1"],
  });

  // Broadcast form setup
  const broadcastForm = useForm<BroadcastFormData>({
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

  const generateNotificationsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/notifications/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  // Create broadcast mutation
  const createBroadcastMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/broadcasts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts"] });
      setShowCreateBroadcast(false);
      broadcastForm.reset();
    },
  });

  // Auto-generate notifications when dashboard loads (once daily)
  useEffect(() => {
    const lastNotificationCheck = localStorage.getItem("lastNotificationCheck");
    const today = new Date().toDateString();
    
    // Check if we haven't generated notifications today
    if (lastNotificationCheck !== today) {
      generateNotificationsMutation.mutate();
      localStorage.setItem("lastNotificationCheck", today);
    }
  }, [generateNotificationsMutation]);

  // Auto-populate broadcast form with profile data
  useEffect(() => {
    if (userProfile && typeof userProfile === 'object') {
      const profile = userProfile as any;
      if (profile.alternatePhone) {
        broadcastForm.setValue("contactPhone", profile.alternatePhone, { shouldValidate: false });
      }
      if (profile.email) {
        broadcastForm.setValue("contactEmail", profile.email, { shouldValidate: false });
      }
      if (profile.city) {
        broadcastForm.setValue("location", profile.city, { shouldValidate: false });
      }
    }
  }, [userProfile, broadcastForm]);

  const handleCreateBroadcast = () => {
    // Auto-populate form with profile data before showing
    if (userProfile && typeof userProfile === 'object') {
      const profile = userProfile as any;
      if (profile.alternatePhone) {
        broadcastForm.setValue("contactPhone", profile.alternatePhone);
      }
      if (profile.email) {
        broadcastForm.setValue("contactEmail", profile.email);
      }
      if (profile.city) {
        broadcastForm.setValue("location", profile.city);
      }
    }
    setShowCreateBroadcast(true);
  };

  const onBroadcastSubmit = (data: BroadcastFormData) => {
    const broadcastData = {
      ...data,
      title: data.type === "buy" ? "Looking for a Vehicle" : data.title,
      price: data.price ? Number(data.price) : undefined,
    };
    createBroadcastMutation.mutate(broadcastData);
  };

  return (
    <>
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Timely Care For Your Carrier</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-red-50 p-1"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <NotificationBell />
              <InfoDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 bg-warm-pattern">
        {/* Vehicle Count Label */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-gray-600">
              {vehicles.length > 0 ? `${vehicles.length} Vehicle${vehicles.length > 1 ? 's' : ''}` : 'Vehicle Management'}
            </h2>
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <Link href="/service-centers" className="text-orange-600 hover:text-orange-800 flex items-center space-x-1">
                <Search className="w-3 h-3" />
                <span className="hidden sm:inline">Search</span>
                <span className="sm:hidden">Search</span>
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/climbing-game" className="text-purple-600 hover:text-purple-800 flex items-center space-x-1">
                <Puzzle className="w-3 h-3" />
                <span className="hidden sm:inline">Logo Puzzle</span>
                <span className="sm:hidden">Puzzle</span>
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/news-tidbits" className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                <Newspaper className="w-3 h-3" />
                <span className="hidden sm:inline">News Bits</span>
                <span className="sm:hidden">News</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="px-3 py-2">
          <h2 className="text-xs font-semibold mb-3 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-5 gap-2">
            <Link href="/add-vehicle" className="block">
              <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-300 transition-all duration-200 h-16 px-1 active:scale-95">
                <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center icon-3d mb-1">
                  <Plus className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[9px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Add Vehicle</span>
              </div>
            </Link>
            <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 transition-all duration-200 h-16 px-1 active:scale-95" 
                 onClick={() => {
                   if (vehicles.length === 1) {
                     window.location.href = `/vehicle/${vehicles[0].id}/local-documents`;
                   } else if (vehicles.length > 1) {
                     setSelectorActionType('documents');
                     setShowVehicleSelector(true);
                   } else {
                     alert("Please add a vehicle first");
                   }
                 }}>
              <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center icon-3d mb-1">
                <Files className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[9px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Documents</span>
            </div>
            <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-teal-300 transition-all duration-200 h-16 px-1 active:scale-95"
                 onClick={() => {
                   if (vehicles.length === 1) {
                     window.location.href = `/vehicle/${vehicles[0].id}/service-logs`;
                   } else if (vehicles.length > 1) {
                     setSelectorActionType('service-logs');
                     setShowVehicleSelector(true);
                   } else {
                     alert("Please add a vehicle first");
                   }
                 }}>
              <div className="w-5 h-5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center icon-3d mb-1">
                <Wrench className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[9px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Service Log</span>
            </div>
            <Link href="/traffic-violations" className="block">
              <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition-all duration-200 h-16 px-1 active:scale-95">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center icon-3d mb-1">
                  <Zap className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[9px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Violations</span>
              </div>
            </Link>
            <Link href="/insurance-renewals" className="block">
              <div className="quick-action-3d rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-300 transition-all duration-200 h-16 px-1 active:scale-95">
                <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center icon-3d mb-1">
                  <Shield className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[9px] font-medium text-gray-800 text-center leading-tight whitespace-nowrap">Insurance</span>
              </div>
            </Link>
          </div>
          

        </section>

        {/* Vehicle List */}
        <section className="px-3 py-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Your Vehicles</h2>
            <Button variant="ghost" size="sm" className="text-primary text-xs h-6 px-2">
              View All
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl p-3 shadow-card animate-pulse">
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-6">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No vehicles added yet</p>
              <Link href="/add-vehicle">
                <Button className="mt-3 text-sm h-8">Add Your First Vehicle</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </section>


      </main>

      <BottomNav currentPath="/" />
      <FloatingActionButton onCreatePost={handleCreateBroadcast} />
      
      <VehicleSelectorModal
        isOpen={showVehicleSelector}
        onClose={() => setShowVehicleSelector(false)}
        vehicles={vehicles}
        actionType={selectorActionType}
      />

      {/* Create Broadcast Dialog */}
      <Dialog open={showCreateBroadcast} onOpenChange={setShowCreateBroadcast}>
        <DialogContent className="w-[94%] max-w-xs mx-auto max-h-[80vh] overflow-y-auto p-3">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-xs flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-orange-600" />
              Create Post
            </DialogTitle>
            <DialogDescription className="text-[9px] text-gray-600 leading-tight">
              Share with MMians
            </DialogDescription>
          </DialogHeader>
          
          <Form {...broadcastForm}>
            <form onSubmit={broadcastForm.handleSubmit(onBroadcastSubmit)} className="space-y-1.5">
              <FormField
                control={broadcastForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-medium">Post Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-6 text-[9px]">
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
                  </FormItem>
                )}
              />

              {broadcastForm.watch("type") !== "buy" && (
                <FormField
                  control={broadcastForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-medium">Title</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-6 text-[9px]" placeholder="Enter post title" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={broadcastForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-medium">
                      {broadcastForm.watch("type") === "buy" ? "Requirements" :
                       broadcastForm.watch("type") === "query" ? "Question" : "Description"}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="min-h-12 text-[9px] resize-none" 
                        placeholder={
                          broadcastForm.watch("type") === "buy" ? "Describe what you're looking for..." :
                          broadcastForm.watch("type") === "query" ? "Ask your question..." : "Share details..."
                        }
                      />
                    </FormControl>
                    <div className="text-[8px] text-gray-500 text-right">
                      {field.value ? field.value.trim().split(/\s+/).filter(word => word.length > 0).length : 0}/75 words
                    </div>
                  </FormItem>
                )}
              />

              {broadcastForm.watch("type") === "sell" && (
                <FormField
                  control={broadcastForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-medium">Price (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          className="h-6 text-[9px]" 
                          placeholder="Enter price"
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={broadcastForm.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-medium">
                      {broadcastForm.watch("type") === "buy" || broadcastForm.watch("type") === "query" ? "Your Contact Phone" : "Contact Phone"}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-6 text-[9px]" placeholder="Contact number" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={broadcastForm.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-medium">
                      {broadcastForm.watch("type") === "buy" || broadcastForm.watch("type") === "query" ? "Your Email" : "Email (Optional)"}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="h-6 text-[9px]" placeholder="Email address" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={broadcastForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-medium">Location</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-6 text-[9px]" placeholder="City, State" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-1.5 pt-0.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateBroadcast(false);
                    broadcastForm.reset();
                  }}
                  className="flex-1 h-6 text-[9px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createBroadcastMutation.isPending}
                  className="flex-1 h-6 text-[9px] bg-orange-500 hover:bg-orange-600"
                >
                  {createBroadcastMutation.isPending ? "Posting..." : 
                   broadcastForm.watch("type") === "buy" ? "Post" :
                   broadcastForm.watch("type") === "sell" ? "List" :
                   broadcastForm.watch("type") === "query" ? "Ask" : "Post"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
