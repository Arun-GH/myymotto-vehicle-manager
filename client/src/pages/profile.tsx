import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Save, ArrowLeft, Heart, MapPin, Phone, Camera, Upload, X, Settings, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { insertUserProfileSchema, type InsertUserProfile, type UserProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatForDatabase, toStandardDateFormat } from "@/lib/date-format";
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

const stateCityMapping: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi", "Davangere", "Ballari", "Tumakuru"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Alappuzha", "Kollam", "Palakkad", "Kannur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Sangli"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Anand"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Malda", "Bardhaman", "Kharagpur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Baripada"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Palampur", "Nahan", "Kullu", "Hamirpur"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Kotdwar"],
  "Goa": ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Korba", "Bilaspur", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar", "Belonia", "Khowai", "Bishramganj", "Teliamura"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Senapati", "Tamenglong"],
  "Meghalaya": ["Shillong", "Tura", "Cherrapunji", "Jowai", "Nongstoin", "Baghmara", "Williamnagar", "Resubelpara"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip", "Mamit", "Lawngtlai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Kiphire"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tezpur", "Bomdila", "Tawang", "Ziro", "Along"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Jorethang", "Nayabazar", "Rangpo", "Singtam"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Kathua", "Udhampur", "Punch"],
  "Ladakh": ["Leh", "Kargil", "Nubra", "Changthang", "Zanskar", "Drass", "Sankoo", "Turtuk"]
};

const states = Object.keys(stateCityMapping);

