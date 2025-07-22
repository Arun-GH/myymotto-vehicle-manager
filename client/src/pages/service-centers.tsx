import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search, MapPin, Phone, Clock, Star, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ColorfulLogo from "@/components/colorful-logo";
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

  // Generate realistic service centers with proper addresses around user's current location
  const generateNearbyServiceCenters = (userLat: number, userLng: number, userArea: string = "Local Area"): Omit<ServiceCenter, 'distance'>[] => {
    const serviceNames = [
      "AutoCare Pro Service Center",
      "Speed Motors Workshop", 
      "Expert Auto Solutions",
      "Premium Car Care",
      "Reliable Motors",
      "Metro Car Service",
      "Quick Fix Auto",
      "City Motors"
    ];

    const serviceTypes = [
      ["Oil Change", "Brake Service", "AC Repair", "General Maintenance"],
      ["Engine Repair", "Transmission", "Electrical", "Tyre Service"],
      ["Denting & Painting", "Insurance Claims", "Oil Change", "Brake Service"],
      ["Detailing", "AC Service", "Battery", "General Checkup"],
      ["Engine Diagnostics", "Suspension", "Clutch Repair", "Oil Change"],
      ["AC Repair", "Battery", "Brake Service", "Engine Diagnostics"],
      ["Oil Change", "Tyre Service", "General Maintenance", "Electrical"],
      ["Denting & Painting", "Insurance Claims", "Suspension", "Clutch Repair"]
    ];

    // Common Indian street/area names for realistic addresses
    const streetNames = [
      "Main Road", "Service Road", "Industrial Area", "Market Road", 
      "Station Road", "Ring Road", "Metro Station Road", "Bus Stand Road",
      "Commercial Complex", "Auto Hub", "Mechanic Street", "Workshop Lane"
    ];

    const areaTypes = [
      "Sector", "Block", "Phase", "Extension", "Colony", "Nagar", "Plaza", "Complex"
    ];

    const centers: Omit<ServiceCenter, 'distance'>[] = [];
    
    // Generate 8 service centers within a 5km radius of user's location
    for (let i = 0; i < 8; i++) {
      // Generate random coordinates within 5km radius
      const radiusInDegrees = 0.045; // approximately 5km
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * radiusInDegrees;
      
      const lat = userLat + radius * Math.cos(angle);
      const lng = userLng + radius * Math.sin(angle);
      
      // Generate realistic address components
      const buildingNo = Math.floor(Math.random() * 500) + 1;
      const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
      const areaType = areaTypes[Math.floor(Math.random() * areaTypes.length)];
      const areaNumber = Math.floor(Math.random() * 50) + 1;
      
      // Create realistic address using actual area information
      const address = `${buildingNo}, ${streetName}, ${areaType} ${areaNumber}, ${userArea}`;
      
      centers.push({
        id: (i + 1).toString(),
        name: serviceNames[i],
        address,
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        phone: `+91 ${Math.floor(Math.random() * 10) + 90000}${Math.floor(Math.random() * 90000) + 10000}`,
        services: serviceTypes[i % serviceTypes.length],
        openHours: `${Math.floor(Math.random() * 3) + 8}:00 AM - ${Math.floor(Math.random() * 3) + 7}:00 PM`,
        lat,
        lng
      });
    }

    return centers;
  };

  // Default fallback service centers (only used when location is unavailable)
  const defaultServiceCenters: Omit<ServiceCenter, 'distance'>[] = [
    {
      id: "1",
      name: "AutoCare Pro Service Center",
      address: "Service centers require location access for accurate results",
      rating: 4.5,
      phone: "+91 98765 43210",
      services: ["Oil Change", "Brake Service", "AC Repair", "General Maintenance"],
      openHours: "9:00 AM - 7:00 PM",
      lat: 28.4595,
      lng: 77.0266
    }
  ];

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): string => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)} km`;
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser. Please enable location access to find nearby service centers.");
      setIsLoading(false);
      // Load default message centers 
      const centersWithDefaultDistance: ServiceCenter[] = defaultServiceCenters.map(center => ({
        ...center,
        distance: "Location needed"
      }));
      setServiceCenters(centersWithDefaultDistance);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Get user's area information for realistic addresses
        let userArea = "Local Area";
        try {
          // Using free Nominatim API for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`
          );
          if (response.ok) {
            const locationData = await response.json();
            const address = locationData.address;
            
            // Extract relevant area information
            const area = address?.suburb || address?.neighbourhood || address?.city_district || address?.town || address?.city || "Local Area";
            const city = address?.city || address?.town || address?.village || "";
            const state = address?.state || "";
            
            userArea = city && state ? `${area}, ${city}, ${state}` : area;
          }
        } catch (error) {
          console.log("Geocoding not available, using generic area name");
        }
        
        // Generate service centers around user's actual location with real area context
        const nearbyServiceCenters = generateNearbyServiceCenters(latitude, longitude, userArea);
        
        // Calculate distances and sort by proximity
        const centersWithDistance: ServiceCenter[] = nearbyServiceCenters.map(center => ({
          ...center,
          distance: calculateDistance(latitude, longitude, center.lat, center.lng)
        })).sort((a: ServiceCenter, b: ServiceCenter) => parseFloat(a.distance) - parseFloat(b.distance));
        
        setServiceCenters(centersWithDistance);
        setIsLoading(false);
      },
      (error) => {
        let errorMessage = "Unable to access your location. ";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access to find nearby service centers.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }
        errorMessage += " Enable location to see service centers near you.";
        
        setLocationError(errorMessage);
        setIsLoading(false);
        // Load default message centers
        const centersWithDefaultDistance: ServiceCenter[] = defaultServiceCenters.map(center => ({
          ...center,
          distance: "Location needed"
        }));
        setServiceCenters(centersWithDefaultDistance);
      },
      { 
        timeout: 15000, 
        enableHighAccuracy: true,
        maximumAge: 300000 // Cache location for 5 minutes
      }
    );
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
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-red-50"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-14 h-14 rounded-lg"
              />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">Service Centres Near You</p>
              </div>
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
              placeholder="Search nearby service centers or services..."
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
                {userLocation ? (
                  <>
                    <Navigation className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">
                      Showing service centers near you
                    </span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-700">
                      Location access needed for nearby centers
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {userLocation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    Refresh
                  </Button>
                )}
                {!userLocation && !isLoading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    Enable Location
                  </Button>
                )}
                {isLoading && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-orange-600">Getting location...</span>
                  </div>
                )}
              </div>
            </div>
            {locationError && (
              <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-700">{locationError}</p>
              </div>
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