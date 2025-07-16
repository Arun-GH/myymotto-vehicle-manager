import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CreditCard, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function Subscribe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscription = async () => {
    setIsProcessing(true);
    try {
      // Create Razorpay order
      const response = await apiRequest("POST", "/api/create-subscription");
      const { orderId, amount, currency } = await response.json();

      // Load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: amount,
          currency: currency,
          name: "Myymotto",
          description: "Annual Vehicle Management Subscription",
          order_id: orderId,
          handler: async (response: any) => {
            try {
              // Verify payment
              const verifyResponse = await apiRequest("POST", "/api/verify-subscription", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyResponse.ok) {
                toast({
                  title: "Subscription Successful!",
                  description: "You can now add up to 4 vehicles.",
                });
                setLocation("/add-vehicle");
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              toast({
                title: "Payment Verification Failed",
                description: "Please contact support.",
                variant: "destructive",
              });
            }
          },
          prefill: {
            name: "Vehicle Owner",
            email: "user@example.com",
          },
          theme: {
            color: "#dc2626",
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient-border border-4 border-red-500 shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-red-50"
                onClick={() => setLocation("/add-vehicle")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-14 h-14 rounded-lg"
              />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">Subscribe to Premium</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        <Card className="card-hover shadow-orange max-w-md mx-auto">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-gray-800">
              <Shield className="w-6 h-6 text-orange-600" />
              <span>Premium Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-800 mb-2">₹100</div>
              <div className="text-sm text-gray-600">per year</div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Add up to 4 vehicles</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Complete document management</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Smart renewal notifications</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Service center locator</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Emergency contacts management</span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-orange-800 text-center">
                <strong>Note:</strong> Free users can add up to 2 vehicles. Subscribe to add more vehicles and access all premium features.
              </p>
            </div>

            <Button
              onClick={handleSubscription}
              disabled={isProcessing}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              size="lg"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {isProcessing ? "Processing..." : "Subscribe Now - ₹100/year"}
            </Button>

            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Secure payment powered by Razorpay
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports UPI, Cards, Net Banking & Wallets
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}