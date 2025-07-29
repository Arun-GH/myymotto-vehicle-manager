import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Smartphone, Mail, Lock, ArrowRight, Timer, Fingerprint, Shield, KeyRound } from "lucide-react";
import { signInSchema, verifyOtpSchema, setPinSchema, pinLoginSchema, biometricSetupSchema, type SignInData, type VerifyOtpData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

type AuthStep = "signin" | "verify-otp" | "pin-login" | "direct-pin" | "set-pin" | "biometric-setup" | "register";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<AuthStep>("signin");
  const [identifier, setIdentifier] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [authTab, setAuthTab] = useState<"otp" | "pin">("otp");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for saved user data on component mount
  useEffect(() => {
    const savedIdentifier = localStorage.getItem("lastUsedIdentifier");
    const hasPin = localStorage.getItem("hasPin") === "true";
    
    if (savedIdentifier && hasPin) {
      // User has previously set up PIN, go directly to simplified PIN screen
      setIdentifier(savedIdentifier);
      pinForm.setValue("identifier", savedIdentifier);
      setStep("direct-pin");
      setIsExistingUser(true);
    }
  }, []);

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const otpForm = useForm<VerifyOtpData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      identifier: "",
      otp: "",
    },
  });

  const pinForm = useForm<{ identifier: string; pin: string }>({
    resolver: zodResolver(pinLoginSchema),
    defaultValues: {
      identifier: "",
      pin: "",
    },
  });

  const setPinForm = useForm<{ pin: string; confirmPin: string }>({
    mode: "onChange",
    defaultValues: {
      pin: "",
      confirmPin: "",
    },
  });

  const biometricForm = useForm<{ enabled: boolean }>({
    resolver: zodResolver(biometricSetupSchema),
    defaultValues: {
      enabled: false,
    },
  });

  // Reset PIN form when entering PIN setup step
  useEffect(() => {
    if (step === "set-pin") {
      setPinForm.reset({
        pin: "",
        confirmPin: "",
      });
    }
  }, [step, setPinForm]);

  const signInMutation = useMutation({
    mutationFn: async (data: SignInData) => {
      const response = await apiRequest("POST", "/api/auth/signin", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIdentifier(signInForm.getValues().identifier);
      otpForm.setValue("identifier", signInForm.getValues().identifier);
      
      // Always go to OTP verification screen regardless of whether user exists
      setStep("verify-otp");
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${data.maskedIdentifier}`,
      });
      
      // Start countdown for resend
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  const pinLoginMutation = useMutation({
    mutationFn: async (data: { identifier: string; pin: string }) => {
      const response = await apiRequest("POST", "/api/auth/pin-login", data);
      return response.json();
    },
    onSuccess: (data) => {
      setUserId(data.userId);
      // Store authentication state and user data
      localStorage.setItem("currentUserId", data.userId.toString());
      localStorage.setItem("userId", data.userId.toString());
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authMethod", "pin");
      localStorage.setItem("lastUsedIdentifier", identifier);
      localStorage.setItem("hasPin", "true");
      
      // Clear notification cache to refresh notifications on login
      localStorage.removeItem("notifications_last_fetched");
      
      // Always go to dashboard for PIN login users (they already have profiles)
      toast({
        title: "Welcome Back!",
        description: "Successfully signed in with PIN",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      console.log("PIN login error:", error);
      console.log("Error message:", error.message);
      console.log("Error type:", typeof error.message);
      
      // Check if user is blocked - 403 status indicates blocked user
      if (error.message?.includes("403")) {
        try {
          // Parse the JSON response from the error message
          const jsonPart = error.message.substring(4); // Remove "403: " prefix
          const errorResponse = JSON.parse(jsonPart);
          
          if (errorResponse.isBlocked) {
            console.log("Blocked user detected, redirecting to /blocked-user");
            
            // Store blocked user info for the blocked-user page
            localStorage.setItem("blockedUserInfo", JSON.stringify({
              reason: errorResponse.blockedReason,
              contactEmail: errorResponse.contactEmail
            }));
            
            setLocation("/blocked-user");
            return;
          }
        } catch (parseError) {
          console.log("Failed to parse error response:", parseError);
          // Check using the original string-based approach as fallback
          if (error.message?.includes("Account access restricted")) {
            console.log("Blocked user detected (fallback), redirecting to /blocked-user");
            setLocation("/blocked-user");
            return;
          }
        }
      }
      
      toast({
        title: "PIN Login Failed",
        description: error.message || "Invalid PIN",
        variant: "destructive",
      });
    },
  });

  const setPinMutation = useMutation({
    mutationFn: async (data: { pin: string; confirmPin: string }) => {
      const response = await apiRequest("POST", "/api/auth/set-pin", {
        pin: data.pin,
        confirmPin: data.confirmPin,
        userId: userId,
      });
      return response.json();
    },
    onSuccess: () => {
      // Store authentication state and user data
      localStorage.setItem("currentUserId", userId!.toString());
      localStorage.setItem("userId", userId!.toString());
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authMethod", "pin");
      localStorage.setItem("lastUsedIdentifier", identifier);
      localStorage.setItem("hasPin", "true");
      
      // Clear notification cache to refresh notifications on login
      localStorage.removeItem("notifications_last_fetched");
      
      // Show welcome toast that auto-fades after 1 second
      toast({
        title: "Welcome to Myymotto!",
        description: "Your account setup is complete",
      });
      
      // Direct new users to welcome page after PIN setup
      setLocation("/welcome");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set PIN",
        variant: "destructive",
      });
    },
  });

  const biometricSetupMutation = useMutation({
    mutationFn: async (data: { enabled: boolean }) => {
      const response = await apiRequest("POST", "/api/auth/biometric-setup", {
        enabled: data.enabled,
        userId: userId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Biometric Setup Complete",
        description: data.message,
      });
      
      // Store authentication state
      localStorage.setItem("currentUserId", userId!.toString());
      localStorage.setItem("userId", userId!.toString());
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authMethod", "biometric");
      
      // Clear notification cache to refresh notifications on login
      localStorage.removeItem("notifications_last_fetched");
      
      // Check if user has profile
      const hasProfile = localStorage.getItem("hasProfile") === "true";
      if (hasProfile) {
        setLocation("/");
      } else {
        setLocation("/profile");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to setup biometric authentication",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", data);
      return response.json();
    },
    onSuccess: (data) => {
      setUserId(data.userId);
      
      // Store authentication state immediately
      localStorage.setItem("currentUserId", data.userId.toString());
      localStorage.setItem("userId", data.userId.toString());
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authMethod", "otp");
      
      // Clear notification cache to refresh notifications on login
      localStorage.removeItem("notifications_last_fetched");
      
      // Always proceed to next screen based on profile status
      if (data.hasProfile) {
        // User has profile - go to dashboard
        toast({
          title: "Login Successful",
          description: "Welcome back to Myymotto!",
        });
        setLocation("/");
      } else {
        // User needs PIN setup first, then profile
        // Reset the PIN form to ensure clean state
        setPinForm.reset({
          pin: "",
          confirmPin: "",
        });
        setStep("set-pin");
        // No toast here - let PIN setup success handle the welcome message
      }
    },
    onError: (error: any) => {
      console.log("OTP verification error:", error);
      console.log("Error message:", error.message);
      console.log("Error type:", typeof error.message);
      
      // Check if user is blocked - 403 status indicates blocked user
      if (error.message?.includes("403")) {
        try {
          // Parse the JSON response from the error message
          const jsonPart = error.message.substring(4); // Remove "403: " prefix
          const errorResponse = JSON.parse(jsonPart);
          
          if (errorResponse.isBlocked) {
            console.log("Blocked user detected, redirecting to /blocked-user");
            
            // Store blocked user info for the blocked-user page
            localStorage.setItem("blockedUserInfo", JSON.stringify({
              reason: errorResponse.blockedReason,
              contactEmail: errorResponse.contactEmail
            }));
            
            setLocation("/blocked-user");
            return;
          }
        } catch (parseError) {
          console.log("Failed to parse error response:", parseError);
          // Check using the original string-based approach as fallback
          if (error.message?.includes("Account access restricted")) {
            console.log("Blocked user detected (fallback), redirecting to /blocked-user");
            setLocation("/blocked-user");
            return;
          }
        }
      }
      
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/resend-otp", { 
        identifier 
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "OTP Resent",
        description: "New verification code sent successfully",
      });
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP",
        variant: "destructive",
      });
    },
  });

  const onSignInSubmit = (data: SignInData) => {
    signInMutation.mutate(data);
  };

  const onOtpSubmit = (data: VerifyOtpData) => {
    verifyOtpMutation.mutate({
      identifier,
      otp: data.otp
    });
  };

  const onPinSubmit = (data: { identifier: string; pin: string }) => {
    pinLoginMutation.mutate({
      identifier: data.identifier,
      pin: data.pin
    });
  };

  const onSetPinSubmit = (data: { pin: string; confirmPin: string }) => {
    if (data.pin !== data.confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "Please ensure both PIN entries match",
        variant: "destructive",
      });
      return;
    }
    setPinMutation.mutate({ pin: data.pin, confirmPin: data.confirmPin });
  };

  const onBiometricSubmit = (data: { enabled: boolean }) => {
    biometricSetupMutation.mutate(data);
  };

  const skipPinSetup = () => {
    // Store basic authentication state and proceed
    localStorage.setItem("currentUserId", userId!.toString());
    localStorage.setItem("authMethod", "otp");
    
    // Clear notification cache to refresh notifications on login
    localStorage.removeItem("notifications_last_fetched");
    
    setLocation("/profile");
  };

  const skipBiometricSetup = () => {
    // Store authentication state and proceed
    localStorage.setItem("currentUserId", userId!.toString());
    localStorage.setItem("authMethod", "pin");
    
    // Clear notification cache to refresh notifications on login
    localStorage.removeItem("notifications_last_fetched");
    
    const hasProfile = localStorage.getItem("hasProfile") === "true";
    if (hasProfile) {
      setLocation("/");
    } else {
      setLocation("/profile");
    }
  };

  const isEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const isMobile = (value: string) => {
    return /^[+]?[\d\s-()]+$/.test(value) && value.replace(/\D/g, '').length >= 10;
  };

  const getIdentifierType = (value: string) => {
    if (isEmail(value)) return "email";
    if (isMobile(value)) return "mobile";
    return "username";
  };

  if (step === "register") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center bg-warm-pattern">
        <Card className="w-full max-w-md card-hover shadow-orange">
          <CardHeader className="text-center">
            <div className="bg-white p-2 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-16 h-16 rounded-full"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Welcome to <ColorfulLogo />!</CardTitle>
            <p className="text-gray-600">Complete your registration to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                New User Registration
              </Badge>
              <p className="text-sm text-gray-600 mb-4">
                Your mobile/email: <strong>{identifier}</strong>
              </p>
              <Button 
                onClick={() => {
                  // Store a temporary user ID if needed for registration flow
                  localStorage.setItem("currentUserId", "temp");
                  setLocation("/profile");
                }}
                className="w-full gradient-warm text-white border-0 hover:opacity-90"
                size="lg"
              >
                Complete Registration
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "verify-otp") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center bg-warm-pattern">
        <Card className="w-full max-w-md card-hover shadow-orange">
          <CardHeader className="text-center">
            <div className="bg-white p-2 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-16 h-16 rounded-full"
              />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">Verify OTP</CardTitle>
            <p className="text-gray-600">Enter the verification code sent to your device</p>
          </CardHeader>
          <CardContent>
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                <div className="text-center">
                  <Badge variant="outline" className="mb-4">
                    Code sent to: {identifier}
                  </Badge>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Development Mode:</strong> Check server console logs for the latest 🔐 OTP code.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Database-backed storage now prevents OTP loss on server restarts.
                    </p>
                  </div>
                </div>

                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Verification Code
                      </FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup className="gap-2 justify-center">
                            <InputOTPSlot index={0} className="border-primary/30 focus:border-primary" />
                            <InputOTPSlot index={1} className="border-primary/30 focus:border-primary" />
                            <InputOTPSlot index={2} className="border-primary/30 focus:border-primary" />
                            <InputOTPSlot index={3} className="border-primary/30 focus:border-primary" />
                            <InputOTPSlot index={4} className="border-primary/30 focus:border-primary" />
                            <InputOTPSlot index={5} className="border-primary/30 focus:border-primary" />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full gradient-warm text-white border-0 hover:opacity-90"
                  disabled={verifyOtpMutation.isPending}
                  size="lg"
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Continue"}
                </Button>

                <div className="text-center space-y-2">
                  {countdown > 0 ? (
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Timer className="w-4 h-4 mr-1" />
                      Resend in {countdown}s
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => resendOtpMutation.mutate()}
                      disabled={resendOtpMutation.isPending}
                      className="text-primary hover:text-primary/80"
                    >
                      {resendOtpMutation.isPending ? "Sending..." : "Resend OTP"}
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("signin")}
                    className="w-full text-gray-500 hover:text-gray-700"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PIN Setup Screen
  if (step === "set-pin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center bg-warm-pattern">
        <Card className="w-full max-w-md card-hover shadow-orange">
          <CardHeader className="text-center">
            <div className="bg-white p-2 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">Setup PIN</CardTitle>
            <p className="text-gray-600">Create a 4-digit PIN for quick access</p>
          </CardHeader>
          <CardContent>
            <Form {...setPinForm}>
              <form onSubmit={setPinForm.handleSubmit(onSetPinSubmit)} className="space-y-6">
                <FormField
                  control={setPinForm.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Create PIN</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                              field.onChange(value);
                            }}
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter 4-digit PIN"
                            maxLength={4}
                            className="h-12 pl-10 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm PIN</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      value={setPinForm.watch("confirmPin") || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPinForm.setValue("confirmPin", value);
                      }}
                      type="text"
                      inputMode="numeric"
                      placeholder="Confirm 4-digit PIN"
                      maxLength={4}
                      className="h-12 pl-10 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 gradient-warm text-white border-0 hover:opacity-90"
                  size="lg"
                  disabled={setPinMutation.isPending}
                >
                  {setPinMutation.isPending ? "Setting up..." : "Create PIN"}
                  <Shield className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("signin")}
                  className="w-full text-gray-500 hover:text-gray-700"
                >
                  Back to Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Sign-In Screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center bg-warm-pattern">
      <Card className="w-full max-w-md card-hover shadow-orange">
        <CardHeader className="text-center">
          <div className="bg-white p-2 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <img 
              src={logoImage} 
              alt="Myymotto Logo" 
              className="w-16 h-16 rounded-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Welcome to <ColorfulLogo />!</CardTitle>
          <p className="text-red-600 font-medium">Timely Care for your carrier</p>
        </CardHeader>
        <CardContent>
          <Tabs value={authTab} onValueChange={(value) => setAuthTab(value as "otp" | "pin")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="otp" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                OTP Login
              </TabsTrigger>
              <TabsTrigger value="pin" className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                PIN Login
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="otp" className="mt-6">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-6">
                  <FormField
                    control={signInForm.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Email or Mobile Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            {field.value && (
                              <div className="absolute left-3 top-3 z-10">
                                {isEmail(field.value) ? (
                                  <Mail className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Smartphone className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            )}
                            <Input
                              {...field}
                              placeholder="Enter your email or mobile number"
                              className={`h-12 ${field.value ? 'pl-10' : 'pl-4'} border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-warm text-white border-0 hover:opacity-90"
                    size="lg"
                    disabled={signInMutation.isPending}
                  >
                    {signInMutation.isPending ? "Sending..." : "Send OTP"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="pin" className="mt-6">
              <Form {...pinForm}>
                <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className="space-y-6">
                  <FormField
                    control={pinForm.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Email or Mobile Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            {field.value && (
                              <div className="absolute left-3 top-3 z-10">
                                {isEmail(field.value) ? (
                                  <Mail className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Smartphone className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            )}
                            <Input
                              {...field}
                              placeholder="Enter your email or mobile number"
                              className={`h-12 ${field.value ? 'pl-10' : 'pl-4'} border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={pinForm.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">PIN</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter your 4-digit PIN"
                              maxLength={4}
                              className="h-12 pl-10 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-warm text-white border-0 hover:opacity-90"
                    size="lg"
                    disabled={pinLoginMutation.isPending}
                  >
                    {pinLoginMutation.isPending ? "Verifying..." : "Sign In with PIN"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );



  // Direct PIN Login Screen for Returning Users
  if (step === "direct-pin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center bg-warm-pattern">
        <Card className="w-full max-w-md card-hover shadow-orange">
          <CardHeader className="text-center">
            <div className="bg-white p-2 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-16 h-16 rounded-full"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back!</CardTitle>
            <p className="text-gray-600">Enter your PIN to continue</p>
            <div className="bg-gray-50 px-3 py-2 rounded-lg mt-4">
              <p className="text-sm text-gray-700">{identifier}</p>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...pinForm}>
              <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className="space-y-6">
                <FormField
                  control={pinForm.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Enter PIN</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="Enter your 4-digit PIN"
                            maxLength={4}
                            className="h-12 pl-10 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 gradient-warm text-white border-0 hover:opacity-90"
                  size="lg"
                  disabled={pinLoginMutation.isPending}
                >
                  {pinLoginMutation.isPending ? "Verifying..." : "Sign In"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      localStorage.removeItem("lastUsedIdentifier");
                      localStorage.removeItem("hasPin");
                      setStep("signin");
                      setIdentifier("");
                      setIsExistingUser(false);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Sign in with different account
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Biometric Setup Screen
  if (step === "biometric-setup") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center bg-warm-pattern">
        <Card className="w-full max-w-md card-hover shadow-orange">
          <CardHeader className="text-center">
            <div className="bg-white p-2 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Fingerprint className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">Biometric Authentication</CardTitle>
            <p className="text-gray-600">Use your fingerprint for secure access</p>
          </CardHeader>
          <CardContent>
            <Form {...biometricForm}>
              <form onSubmit={biometricForm.handleSubmit(onBiometricSubmit)} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Enhanced Security</h3>
                  <p className="text-sm text-blue-700">
                    Enable biometric authentication for quick and secure access to your account using your device's fingerprint sensor.
                  </p>
                </div>

                <FormField
                  control={biometricForm.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Enable Biometric Login
                        </FormLabel>
                        <div className="text-sm text-gray-600">
                          Use fingerprint authentication for future logins
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={skipBiometricSetup}
                    className="flex-1 h-12"
                  >
                    Skip for Now
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 gradient-warm text-white border-0 hover:opacity-90"
                    disabled={biometricSetupMutation.isPending}
                  >
                    {biometricSetupMutation.isPending ? "Setting up..." : "Continue"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default return - shouldn't reach here
  return null;
}