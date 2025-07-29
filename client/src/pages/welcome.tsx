import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ColorfulLogo from "@/components/colorful-logo";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Show "Create your profile" toast immediately
    toast({
      title: "Create your profile",
      description: "Let's get started with your vehicle management",
    });

    // Show welcome screen for 1 second, then redirect to profile
    const timer = setTimeout(() => {
      setLocation("/profile");
    }, 1000);

    return () => clearTimeout(timer);
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-sm mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="animate-pulse">
            <ColorfulLogo className="w-20 h-20" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to <span className="text-orange-600">Myymotto</span>!
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          Timely Care for your carrier
        </p>
        
        <p className="text-sm text-gray-500">
          Let's get your profile set up...
        </p>
        
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}