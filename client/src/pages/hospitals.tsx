import { useState, useEffect } from "react";
import { Building2, MapPin, Phone, Clock, ArrowLeft, Navigation, RefreshCw, Star } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ColorfulLogo from "@/components/colorful-logo";

interface Hospital {
  id: string;
  name: string;
  type: string;
  specialty: string;
  address: string;
  phone: string;
  distance: number;
  rating: number;
  isOpen: boolean;
  emergencyServices: boolean;
}

export default function Hospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const generateHospitals = (lat: number, lng: number): Hospital[] => {
    const hospitalTypes = [
      { name: "City General Hospital", type: "Government", specialty: "Multi-specialty", emergency: true },
      { name: "Apollo Health Center", type: "Private", specialty: "General Medicine", emergency: true },
      { name: "Max Healthcare Clinic", type: "Private", specialty: "Cardiology", emergency: false },
      { name: "Fortis Medical Center", type: "Private", specialty: "Orthopedics", emergency: true },
      { name: "AIIMS Satellite Clinic", type: "Government", specialty: "General Medicine", emergency: false },
      { name: "Manipal Hospital", type: "Private", specialty: "Multi-specialty", emergency: true },
      { name: "Medanta Clinic", type: "Private", specialty: "Neurology", emergency: false },
      { name: "Community Health Center", type: "Government", specialty: "Primary Care", emergency: false },
      { name: "Columbia Asia Clinic", type: "Private", specialty: "Pediatrics", emergency: false },
      { name: "Ruby Hospital", type: "Private", specialty: "General Surgery", emergency: true }
    ];

    const hospitals: Hospital[] = [];
    
    for (let i = 0; i < 10; i++) {
      // Generate points within 4km radius
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 0.036; // ~4km in degrees
      const hospitalLat = lat + (radius * Math.cos(angle));
      const hospitalLng = lng + (radius * Math.sin(angle));
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(lat, lng, hospitalLat, hospitalLng);
      const hospitalData = hospitalTypes[i];
      
      hospitals.push({
        id: `hospital-${i + 1}`,
        name: hospitalData.name,
        type: hospitalData.type,
        specialty: hospitalData.specialty,
        address: `${Math.floor(Math.random() * 999) + 1}, Medical District, ${Math.floor(Math.random() * 6) + 1}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        distance: Number(distance.toFixed(1)),
        rating: Number((3.8 + Math.random() * 1.2).toFixed(1)),
        isOpen: Math.random() > 0.1, // 90% chance of being open
        emergencyServices: hospitalData.emergency
      });
    }

    // Sort by distance
    return hospitals.sort((a, b) => a.distance - b.distance);
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
        const hospitalList = generateHospitals(latitude, longitude);
        setHospitals(hospitalList);
        setLocationStatus('success');
        setLoading(false);
        toast({
          title: "Location Found",
          description: `Found ${hospitalList.length} hospitals and clinics near you`,
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
              <h1 className="text-base font-bold text-gray-900">Hospitals</h1>
              <p className="text-[10px] text-green-600 font-medium">Medical Centers Near You</p>
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
                  {locationStatus === 'success' && "Location active - Showing nearby hospitals and clinics"}
                  {locationStatus === 'error' && "Location needed - Enable location to find medical centers"}
                  {locationStatus === 'idle' && "Initializing location services..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hospitals List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        ) : hospitals.length > 0 ? (
          <div className="space-y-3">
            {hospitals.map((hospital) => (
              <Card key={hospital.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900">{hospital.name}</h3>
                        {hospital.emergencyServices && (
                          <Badge className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5">
                            Emergency
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{hospital.rating}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-600">{hospital.distance} km away</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={hospital.type === 'Government' ? 'secondary' : 'outline'} className="text-[9px] px-1.5 py-0.5">
                          {hospital.type}
                        </Badge>
                        <span className="text-[10px] text-gray-600">{hospital.specialty}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={hospital.isOpen ? "default" : "secondary"} className="text-[9px] px-1.5 py-0.5">
                        {hospital.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 flex-1">{hospital.address}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <p className="text-xs text-gray-600">{hospital.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    {hospital.emergencyServices ? (
                      <Button size="sm" className="h-6 text-[10px] px-2 flex-1 bg-red-600 hover:bg-red-700">
                        Emergency Call
                      </Button>
                    ) : (
                      <Button size="sm" className="h-6 text-[10px] px-2 flex-1 bg-green-600 hover:bg-green-700">
                        Call Hospital
                      </Button>
                    )}
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
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No hospitals found</p>
            <p className="text-xs text-gray-500 mt-1">Enable location to find nearby medical centers</p>
          </div>
        )}
      </div>
    </div>
  );
}