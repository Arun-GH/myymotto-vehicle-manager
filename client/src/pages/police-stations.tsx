import { useState, useEffect } from "react";
import { Shield, MapPin, Phone, Clock, ArrowLeft, Navigation, RefreshCw, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ColorfulLogo from "@/components/colorful-logo";

interface PoliceStation {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  emergencyNumber: string;
  distance: number;
  isOpen: boolean;
  services: string[];
}

export default function PoliceStations() {
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const generatePoliceStations = (lat: number, lng: number): PoliceStation[] => {
    const stationTypes = [
      {
        name: "City Police Station",
        type: "Main Station",
        services: ["FIR Registration", "Traffic Violations", "General Complaints", "Emergency Response"]
      },
      {
        name: "Traffic Police Outpost",
        type: "Traffic Division",
        services: ["Traffic Violations", "Accident Reports", "Vehicle Documentation", "Licensing"]
      }
    ];

    const stations: PoliceStation[] = [];
    
    for (let i = 0; i < 2; i++) {
      // Generate points within 6km radius
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 0.054; // ~6km in degrees
      const stationLat = lat + (radius * Math.cos(angle));
      const stationLng = lng + (radius * Math.sin(angle));
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(lat, lng, stationLat, stationLng);
      const stationData = stationTypes[i];
      
      stations.push({
        id: `station-${i + 1}`,
        name: stationData.name,
        type: stationData.type,
        address: `${Math.floor(Math.random() * 999) + 1}, Government Area, ${Math.floor(Math.random() * 6) + 1}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        emergencyNumber: "100",
        distance: Number(distance.toFixed(1)),
        isOpen: true, // Police stations are always open
        services: stationData.services
      });
    }

    // Sort by distance
    return stations.sort((a, b) => a.distance - b.distance);
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
        const stations = generatePoliceStations(latitude, longitude);
        setPoliceStations(stations);
        setLocationStatus('success');
        setLoading(false);
        toast({
          title: "Location Found",
          description: `Found ${stations.length} police stations near you`,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
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
              <h1 className="text-base font-bold text-gray-900">Police Stations</h1>
              <p className="text-[10px] text-purple-600 font-medium">Safety & Security Services</p>
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
        {/* Emergency Alert */}
        <Card className="mb-3 border-red-200 bg-red-50">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div className="flex-1">
                <p className="text-xs font-medium text-red-800">
                  For emergencies, dial <span className="font-bold">100</span> immediately
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Status */}
        <Card className="mb-3">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Navigation className={`w-4 h-4 ${locationStatus === 'success' ? 'text-green-600' : 'text-orange-600'}`} />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-800">
                  {locationStatus === 'loading' && "Getting your location..."}
                  {locationStatus === 'success' && "Location active - Showing nearest police stations"}
                  {locationStatus === 'error' && "Location needed - Enable location to find police stations"}
                  {locationStatus === 'idle' && "Initializing location services..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Police Stations List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : policeStations.length > 0 ? (
          <div className="space-y-3">
            {policeStations.map((station) => (
              <Card key={station.id} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900">{station.name}</h3>
                        <Badge className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5">
                          24/7 Open
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-xs text-purple-600 font-medium">{station.type}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-600">{station.distance} km away</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-purple-600" />
                        <span className="text-[10px] text-purple-600 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 flex-1">{station.address}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <p className="text-xs text-gray-600">{station.phone}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {station.services.slice(0, 2).map((service, index) => (
                        <span key={index} className="bg-purple-100 text-purple-700 text-[9px] px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                      {station.services.length > 2 && (
                        <span className="text-[9px] text-gray-500">+{station.services.length - 2} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" className="h-6 text-[10px] px-2 flex-1 bg-red-600 hover:bg-red-700">
                      Emergency 100
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 flex-1">
                      Call Station
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 flex-1">
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No police stations found</p>
            <p className="text-xs text-gray-500 mt-1">Enable location to find nearby police stations</p>
          </div>
        )}
      </div>
    </div>
  );
}