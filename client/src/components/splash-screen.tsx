import { useEffect, useState } from "react";
import logoImage from "@assets/Mymotto_Logo_Green_Revised_1753721911529.png";
import ColorfulLogo from "@/components/colorful-logo";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [logoScale, setLogoScale] = useState(0.3);

  useEffect(() => {
    // Start logo animation immediately
    const animationTimer = setTimeout(() => {
      setLogoScale(1);
    }, 100);

    // Complete splash screen after animation
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow fade out animation to complete
    }, 3500);

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-white z-50 flex flex-col items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none">
        <div className="flex flex-col items-center space-y-6">
          <img 
            src={logoImage} 
            alt="Myymotto Logo" 
            className="w-64 h-64 object-contain"
          />
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              <ColorfulLogo />
            </div>
            <p className="text-sm text-red-600">Timely Care for your carrier</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-white z-50 flex flex-col items-center justify-center transition-opacity duration-300">
      <div className="flex flex-col items-center space-y-6">
        <img 
          src={logoImage} 
          alt="Myymotto Logo" 
          className="w-64 h-64 object-contain transition-transform duration-1000 ease-out"
          style={{ 
            transform: `scale(${logoScale})`,
          }}
        />
        <div className="text-center">
          <div className="text-2xl font-bold mb-1">
            <ColorfulLogo />
          </div>
          <p className="text-sm text-red-600">Timely Care for your carrier</p>
        </div>
      </div>
    </div>
  );
}