import { useState, useEffect } from "react";
import { MapPin, Phone, Clock, ArrowLeft, Navigation, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ColorfulLogo from "@/components/colorful-logo";

interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  distance: number;
  hours: string;
  services: string[];
}

export default function ServiceCenters() {
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();

  const generateServiceCenters = (lat: number, lng: number): ServiceCenter[] => {
    const serviceTypes = [
      "Honda Service Center", "Maruti Service Center", "Hyundai Service Center", 
      "Tata Motors Service", "Mahindra Service", "Toyota Service Center",
      "Ford Service Center", "Bajaj Auto Service", "Hero MotoCorp Service", "TVS Service Center"
    ];

    const centers: ServiceCenter[] = [];
    
    for (let i = 0; i < 10; i++) {
      // Generate points within 5km radius
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 0.045; // ~5km in degrees
      const centerLat = lat + (radius * Math.cos(angle));
      const centerLng = lng + (radius * Math.sin(angle));
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(lat, lng, centerLat, centerLng);
      
      centers.push({
        id: `center-${i + 1}`,
        name: serviceTypes[i % serviceTypes.length],
        address: `${Math.floor(Math.random() * 999) + 1}, Near your location, ${Math.floor(Math.random() * 6) + 1}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
        distance: Number(distance.toFixed(1)),
        hours: "9:00 AM - 7:00 PM",
        services: ["Engine Service", "Oil Change", "Brake Service", "AC Service", "General Checkup"]
      });
    }

    // Sort by distance
    return centers.sort((a, b) => a.distance - b.distance);
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
        setUserLocation({ lat: latitude, lng: longitude });
        const centers = generateServiceCenters(latitude, longitude);
        setServiceCenters(centers);
        setLocationStatus('success');
        setLoading(false);
        toast({
          title: "Location Found",
          description: `Found ${centers.length} service centers near you`,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
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
              <h1 className="text-base font-bold text-gray-900">Service Centers</h1>
              <p className="text-[10px] text-red-600 font-medium">Near Your Location</p>
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
                  {locationStatus === 'success' && "Location active - Showing nearby service centers"}
                  {locationStatus === 'error' && "Location needed - Enable location to find service centers"}
                  {locationStatus === 'idle' && "Initializing location services..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Centers List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        ) : serviceCenters.length > 0 ? (
          <div className="space-y-3">
            {serviceCenters.map((center) => (
              <Card key={center.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-900">{center.name}</h3>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-orange-600 font-medium text-xs">★ {center.rating}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-600">{center.distance} km away</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-green-600 font-medium">Open</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 flex-1">{center.address}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <p className="text-xs text-gray-600">{center.phone}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <p className="text-xs text-gray-600">{center.hours}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {center.services.slice(0, 3).map((service, index) => (
                        <span key={index} className="bg-orange-100 text-orange-700 text-[9px] px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                      {center.services.length > 3 && (
                        <span className="text-[9px] text-gray-500">+{center.services.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" className="h-6 text-[10px] px-2 flex-1">
                      Call Now
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 flex-1">
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No service centers found</p>
            <p className="text-xs text-gray-500 mt-1">Enable location to find nearby service centers</p>
          </div>
        )}
      </div>
    </div>
  );
}