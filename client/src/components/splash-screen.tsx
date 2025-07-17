import { useEffect, useState } from "react";
import splashImage from "@/assets/splash-screen.png";

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
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none">
        <img 
          src={splashImage} 
          alt="Myymotto Splash Screen" 
          className="w-full h-full object-contain max-w-md mx-auto"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center transition-opacity duration-300">
      <img 
        src={splashImage} 
        alt="Myymotto Splash Screen" 
        className="w-full h-full object-contain max-w-md mx-auto"
      />
    </div>
  );
}