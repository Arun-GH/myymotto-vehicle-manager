import { useEffect, useState } from "react";
import logoImage from "@assets/Mymotto_Logo_Green_Revised_1753803272333.png";
import splash2Image from "@assets/Splash2_1753803363441.PNG?url";
import ColorfulLogo from "@/components/colorful-logo";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentScreen, setCurrentScreen] = useState<"splash2" | "main" | "fadeout">("splash2");
  const [logoScale, setLogoScale] = useState(0.3);

  useEffect(() => {
    // Show second splash for 1 second
    const splash2Timer = setTimeout(() => {
      setCurrentScreen("main");
      // Start logo animation immediately when main splash appears
      setTimeout(() => {
        setLogoScale(1);
      }, 100);
    }, 1000);

    // Complete splash screen after main animation
    const completeTimer = setTimeout(() => {
      setCurrentScreen("fadeout");
      setTimeout(onComplete, 300); // Allow fade out animation to complete
    }, 4500); // 1s for splash2 + 3.5s for main splash

    return () => {
      clearTimeout(splash2Timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Second splash screen (1 second)
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
  if (currentScreen === "fadeout") {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none">
        <div className="flex flex-col items-center space-y-8">
          <img 
            src={logoImage} 
            alt="Myymotto Logo" 
            className="w-64 h-64 object-contain"
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

  // Main splash screen (3.5 seconds)
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