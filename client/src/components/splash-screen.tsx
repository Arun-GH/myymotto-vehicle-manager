import { useEffect, useState } from "react";
import logoImage from "@assets/Mymotto_Logo_Green_Revised_1753803272333.png";
import splash2Image from "@assets/Splash2_1753803523478.JPG?url";
import ColorfulLogo from "@/components/colorful-logo";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentScreen, setCurrentScreen] = useState<"main" | "splash2" | "fadeout">("main");
  const [logoScale, setLogoScale] = useState(0.3);

  useEffect(() => {
    // Start logo animation immediately
    const animationTimer = setTimeout(() => {
      setLogoScale(1);
    }, 100);

    // Show features splash after logo animation (2 seconds)
    const featuresTimer = setTimeout(() => {
      setCurrentScreen("splash2");
    }, 2000);

    // Complete splash screen after features screen (3 seconds)
    const completeTimer = setTimeout(() => {
      setCurrentScreen("fadeout");
      setTimeout(onComplete, 300); // Allow fade out animation to complete
    }, 5000); // 2s for logo + 3s for features

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(featuresTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Main logo splash screen (3.5 seconds)
  if (currentScreen === "main") {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center transition-opacity duration-300">
        <div className="flex flex-col items-center space-y-8">
          <img 
            src={logoImage} 
            alt="Myymotto Logo" 
            className="w-64 h-64 object-contain transition-transform duration-1000 ease-out"
            style={{ 
              transform: `scale(${logoScale})`,
            }}
          />
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">
              <ColorfulLogo />
            </div>
            <p className="text-xl text-red-600">Timely Care for your carrier</p>
          </div>
        </div>
      </div>
    );
  }

  // Features splash screen (1 second)
  if (currentScreen === "splash2") {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <img 
          src={splash2Image} 
          alt="Myymotto Features" 
          className="w-full h-full object-contain max-w-md mx-auto"
        />
      </div>
    );
  }

  // Fade out screen
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none">
      <div className="flex flex-col items-center space-y-8">
        <img 
          src={splash2Image} 
          alt="Myymotto Features" 
          className="w-full h-full object-contain max-w-md mx-auto"
        />
      </div>
    </div>
  );
}