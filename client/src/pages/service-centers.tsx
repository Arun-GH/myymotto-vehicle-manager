import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search, MapPin, Phone, Clock, Star, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  phone: string;
  services: string[];
  openHours: string;
  lat: number;
  lng: number;
}

export default function ServiceCenters() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Mock service centers data (in production, this would come from a real API)
  const mockServiceCenters: ServiceCenter[] = [
    {
      id: "1",
      name: "AutoCare Pro Service Center",
      address: "123 Main Street, Sector 15, Gurgaon, Haryana",
      distance: "1.2 km",
      rating: 4.5,
      phone: "+91 98765 43210",
      services: ["Oil Change", "Brake Service", "AC Repair", "General Maintenance"],
      openHours: "9:00 AM - 7:00 PM",
      lat: 28.4595,
      lng: 77.0266
    },
    {
      id: "2", 
      name: "Speed Motors Workshop",
      address: "456 Service Road, DLF Phase 2, Gurgaon, Haryana",
      distance: "2.8 km",
      rating: 4.2,
      phone: "+91 98765 43211",
      services: ["Engine Repair", "Transmission", "Electrical", "Tyre Service"],
      openHours: "8:30 AM - 8:00 PM",
      lat: 28.4692,
      lng: 77.0507
    },
    {
      id: "3",
      name: "Expert Auto Solutions",
      address: "789 Industrial Area, Phase 1, Gurgaon, Haryana", 
      distance: "3.5 km",
      rating: 4.7,
      phone: "+91 98765 43212",
      services: ["Denting & Painting", "Insurance Claims", "Oil Change", "Brake Service"],
      openHours: "9:00 AM - 6:00 PM",
      lat: 28.4089,
      lng: 77.0418
    },
    {
      id: "4",
      name: "Premium Car Care",
      address: "321 Mall Road, Sector 28, Gurgaon, Haryana",
      distance: "4.1 km", 
      rating: 4.0,
      phone: "+91 98765 43213",
      services: ["Detailing", "AC Service", "Battery", "General Checkup"],
      openHours: "10:00 AM - 8:00 PM",
      lat: 28.4601,
      lng: 77.0729
    },
    {
      id: "5",
      name: "Reliable Motors",
      address: "654 NH-8, Sector 32, Gurgaon, Haryana",
      distance: "5.2 km",
      rating: 3.8,
      phone: "+91 98765 43214", 
      services: ["Engine Diagnostics", "Suspension", "Clutch Repair", "Oil Change"],
      openHours: "8:00 AM - 7:30 PM",
      lat: 28.4314,
      lng: 77.0688
    }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setIsLoading(false);
      // Load default service centers
      setServiceCenters(mockServiceCenters);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // In a real app, you'd make an API call to get nearby service centers
        // For now, we'll use mock data with calculated distances
        const centersWithDistance = mockServiceCenters.map(center => ({
          ...center,
          distance: calculateDistance(latitude, longitude, center.lat, center.lng)
        })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        
        setServiceCenters(centersWithDistance);
        setIsLoading(false);
      },
      (error) => {
        setLocationError("Unable to retrieve your location");
        setIsLoading(false);
        // Load default service centers
        setServiceCenters(mockServiceCenters);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): string => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1) + " km";
  };

  const filteredCenters = serviceCenters.filter(center =>
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openInMaps = (center: ServiceCenter) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const callCenter = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-warm text-white shadow-lg sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="bg-white/20 p-1 rounded-xl">
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-8 h-8 rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Myymotto</h1>
              <p className="text-xs text-white/80">Service Centers</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search service centers or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location Status */}
        <Card className="mb-4 shadow-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  {userLocation ? "Using your current location" : "Using default location"}
                </span>
              </div>
              {!userLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                >
                  {isLoading ? "Locating..." : "Get Location"}
                </Button>
              )}
            </div>
            {locationError && (
              <p className="text-xs text-orange-600 mt-1">{locationError}</p>
            )}
          </CardContent>
        </Card>

        {/* Service Centers List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Nearby Service Centers ({filteredCenters.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCenters.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No service centers found</p>
                <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredCenters.map((center) => (
              <Card key={center.id} className="card-hover shadow-lg">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{center.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{center.address}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{center.distance}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{center.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{center.openHours}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {center.services.slice(0, 3).map((service, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {center.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{center.services.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => openInMaps(center)}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Directions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => callCenter(center.phone)}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}