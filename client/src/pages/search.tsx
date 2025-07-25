import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, MapPin, Navigation, Wrench, Fuel, Building2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function SearchPage() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'service' | 'petrol' | 'hospital' | 'police'>('service');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  // Simple search redirect functionality
  const redirectToGoogleMaps = (category: 'service' | 'petrol' | 'hospital' | 'police') => {
    const searchTerms = {
      service: "automobile service centers near me",
      petrol: "petrol pumps near me", 
      hospital: "hospitals near me",
      police: "police stations near me"
    };
    
    const searchQuery = searchTerms[category].replace(/\s+/g, '+');
    const url = `https://www.google.com/maps/search/${searchQuery}`;
    
    // Open in same tab so users can use browser back button to return
    window.location.href = url;
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting location detection...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`Location detected: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
        
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus('success');
      },
      (error) => {
        console.error('Location error:', error);
        setLocationStatus('error');
        let errorMessage = "Failed to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. You can still search on Google Maps.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please check your device's location settings.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  };

  // Auto-load location on component mount
  useEffect(() => {
    setUserLocation(null);
    setLocationStatus('loading');
    setSelectedCategory('service');
    getCurrentLocation();

    return () => {
      setUserLocation(null);
      setLocationStatus('idle');
    };
  }, []);

  // Handle category changes
  const handleCategoryChange = (category: 'service' | 'petrol' | 'hospital' | 'police') => {
    setSelectedCategory(category);
  };

  const getLocationStatusColor = () => {
    switch (locationStatus) {
      case 'success': 
        return 'text-green-600';
      case 'error': 
        return 'text-red-600';
      case 'loading': 
        return 'text-orange-600';
      default: 
        return 'text-gray-600';
    }
  };

  const getLocationStatusText = () => {
    switch (locationStatus) {
      case 'success': 
        return 'Location Active';
      case 'error': 
        return 'Location Needed';
      case 'loading': 
        return 'Getting Location...';
      default: 
        return 'Location Required';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'service': return <Wrench className="w-5 h-5" />;
      case 'petrol': return <Fuel className="w-5 h-5" />;
      case 'hospital': return <Building2 className="w-5 h-5" />;
      case 'police': return <Shield className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'service': return 'Service Centers';
      case 'petrol': return 'Petrol Bunks';
      case 'hospital': return 'Hospitals';
      case 'police': return 'Police Stations';
      default: return 'Services';
    }
  };

  return (
    <>
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-red-50 p-1">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Services Near You</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <div className={`flex items-center space-x-1 ${getLocationStatusColor()}`}>
                <MapPin className="w-3 h-3" />
                <span className="text-xs font-medium">{getLocationStatusText()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-20">
        <div className="px-3 py-4 space-y-4">
          
          {/* Category Selection */}
          <Card className="border border-orange-200 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Select Service Type</h2>
              <div className="grid grid-cols-2 gap-3">
                {['service', 'petrol', 'hospital', 'police'].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category as any)}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                      selectedCategory === category
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50'
                    }`}
                  >
                    {getCategoryIcon(category)}
                    <span className="text-xs font-medium mt-1">
                      {getCategoryName(category)}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Button Section */}
          <Card className="border border-orange-200 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="text-center space-y-2">
                  <MapPin className="w-16 h-16 text-orange-500 mx-auto" />
                  <h3 className="text-lg font-semibold text-gray-900">Find Nearby Services</h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    Click the button below to search for {getCategoryName(selectedCategory).toLowerCase()} near your location on Google Maps
                  </p>
                </div>
                
                <Button
                  onClick={() => redirectToGoogleMaps(selectedCategory)}
                  size="lg"
                  className="w-full max-w-md h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  <Navigation className="w-5 h-5 mr-3" />
                  Search on Google Maps
                </Button>
                
                <div className="text-center text-xs text-gray-500 max-w-sm space-y-1">
                  <div>
                    {locationStatus === 'success' 
                      ? "Location detected - Maps will show results near you" 
                      : locationStatus === 'loading'
                      ? "Detecting your location for better results..."
                      : "Enable location for better search results"
                    }
                  </div>
                  <div className="text-gray-400">
                    Use your browser's back button to return here after searching
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </>
  );
}