// Profile completeness calculation function
const calculateProfileCompleteness = (profile: UserProfile | undefined, vehicleCount: number = 0) => {
  if (!profile) return { percentage: 0, completedFields: 0, totalFields: 0, missingFields: [] };

  const fields = [
    { name: "Profile Picture", value: profile.profilePicture, weight: 10, category: "Basic Info" },
    { name: "Name", value: profile.name, weight: 15, category: "Basic Info" },
    { name: "Age", value: profile.age, weight: 10, category: "Basic Info" },
    { name: "Gender", value: profile.gender, weight: 5, category: "Basic Info" },
    { name: "Address", value: profile.address, weight: 10, category: "Contact Info" },
    { name: "City", value: profile.city, weight: 8, category: "Contact Info" },
    { name: "State", value: profile.state, weight: 8, category: "Contact Info" },
    { name: "Pin Code", value: profile.pinCode, weight: 5, category: "Contact Info" },
    { name: "Email", value: profile.email, weight: 10, category: "Contact Info" },
    { name: "Blood Group", value: profile.bloodGroup, weight: 5, category: "Health Info" },
    { name: "Alternate Phone", value: profile.alternatePhone, weight: 5, category: "Contact Info" },
    { name: "Driver's License Number", value: profile.driversLicenseNumber, weight: 8, category: "Documents" },
    { name: "Driver's License Copy", value: profile.driversLicenseCopy, weight: 6, category: "Documents" },
  ];

  const completedFields = fields.filter(field => field.value && field.value.toString().trim() !== '');
  const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
  const completedWeight = completedFields.reduce((sum, field) => sum + field.weight, 0);
  
  // Add vehicle bonus (up to 15% for having vehicles)
  const vehicleBonus = Math.min(vehicleCount * 5, 15);
  
  const basePercentage = (completedWeight / totalWeight) * 85; // 85% max for profile fields
  const totalPercentage = Math.min(Math.round(basePercentage + vehicleBonus), 100);

  const missingFields = fields.filter(field => !field.value || field.value.toString().trim() === '');

  return {
    percentage: totalPercentage,
    completedFields: completedFields.length,
    totalFields: fields.length,
    missingFields: missingFields.map(field => ({ name: field.name, category: field.category })),
    vehicleCount,
    vehicleBonus
  };
};

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [licenseImagePreview, setLicenseImagePreview] = useState<string | null>(null);
  const [isManualStateEntry, setIsManualStateEntry] = useState(false);
  const [isManualCityEntry, setIsManualCityEntry] = useState(false);
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

  // Fetch user's vehicles for completeness calculation
  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
    enabled: !!currentUserId,
  }) as { data: any[] };

  // Calculate profile completeness
  const completeness = calculateProfileCompleteness(profile, vehicles.length);

  const form = useForm<InsertUserProfile>({
    resolver: zodResolver(insertUserProfileSchema),
    defaultValues: {
      name: "",
      age: undefined,
      gender: "",
      address: "",
      bloodGroup: "",
      state: "",
      city: "",
      pinCode: "",
      alternatePhone: "",
      email: "",
      driversLicenseNumber: "",
      driversLicenseValidTill: "",
    },
  });

  // Watch state changes to update city options
  const selectedState = form.watch("state");
  const availableCities = useMemo(() => {
    return selectedState ? stateCityMapping[selectedState] || [] : [];
  }, [selectedState]);

  // Clear city when state changes
  useEffect(() => {
    if (selectedState) {
      const currentCity = form.getValues().city;
      const cities = stateCityMapping[selectedState] || [];
      if (currentCity && !cities.includes(currentCity)) {
        form.setValue("city", "");
      }
    }
  }, [selectedState, form]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setProfileImagePreview(result);
        console.log("Profile image uploaded, preview set");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle camera input change (from device camera app)
  const handleCameraInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setProfileImagePreview(result);
        console.log("Profile camera image captured, preview set");
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Photo captured!",
        description: "Profile photo captured successfully from camera.",
      });
      
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };

  // Handle camera capture button click


  // Remove profile image
  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  // Handle license file upload
  const handleLicenseUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLicenseImage(file);
      const reader = new FileReader();
      reader.onload = () => setLicenseImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      
      toast({
        title: "License copy selected",
        description: "License image will be uploaded when you save your profile.",
      });
    }
    // Reset the input
    event.target.value = '';
  };

  // Handle license camera input change (from device camera app)
  const handleLicenseCameraInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLicenseImage(file);
      const reader = new FileReader();
      reader.onload = () => setLicenseImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      
      toast({
        title: "Photo captured!",
        description: "License photo captured successfully from camera.",
      });
      
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };

  // Remove license image
  const removeLicenseImage = () => {
    setLicenseImage(null);
    setLicenseImagePreview(null);
  };

  // Date conversion helpers
  const convertToDateInputFormat = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch {
      return "";
    }
  };

  const convertFromDateInputFormat = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return "";
    }
  };

  // Update form when profile data loads and in editing mode
  useEffect(() => {
    if (profile && isEditing) {
      form.reset({
        name: profile.name,
        age: profile.age,
        gender: profile.gender || "",
        address: profile.address,
        bloodGroup: profile.bloodGroup,
        state: profile.state,
        city: profile.city,
        pinCode: profile.pinCode,
        alternatePhone: profile.alternatePhone || "",
        email: profile.email || "",
        driversLicenseNumber: profile.driversLicenseNumber || "",
        driversLicenseValidTill: profile.driversLicenseValidTill || "",
      });
      // Set existing profile picture if available
      if (profile.profilePicture) {
        setProfileImagePreview(profile.profilePicture);
        console.log("Setting profile image preview in editing mode:", profile.profilePicture);
      }
      // Set existing license copy if available
      if (profile.driversLicenseCopy) {
        setLicenseImagePreview(profile.driversLicenseCopy);
      }
    }
  }, [profile, isEditing, form]);

  // Set profile images for viewing mode
  useEffect(() => {
    if (profile) {
      console.log("Profile loaded for viewing:", JSON.stringify(profile, null, 2));
      console.log("Profile picture URL:", profile.profilePicture);
      console.log("Profile drivers license copy:", profile.driversLicenseCopy);
      // Set existing profile picture for viewing mode
      if (profile.profilePicture) {
        setProfileImagePreview(profile.profilePicture);
        console.log("Setting profile image preview for viewing mode:", profile.profilePicture);
      } else {
        console.log("No profile picture found in profile data");
      }
      // Set existing license copy for viewing mode
      if (profile.driversLicenseCopy) {
        setLicenseImagePreview(profile.driversLicenseCopy);
        console.log("Setting license image preview for viewing mode:", profile.driversLicenseCopy);
      } else {
        console.log("No license copy found in profile data");
      }
    }
  }, [profile]);

  const createProfileMutation = useMutation({
    mutationFn: async (data: InsertUserProfile) => {
      const userId = localStorage.getItem("currentUserId");
      console.log("Creating profile with userId:", userId);
      if (!userId) {
        console.error("No currentUserId found in localStorage");
        throw new Error("Not authenticated");
      }
      
      // Upload profile image first if exists
      let profilePicturePath = undefined;
      if (profileImage) {
        const formData = new FormData();
        formData.append('file', profileImage);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload profile image');
        const uploadResult = await uploadResponse.json();
        profilePicturePath = uploadResult.filePath;
      }

      // Upload license image if exists
      let licenseCopyPath = undefined;
      if (licenseImage) {
        const formData = new FormData();
        formData.append('file', licenseImage);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload license copy');
        const uploadResult = await uploadResponse.json();
        licenseCopyPath = uploadResult.filePath;
      }

      // Clean up data to remove undefined values for creation
      const profileData = { 
        ...data, 
        profilePicture: profilePicturePath,
        driversLicenseCopy: licenseCopyPath,
        // Ensure required fields have proper types
        age: typeof data.age === 'number' ? data.age : parseInt(String(data.age)) || 25,
        // Handle optional fields properly - send empty string for empty values to avoid null issues
        alternatePhone: data.alternatePhone || "",
        email: data.email, // Required field
        driversLicenseNumber: data.driversLicenseNumber || "",
        driversLicenseValidTill: data.driversLicenseValidTill && data.driversLicenseValidTill.trim() !== '' ? formatForDatabase(data.driversLicenseValidTill) : null,
      };
      const response = await apiRequest("POST", `/api/profile/${userId}`, profileData);
      return response.json();
    },
    onSuccess: () => {
      const userId = localStorage.getItem("currentUserId");
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      toast({
        title: "Profile Created",
        description: "Your profile has been successfully created.",
      });
      setIsEditing(false);
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
      const userId = localStorage.getItem("currentUserId");
      console.log("Updating profile with userId:", userId);
      if (!userId) {
        console.error("No currentUserId found in localStorage for update");
        throw new Error("Not authenticated");
      }
      
      // Upload profile image first if a new one exists
      let profilePicturePath = profile?.profilePicture;
      if (profileImage) {
        console.log("Uploading new profile image...");
        const formData = new FormData();
        formData.append('file', profileImage);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload profile image');
        const uploadResult = await uploadResponse.json();
        profilePicturePath = uploadResult.filePath;
        console.log("Profile image uploaded successfully:", profilePicturePath);
      }

      // Upload license image if a new one exists
      let licenseCopyPath = profile?.driversLicenseCopy;
      if (licenseImage) {
        const formData = new FormData();
        formData.append('file', licenseImage);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload license copy');
        const uploadResult = await uploadResponse.json();
        licenseCopyPath = uploadResult.filePath;
      }

      // Clean up data to remove undefined values for update
      const profileData = { 
        ...data, 
        profilePicture: profilePicturePath || null,
        driversLicenseCopy: licenseCopyPath || null,
        // Ensure required fields have proper types
        age: typeof data.age === 'number' ? data.age : parseInt(String(data.age)) || 25,
        // Handle optional fields properly - send empty string for empty values to avoid null issues
        alternatePhone: data.alternatePhone || "",
        email: data.email, // Required field
        driversLicenseNumber: data.driversLicenseNumber || "",
        driversLicenseValidTill: data.driversLicenseValidTill && data.driversLicenseValidTill.trim() !== '' ? formatForDatabase(data.driversLicenseValidTill) : null,
      };
      console.log("Profile update data being sent:", profileData);
      console.log("Profile picture path being sent:", profilePicturePath);
      console.log("Profile image state:", profileImage);
      console.log("Existing profile picture:", profile?.profilePicture);
      const response = await apiRequest("PUT", `/api/profile/${userId}`, profileData);
      return response.json();
    },
    onSuccess: () => {
      const userId = localStorage.getItem("currentUserId");
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

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

  // If no profile exists, show the create profile form
  if (!isLoading && !profile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="header-gradient-border shadow-lg relative z-10">
          <div className="px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img 
                  src={logoImage} 
                  alt="Myymotto Logo" 
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <div className="text-base font-bold">
                    <ColorfulLogo />
                  </div>
                  <p className="text-xs text-red-600">Timely Care For Your Carrier</p>
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
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Create Your Profile</h2>
              <p className="text-gray-600 mb-6">
                Let's get started with timely care for your carrier.
              </p>
              <div className="text-center text-gray-600">
                <p>Please fill out the form below to create your profile.</p>
              </div>
            </CardContent>
          </Card>
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
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">
                  {profile ? "Profile" : "Create Profile"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {profile && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-red-50 h-6 text-xs px-2"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-red-50 w-8 h-8"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      <div className="p-2 pb-20">
        {/* Profile Completeness Tracker - Compact Mobile */}
        {profile && (
          <Card className="shadow-orange mb-3">
            <CardContent className="p-2">
              {/* Header with Progress */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Profile</h3>
                </div>
                <span className="text-base font-bold text-orange-600">{completeness.percentage}%</span>
              </div>
              
              {/* Compact Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completeness.percentage}%` }}
                ></div>
              </div>
              
              {/* Inline Stats */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{completeness.completedFields}/{completeness.totalFields} fields</span>
                <span>{completeness.vehicleCount} vehicle{completeness.vehicleCount !== 1 ? 's' : ''} (+{completeness.vehicleBonus}%)</span>
              </div>
              
              {/* Compact Missing Fields */}
              {completeness.missingFields.length > 0 && completeness.percentage < 100 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-1 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-gray-700">Missing:</span>
                  </div>
                  <div className="text-[10px] text-gray-600 leading-tight">
                    {completeness.missingFields.slice(0, 3).map((field, idx) => field.name).join(', ')}
                    {completeness.missingFields.length > 3 && ` +${completeness.missingFields.length - 3} more`}
                  </div>
                </div>
              )}
              
              {/* Compact Achievement */}
              {completeness.percentage >= 90 && (
                <div className="mt-2 pt-2 border-t border-green-200 bg-green-50 rounded p-1.5">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-800">
                      {completeness.percentage === 100 ? 'Complete!' : 'Almost done!'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!profile || isEditing ? (
          // Editing mode - Show form
          <Card className="shadow-orange">
            <CardHeader className="p-2 pb-2">
              <CardTitle className="text-lg">{profile ? "Edit Profile" : "Create Profile"}</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                {/* Profile Picture Section */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Profile Picture</label>
                  
                  {/* Profile Picture Display/Preview */}
                  <div className="flex justify-center">
                    {profileImagePreview ? (
                      <div className="relative">
                        <img 
                          src={profileImagePreview} 
                          alt="Profile" 
                          className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-orange-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full"
                          onClick={removeProfileImage}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-gray-200">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Upload Options */}
                  <div className="flex justify-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 h-7 text-xs px-2"
                      onClick={() => document.getElementById('profile-upload')?.click()}
                    >
                      <Upload className="w-3 h-3" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 h-7 text-xs px-2"
                      onClick={() => document.getElementById('profile-camera')?.click()}
                    >
                      <Camera className="w-3 h-3" />
                      Camera
                    </Button>
                  </div>

                  {/* Hidden File Inputs */}
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <input
                    id="profile-camera"
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleCameraInputChange}
                    className="hidden"
                  />
                </div>

                {/* Basic Information */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Basic Information</h4>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name"
                            className="h-8 text-sm"
                            {...field}
                            onChange={(e) => {
                              // Remove any numbers from the input
                              const value = e.target.value.replace(/[0-9]/g, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Age"
                              className="h-8 text-sm"
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? undefined : parseInt(value) || undefined);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Blood Group</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Blood" />
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
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Address Information</h4>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Complete Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your complete address"
                            className="text-sm resize-none h-16"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">State</FormLabel>
                          {isManualStateEntry ? (
                            <div className="space-y-1">
                              <FormControl>
                                <Input 
                                  placeholder="Enter state manually"
                                  className="h-8 text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={() => {
                                  setIsManualStateEntry(false);
                                  field.onChange("");
                                  setIsManualCityEntry(false);
                                  form.setValue("city", "");
                                }}
                              >
                                Use dropdown instead
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Select 
                                onValueChange={(value) => {
                                  if (value === "manual_entry") {
                                    setIsManualStateEntry(true);
                                    field.onChange("");
                                    setIsManualCityEntry(false);
                                    form.setValue("city", "");
                                  } else {
                                    field.onChange(value);
                                  }
                                }} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="State" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {states.map((state) => (
                                    <SelectItem key={state} value={state}>
                                      {state}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="manual_entry" className="text-orange-600 font-medium">
                                    ✏️ Enter manually
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">City</FormLabel>
                          {isManualCityEntry ? (
                            <div className="space-y-1">
                              <FormControl>
                                <Input 
                                  placeholder="Enter city manually"
                                  className="h-8 text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={() => {
                                  setIsManualCityEntry(false);
                                  field.onChange("");
                                }}
                              >
                                Use dropdown instead
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Select 
                                onValueChange={(value) => {
                                  if (value === "manual_entry") {
                                    setIsManualCityEntry(true);
                                    field.onChange("");
                                  } else {
                                    field.onChange(value);
                                  }
                                }} 
                                defaultValue={field.value}
                                disabled={!selectedState && !isManualStateEntry}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder={
                                      isManualStateEntry ? "Select City" : 
                                      selectedState ? "Select City" : "Select State first"
                                    } />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableCities.map((city) => (
                                    <SelectItem key={city} value={city}>
                                      {city}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="manual_entry" className="text-orange-600 font-medium">
                                    ✏️ Enter manually
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Pin Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Pin code (numbers or text allowed)"
                            className="h-8 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contact Information</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="alternatePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Phone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Alternate phone (numbers only)"
                              className="h-8 text-sm"
                              {...field}
                              onChange={(e) => {
                                // Allow only numbers, +, -, (, ), and spaces
                                const value = e.target.value.replace(/[^0-9+\-() ]/g, '');
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="Email address"
                              className="h-8 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Driver's License (Optional) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Driver's License (Optional)</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="driversLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">License Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="License number"
                              className="h-8 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="driversLicenseValidTill"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Valid Till</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              className="h-8 text-sm"
                              value={field.value ? convertToDateInputFormat(field.value) : ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? convertFromDateInputFormat(value) : "");
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* License Copy Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">License Copy</label>
                    
                    {licenseImagePreview && (
                      <div className="flex justify-center">
                        <div className="relative">
                          <img 
                            src={licenseImagePreview} 
                            alt="License Preview" 
                            className="w-32 h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full"
                            onClick={removeLicenseImage}
                          >
                            <X className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1.5 h-7 text-xs px-2"
                        onClick={() => document.getElementById('license-upload')?.click()}
                      >
                        <Upload className="w-3 h-3" />
                        Upload
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1.5 h-7 text-xs px-2"
                        onClick={() => document.getElementById('license-camera')?.click()}
                      >
                        <Camera className="w-3 h-3" />
                        Camera
                      </Button>
                    </div>

                    {/* Hidden File Inputs */}
                    <input
                      id="license-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLicenseUpload}
                      className="hidden"
                    />
                    <input
                      id="license-camera"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleLicenseCameraInputChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                  >
                    {createProfileMutation.isPending || updateProfileMutation.isPending 
                      ? "Saving..." 
                      : profile ? "Update Profile" : "Create Profile"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        ) : (
          // Viewing mode - Show profile data
          <Card className="shadow-orange">
            <CardHeader className="p-2 pb-2">
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-3">
              {/* Profile Picture */}
              <div className="flex justify-center">
                {profile?.profilePicture ? (
                  <img 
                    src={profile.profilePicture.startsWith('/app_storage') ? profile.profilePicture : `/api/files/${profile.profilePicture}`} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-orange-200"
                    onError={(e) => {
                      console.log("Profile image failed to load:", profile.profilePicture);
                      // Hide broken image and show default avatar
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200 ${profile?.profilePicture ? 'hidden' : ''}`}>
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Basic Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Name</span>
                    <p className="font-medium">{profile.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Age</span>
                    <p className="font-medium">{profile.age}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Gender</span>
                    <p className="font-medium">{profile.gender || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Blood Group</span>
                    <p className="font-medium">{profile.bloodGroup}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Address Information</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-xs text-gray-500">Address</span>
                    <p className="font-medium">{profile.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-gray-500">City</span>
                      <p className="font-medium">{profile.city}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">State</span>
                      <p className="font-medium">{profile.state}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Pin Code</span>
                    <p className="font-medium">{profile.pinCode}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contact Information</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-xs text-gray-500">Email</span>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  {profile.alternatePhone && (
                    <div>
                      <span className="text-xs text-gray-500">Alternate Phone</span>
                      <p className="font-medium">{profile.alternatePhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Driver's License */}
              {(profile.driversLicenseNumber || profile.driversLicenseCopy) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Driver's License</h4>
                  <div className="text-sm space-y-1">
                    {profile.driversLicenseNumber && (
                      <div>
                        <span className="text-xs text-gray-500">License Number</span>
                        <p className="font-medium">{profile.driversLicenseNumber}</p>
                      </div>
                    )}
                    {profile.driversLicenseValidTill && (
                      <div>
                        <span className="text-xs text-gray-500">Valid Till</span>
                        <p className="font-medium">{profile.driversLicenseValidTill}</p>
                      </div>
                    )}
                    {profile.driversLicenseCopy && (
                      <div>
                        <span className="text-xs text-gray-500">License Copy</span>
                        <div className="mt-1">
                          <img 
                            src={profile.driversLicenseCopy} 
                            alt="License" 
                            className="w-16 h-16 rounded object-cover border"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Continue to dashboard button for existing profiles */}
        {profile && !isEditing && (
          <Card className="shadow-orange mt-3">
            <CardContent className="p-2">
              <Button 
                onClick={() => setLocation("/")} 
                variant="outline"
                className="w-full"
              >
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cancel button when editing */}
        {profile && isEditing && (
          <Card className="shadow-orange mt-3">
            <CardContent className="p-2">
              <Button 
                onClick={() => setIsEditing(false)} 
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
