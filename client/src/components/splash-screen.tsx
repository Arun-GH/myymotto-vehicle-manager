import { useEffect, useState } from "react";
import { Clock, FileCheck, ClipboardList, MapPin, Bell } from "lucide-react";
import ColorfulLogo from "@/components/colorful-logo";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow fade out animation to complete
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-orange-50 z-50 flex flex-col items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none">
        <div className="max-w-sm mx-auto px-6">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <Clock className="w-8 h-8 text-red-500 mr-2" />
            </div>
            <div className="text-3xl font-bold mb-2">
              <ColorfulLogo />
            </div>
            <p className="text-red-600 font-medium">Timely Care For Your Carrier</p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                <FileCheck className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-700 font-medium">Easy Save and retrieval of Vehicle documents</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                <Bell className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-700 font-medium">Timely alerts for scheduled maintenance</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-pink-100 rounded-full flex items-center justify-center">
                <ClipboardList className="w-8 h-8 text-pink-600" />
              </div>
              <p className="text-sm text-gray-700 font-medium">Maintain Service History</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-700 font-medium">Find Service centers near you</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-orange-50 z-50 flex flex-col items-center justify-center transition-opacity duration-300">
      <div className="max-w-sm mx-auto px-6">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <Clock className="w-8 h-8 text-red-500 mr-2" />
          </div>
          <div className="text-3xl font-bold mb-2">
            <ColorfulLogo />
          </div>
          <p className="text-red-600 font-medium">Timely Care For Your Carrier</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <FileCheck className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-700 font-medium">Easy Save and retrieval of Vehicle documents</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-700 font-medium">Timely alerts for scheduled maintenance</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-pink-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-pink-600" />
            </div>
            <p className="text-sm text-gray-700 font-medium">Maintain Service History</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-700 font-medium">Find Service centers near you</p>
          </div>
        </div>
      </div>
    </div>
  );
}