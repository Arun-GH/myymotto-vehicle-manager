import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Save, ArrowLeft, Heart, MapPin, Phone } from "lucide-react";
import { insertUserProfileSchema, type InsertUserProfile, type UserProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ColorfulLogo from "@/components/colorful-logo";
import NotificationBell from "@/components/notification-bell";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

// Authentication is now handled via localStorage

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
];

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const currentUserId = localStorage.getItem("currentUserId");

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null;
      try {
        const response = await apiRequest("GET", `/api/profile/${currentUserId}`);
        return response.json();
      } catch (error: any) {
        if (error.message?.includes('404')) {
          return null; // Profile doesn't exist yet
        }
        throw error;
      }
    },
    enabled: !!currentUserId,
  });

  const form = useForm<InsertUserProfile>({
    resolver: zodResolver(insertUserProfileSchema),
    defaultValues: {
      name: "",
      age: 25,
      address: "",
      bloodGroup: "",
      state: "",
      city: "",
      pinCode: "",
      alternatePhone: "",
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        age: profile.age,
        address: profile.address,
        bloodGroup: profile.bloodGroup,
        state: profile.state,
        city: profile.city,
        pinCode: profile.pinCode,
        alternatePhone: profile.alternatePhone || "",
      });
    }
  }, [profile, form]);

  const createProfileMutation = useMutation({
    mutationFn: async (data: InsertUserProfile) => {
      if (!currentUserId) throw new Error("Not authenticated");
      const response = await apiRequest("POST", `/api/profile/${currentUserId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", currentUserId] });
      toast({
        title: "Profile Created",
        description: "Your profile has been successfully created.",
      });
      setIsEditing(false);
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: InsertUserProfile) => {
      if (!currentUserId) throw new Error("Not authenticated");
      const response = await apiRequest("PUT", `/api/profile/${currentUserId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", currentUserId] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUserProfile) => {
    if (profile) {
      updateProfileMutation.mutate(data);
    } else {
      createProfileMutation.mutate(data);
    }
  };

  // If no profile exists and not editing, show the create profile prompt
  if (!isLoading && !profile && !isEditing) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="gradient-warm text-white shadow-lg sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-1 rounded-xl">
                <img 
                  src={logoImage} 
                  alt="Myymotto Logo" 
                  className="w-10 h-10 rounded-lg"
                />
              </div>
              <div>
                <ColorfulLogo />
                <p className="text-xs text-white/80">Timely Care for your carrier</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 flex items-center justify-center min-h-[80vh] bg-warm-pattern">
          <Card className="w-full max-w-md card-hover shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="bg-white p-2 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <img 
                  src={logoImage} 
                  alt="Myymotto Logo" 
                  className="w-16 h-16 rounded-full"
                />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Welcome to <ColorfulLogo className="inline" />!</h2>
              <p className="text-gray-600 mb-6">
                Let's create your profile to get started with timely care for your carrier.
              </p>
              <Button 
                onClick={() => setIsEditing(true)}
                className="w-full gradient-warm text-white border-0 hover:opacity-90"
                size="lg"
              >
                Create Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-warm text-white shadow-lg sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!profile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsEditing(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="bg-white/20 p-1 rounded-xl">
                <img 
                  src={logoImage} 
                  alt="Myymotto Logo" 
                  className="w-10 h-10 rounded-lg"
                />
              </div>
              <div>
                <ColorfulLogo />
                <p className="text-sm text-white/80">
                  {profile ? (isEditing ? "Edit Profile" : "Profile") : "Create Profile"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {profile && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        {!isEditing && profile ? (
          // Display Mode
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Age</label>
                  <p className="font-medium">{profile.age} years</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Blood Group</label>
                  <p className="font-medium">{profile.bloodGroup}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Pin Code</label>
                  <p className="font-medium">{profile.pinCode}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Address</label>
                <p className="font-medium">{profile.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">City</label>
                  <p className="font-medium">{profile.city}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">State</label>
                  <p className="font-medium">{profile.state}</p>
                </div>
              </div>
              
              {profile.alternatePhone && (
                <div>
                  <label className="text-sm text-muted-foreground">Alternate Phone</label>
                  <p className="font-medium">{profile.alternatePhone}</p>
                </div>
              )}
              
              <div className="pt-4">
                <Button onClick={() => setLocation("/")} className="w-full">
                  Continue to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Edit/Create Mode
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
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
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Group</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bloodGroups.map((group) => (
                                <SelectItem key={group} value={group}>
                                  {group}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your complete address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {states.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pin Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter 6-digit pin code" 
                            maxLength={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alternatePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternate Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3 pt-4">
                    {profile && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                    >
                      {createProfileMutation.isPending || updateProfileMutation.isPending ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {profile ? "Update Profile" : "Create Profile"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}