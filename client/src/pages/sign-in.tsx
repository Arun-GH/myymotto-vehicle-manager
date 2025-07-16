import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Smartphone, Mail, Lock, ArrowRight, Timer } from "lucide-react";
import { signInSchema, verifyOtpSchema, type SignInData, type VerifyOtpData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

type AuthStep = "signin" | "verify-otp" | "register";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<AuthStep>("signin");
  const [identifier, setIdentifier] = useState("");
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      console.log("Sending OTP verification request:", data);
      const response = await apiRequest("POST", "/api/auth/verify-otp", data);
      const result = await response.json();
      console.log("OTP verification response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("OTP verification successful:", data);
      toast({
        title: "Success",
        description: "Successfully signed in!",
      });
      
      // Store user ID for authentication
      localStorage.setItem("currentUserId", data.userId.toString());
      
      // Invalidate auth queries and redirect
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      
      if (data.hasProfile) {
        setLocation("/");
      } else {
        setLocation("/profile");
      }
    },
    onError: (error: any) => {
      console.error("OTP verification error:", error);
      toast({
        title: "Invalid OTP",
        description: error.message || "Please check your OTP and try again",
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
    console.log("OTP Submit data:", { identifier, otp: data.otp });
    verifyOtpMutation.mutate({
      identifier,
      otp: data.otp
    });
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
            <CardTitle className="text-2xl font-bold gradient-text">Welcome to <ColorfulLogo className="inline" />!</CardTitle>
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center bg-warm-pattern">
      <Card className="w-full max-w-md card-hover shadow-xl">
        <CardHeader className="text-center">
          <div className="bg-white p-2 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <img 
              src={logoImage} 
              alt="Myymotto Logo" 
              className="w-16 h-16 rounded-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">Welcome to <ColorfulLogo className="inline" /></CardTitle>
          <p className="text-red-600">Timely Care for your carrier</p>
        </CardHeader>
        <CardContent>
          <Form {...signInForm}>
            <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-6">
              <FormField
                control={signInForm.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      {getIdentifierType(field.value) === "email" ? (
                        <Mail className="w-4 h-4 mr-2" />
                      ) : (
                        <Smartphone className="w-4 h-4 mr-2" />
                      )}
                      Mobile Number or Email
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter mobile number or email"
                        type={getIdentifierType(field.value) === "email" ? "email" : "tel"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full gradient-warm text-white border-0 hover:opacity-90"
                disabled={signInMutation.isPending}
                size="lg"
              >
                {signInMutation.isPending ? "Sending OTP..." : "Continue with OTP"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center text-sm text-gray-500">
                <p>We'll send you a verification code</p>
                <p className="mt-1">New users will be guided through registration</p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}