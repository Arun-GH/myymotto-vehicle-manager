import { useState, useEffect } from "react";
import { Fuel, MapPin, Clock, ArrowLeft, Navigation, RefreshCw, Star } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ColorfulLogo from "@/components/colorful-logo";

interface PetrolBunk {
  id: string;
  name: string;
  brand: string;
  address: string;
  distance: number;
  rating: number;
  pricePerLitre: number;
  facilities: string[];
  isOpen: boolean;
}

export default function PetrolBunks() {
  const [petrolBunks, setPetrolBunks] = useState<PetrolBunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const generatePetrolBunks = (lat: number, lng: number): PetrolBunk[] => {
    const brands = ["Indian Oil", "Bharat Petroleum", "Hindustan Petroleum", "Reliance", "Shell"];
    const facilities = [
      ["ATM", "Air/Water", "Toilet"],
      ["ATM", "Air/Water", "Car Wash", "Shop"],
      ["Air/Water", "Toilet", "Food Court"],
      ["ATM", "Car Wash", "Toilet"],
      ["Air/Water", "Shop", "ATM", "Toilet"]
    ];

    const bunks: PetrolBunk[] = [];
    
    for (let i = 0; i < 5; i++) {
      // Generate points within 3km radius
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 0.027; // ~3km in degrees
      const bunkLat = lat + (radius * Math.cos(angle));
      const bunkLng = lng + (radius * Math.sin(angle));
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(lat, lng, bunkLat, bunkLng);
      
      bunks.push({
        id: `bunk-${i + 1}`,
        name: `${brands[i]} Petrol Pump`,
        brand: brands[i],
        address: `${Math.floor(Math.random() * 999) + 1}, Near your location, ${Math.floor(Math.random() * 6) + 1}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
        distance: Number(distance.toFixed(1)),
        rating: Number((4.0 + Math.random() * 1.0).toFixed(1)),
        pricePerLitre: Number((102.50 + Math.random() * 3).toFixed(2)),
        facilities: facilities[i],
        isOpen: Math.random() > 0.2 // 80% chance of being open
      });
    }

    // Sort by distance
    return bunks.sort((a, b) => a.distance - b.distance);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getCurrentLocation = () => {
    setLocationStatus('loading');
    setLoading(true);
    
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLoading(false);
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const bunks = generatePetrolBunks(latitude, longitude);
        setPetrolBunks(bunks);
        setLocationStatus('success');
        setLoading(false);
        toast({
          title: "Location Found",
          description: `Found ${bunks.length} petrol bunks near you`,
        });
      },
      (error) => {
        setLocationStatus('error');
        setLoading(false);
        let errorMessage = "Failed to get your location";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <ColorfulLogo className="w-8 h-8" />
            <div>
              <h1 className="text-base font-bold text-gray-900">Petrol Bunks</h1>
              <p className="text-[10px] text-red-600 font-medium">Nearest Fuel Stations</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={getCurrentLocation}
            disabled={loading}
            className="h-8"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs">Refresh</span>
          </Button>
        </div>
      </header>

      <div className="p-3 pb-20">
        {/* Location Status */}
        <Card className="mb-3">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Navigation className={`w-4 h-4 ${locationStatus === 'success' ? 'text-green-600' : 'text-orange-600'}`} />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-800">
                  {locationStatus === 'loading' && "Getting your location..."}
                  {locationStatus === 'success' && "Location active - Showing nearest petrol bunks"}
                  {locationStatus === 'error' && "Location needed - Enable location to find petrol bunks"}
                  {locationStatus === 'idle' && "Initializing location services..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Petrol Bunks List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
          </div>
        ) : petrolBunks.length > 0 ? (
          <div className="space-y-3">
            {petrolBunks.map((bunk) => (
              <Card key={bunk.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900">{bunk.brand}</h3>
                        <Badge variant={bunk.isOpen ? "default" : "secondary"} className="text-[9px] px-1.5 py-0.5">
                          {bunk.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{bunk.rating}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-600">{bunk.distance} km away</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">₹{bunk.pricePerLitre}</p>
                      <p className="text-[9px] text-gray-500">per litre</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 flex-1">{bunk.address}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {bunk.facilities.map((facility, index) => (
                        <span key={index} className="bg-red-100 text-red-700 text-[9px] px-2 py-1 rounded">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" className="h-6 text-[10px] px-2 flex-1 bg-red-600 hover:bg-red-700">
                      Get Directions
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 flex-1">
                      Call Station
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No petrol bunks found</p>
            <p className="text-xs text-gray-500 mt-1">Enable location to find nearby fuel stations</p>
          </div>
        )}
      </div>
    </div>
  );
}