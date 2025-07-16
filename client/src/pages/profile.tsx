import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Save, ArrowLeft, Heart, MapPin, Phone, Camera, Upload, X } from "lucide-react";
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
import CameraCapture from "@/components/camera-capture";
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
  const [showCamera, setShowCamera] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [showLicenseCamera, setShowLicenseCamera] = useState(false);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [licenseImagePreview, setLicenseImagePreview] = useState<string | null>(null);
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
      driversLicenseNumber: "",
      driversLicenseCopy: "",
    },
  });

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => setProfileImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = (file: File) => {
    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = () => setProfileImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setShowCamera(false);
  };

  // Remove profile image
  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  // Handle license file upload
  const handleLicenseFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLicenseImage(file);
      const reader = new FileReader();
      reader.onload = () => setLicenseImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle license camera capture
  const handleLicenseCameraCapture = (file: File) => {
    setLicenseImage(file);
    const reader = new FileReader();
    reader.onload = () => setLicenseImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setShowLicenseCamera(false);
  };

  // Remove license image
  const removeLicenseImage = () => {
    setLicenseImage(null);
    setLicenseImagePreview(null);
  };

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
        driversLicenseNumber: profile.driversLicenseNumber || "",
        driversLicenseCopy: profile.driversLicenseCopy || "",
      });
      // Set existing profile picture if available
      if (profile.profilePicture) {
        setProfileImagePreview(profile.profilePicture);
      }
      // Set existing license copy if available
      if (profile.driversLicenseCopy) {
        setLicenseImagePreview(profile.driversLicenseCopy);
      }
    }
  }, [profile, form]);

  const createProfileMutation = useMutation({
    mutationFn: async (data: InsertUserProfile) => {
      if (!currentUserId) throw new Error("Not authenticated");
      
      // Upload profile image first if exists
      let profilePicturePath = null;
      if (profileImage) {
        const formData = new FormData();
        formData.append('file', profileImage);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload profile image');
        const uploadResult = await uploadResponse.json();
        profilePicturePath = uploadResult.path;
      }

      // Upload license image if exists
      let licenseCopyPath = null;
      if (licenseImage) {
        const formData = new FormData();
        formData.append('file', licenseImage);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload license copy');
        const uploadResult = await uploadResponse.json();
        licenseCopyPath = uploadResult.path;
      }

      // Clean up data to remove undefined values for creation
      const profileData = { 
        ...data, 
        profilePicture: profilePicturePath,
        driversLicenseCopy: licenseCopyPath,
        // Ensure required fields have proper types
        age: typeof data.age === 'number' ? data.age : parseInt(String(data.age)) || 25,
        // Handle optional fields properly - send undefined for empty strings
        alternatePhone: data.alternatePhone && data.alternatePhone.trim() !== '' ? data.alternatePhone : undefined,
        driversLicenseNumber: data.driversLicenseNumber && data.driversLicenseNumber.trim() !== '' ? data.driversLicenseNumber : undefined,
        driversLicenseValidTill: data.driversLicenseValidTill && data.driversLicenseValidTill.trim() !== '' ? data.driversLicenseValidTill : undefined,
      };
      // Remove undefined values to avoid validation issues
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === undefined) {
          delete profileData[key];
        }
      });
      const response = await apiRequest("POST", `/api/profile/${currentUserId}`, profileData);
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
      
      // Upload profile image first if a new one exists
      let profilePicturePath = profile?.profilePicture || null;
      if (profileImage) {
        const formData = new FormData();
        formData.append('file', profileImage);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload profile image');
        const uploadResult = await uploadResponse.json();
        profilePicturePath = uploadResult.path;
      }

      // Upload license image if a new one exists
      let licenseCopyPath = profile?.driversLicenseCopy || null;
      if (licenseImage) {
        const formData = new FormData();
        formData.append('file', licenseImage);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload license copy');
        const uploadResult = await uploadResponse.json();
        licenseCopyPath = uploadResult.path;
      }

      // Clean up data to remove undefined values for update
      const profileData = { 
        ...data, 
        profilePicture: profilePicturePath,
        driversLicenseCopy: licenseCopyPath,
        // Ensure required fields have proper types
        age: typeof data.age === 'number' ? data.age : parseInt(String(data.age)) || 25,
        // Handle optional fields properly - send undefined for empty strings
        alternatePhone: data.alternatePhone && data.alternatePhone.trim() !== '' ? data.alternatePhone : undefined,
        driversLicenseNumber: data.driversLicenseNumber && data.driversLicenseNumber.trim() !== '' ? data.driversLicenseNumber : undefined,
        driversLicenseValidTill: data.driversLicenseValidTill && data.driversLicenseValidTill.trim() !== '' ? data.driversLicenseValidTill : undefined,
      };
      // Remove undefined values to avoid validation issues
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === undefined) {
          delete profileData[key];
        }
      });
      const response = await apiRequest("PUT", `/api/profile/${currentUserId}`, profileData);
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
        <header className="header-gradient-border border-4 border-red-500 shadow-lg relative z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={logoImage} 
                  alt="Myymotto Logo" 
                  className="w-14 h-14 rounded-lg"
                />
                <div>
                  <ColorfulLogo />
                  <p className="text-sm text-red-600">Timely Care for your carrier</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 flex items-center justify-center min-h-[80vh] bg-warm-pattern">
          <Card className="w-full max-w-md card-hover shadow-orange">
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
      <header className="header-gradient-border border-4 border-red-500 shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!profile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-red-50"
                  onClick={() => setIsEditing(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-14 h-14 rounded-lg"
              />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">
                  {profile ? (isEditing ? "Edit Profile" : "Profile") : "Create Profile"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {profile && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-red-50"
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
          <Card className="shadow-orange">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Picture Display */}
              {profile.profilePicture && (
                <div className="flex justify-center">
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover shadow-md"
                  />
                </div>
              )}
              
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

              {/* Driver's License Information */}
              {(profile.driversLicenseNumber || profile.driversLicenseCopy || profile.driversLicenseValidTill) && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Driver's License</h4>
                  {profile.driversLicenseNumber && (
                    <div>
                      <label className="text-sm text-muted-foreground">License Number</label>
                      <p className="font-medium">{profile.driversLicenseNumber}</p>
                    </div>
                  )}
                  {profile.driversLicenseValidTill && (
                    <div className="mt-3">
                      <label className="text-sm text-muted-foreground">Valid Till</label>
                      <p className="font-medium">{new Date(profile.driversLicenseValidTill).toLocaleDateString()}</p>
                    </div>
                  )}
                  {profile.driversLicenseCopy && (
                    <div className="mt-3">
                      <label className="text-sm text-muted-foreground">License Copy</label>
                      <div className="mt-2">
                        <img 
                          src={profile.driversLicenseCopy} 
                          alt="Driver's License" 
                          className="w-full max-w-sm rounded-lg object-cover shadow-md"
                        />
                      </div>
                    </div>
                  )}
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
          <Card className="shadow-orange">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Profile Picture Upload Section */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Profile Picture</label>
                    
                    {/* Profile Picture Preview */}
                    <div className="flex justify-center">
                      {profileImagePreview ? (
                        <div className="relative">
                          <img 
                            src={profileImagePreview} 
                            alt="Profile Preview" 
                            className="w-24 h-24 rounded-full object-cover shadow-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                            onClick={removeProfileImage}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Upload Options */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCamera(true)}
                        className="flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Camera
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => document.getElementById('profile-upload')?.click()}
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </Button>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

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
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : parseInt(value) || 0);
                              }}
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

                  {/* Driver's License Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Driver's License (Optional)</h4>
                    
                    <FormField
                      control={form.control}
                      name="driversLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., MH12 20220012345" 
                              className="h-9"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="driversLicenseValidTill"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Valid Till</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              className="h-9"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* License Copy Upload Section */}
                    <div className="space-y-4 mt-4">
                      <label className="text-sm font-medium">License Copy (Optional)</label>
                      
                      {/* License Image Preview */}
                      <div className="flex justify-center">
                        {licenseImagePreview ? (
                          <div className="relative">
                            <img 
                              src={licenseImagePreview} 
                              alt="License Preview" 
                              className="w-full max-w-sm rounded-lg object-cover shadow-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                              onClick={removeLicenseImage}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <div className="flex flex-col items-center space-y-2">
                              <Camera className="w-8 h-8 text-gray-400" />
                              <p className="text-sm text-gray-500">No license copy uploaded</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* License Upload Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowLicenseCamera(true)}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Camera
                        </Button>
                        <label className="flex-1">
                          <Button type="button" variant="outline" className="w-full" asChild>
                            <div>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </div>
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLicenseFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

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

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* License Camera Modal */}
      {showLicenseCamera && (
        <CameraCapture
          onCapture={handleLicenseCameraCapture}
          onClose={() => setShowLicenseCamera(false)}
        />
      )}
    </div>
  );
}