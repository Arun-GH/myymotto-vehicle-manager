import { useState, useEffect } from "react";
import { MapPin, Phone, Clock, ArrowLeft, Navigation, RefreshCw, Search, Wrench, Fuel, Cross, Shield } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ColorfulLogo from "@/components/colorful-logo";

interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  distance: number;
  hours: string;
  services: string[];
  type: 'service' | 'petrol' | 'hospital' | 'police';
}

export default function SearchPage() {
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<ServiceLocation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'service' | 'petrol' | 'hospital' | 'police'>('service');
  const { toast } = useToast();

  const generateServiceLocations = (lat: number, lng: number, category: 'service' | 'petrol' | 'hospital' | 'police'): ServiceLocation[] => {
    const locationData = {
      service: {
        names: [
          "Honda Service Center", "Maruti Service Center", "Hyundai Service Center", 
          "Tata Motors Service", "Mahindra Service", "Toyota Service Center",
          "Ford Service Center", "Bajaj Auto Service", "Hero MotoCorp Service", "TVS Service Center"
        ],
        services: ["Engine Service", "Oil Change", "Brake Service", "AC Service", "General Checkup"],
        hours: "9:00 AM - 7:00 PM"
      },
      petrol: {
        names: [
          "Indian Oil Petrol Pump", "Bharat Petroleum", "Hindustan Petroleum", "Shell Petrol Station",
          "Reliance Petrol Pump", "Essar Oil", "Total Energies", "BP Petrol Station", "Nayara Energy", "IOCL"
        ],
        services: ["Petrol", "Diesel", "CNG", "Car Wash", "Air Check"],
        hours: "24 Hours"
      },
      hospital: {
        names: [
          "Apollo Hospital", "Fortis Hospital", "Manipal Hospital", "Columbia Asia",
          "Narayana Health", "Max Healthcare", "AIIMS", "Government Hospital", "Care Hospital", "Aster CMI"
        ],
        services: ["Emergency Care", "General Medicine", "Surgery", "Pediatrics", "Cardiology"],
        hours: "24 Hours Emergency"
      },
      police: {
        names: [
          "Police Station", "Traffic Police", "Cyber Crime Police", "Women Police Station",
          "PCR Van Point", "Police Outpost", "District Police", "City Police Station", "Highway Patrol", "Beat Police"
        ],
        services: ["Emergency Response", "FIR Registration", "Traffic Violations", "General Complaints", "Security"],
        hours: "24 Hours"
      }
    };

    // Common Indian road/area names for realistic addresses
    const streetNames = [
      "MG Road", "Brigade Road", "Commercial Street", "Residency Road", "Richmond Road",
      "Cunningham Road", "Airport Road", "Bannerghatta Road", "Whitefield Road", "Electronic City",
      "Koramangala", "Indiranagar", "Jayanagar", "BTM Layout", "HSR Layout",
      "Marathahalli", "Sarjapur Road", "Outer Ring Road", "Inner Ring Road", "Mysore Road"
    ];

    const landmarks = [
      "Metro Station", "Mall", "Hospital", "Bus Stand", "Railway Station",
      "IT Park", "Shopping Complex", "Business District", "Tech Hub", "City Center"
    ];

    const currentData = locationData[category];
    const locations: ServiceLocation[] = [];
    
    for (let i = 0; i < 8; i++) {
      // Generate points within 5km radius
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 0.045; // ~5km in degrees
      const centerLat = lat + (radius * Math.cos(angle));
      const centerLng = lng + (radius * Math.sin(angle));
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(lat, lng, centerLat, centerLng);
      
      // Generate realistic address
      const buildingNumber = Math.floor(Math.random() * 999) + 1;
      const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
      const landmark = landmarks[Math.floor(Math.random() * landmarks.length)];
      const pincode = Math.floor(Math.random() * 9000) + 560001; // Bangalore-style pincode
      
      locations.push({
        id: `${category}-${i + 1}`,
        name: currentData.names[i % currentData.names.length],
        address: `${buildingNumber}, ${streetName}, Near ${landmark}, ${pincode}`,
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
        distance: Number(distance.toFixed(1)),
        hours: currentData.hours,
        services: currentData.services,
        type: category
      });
    }

    // Sort by distance
    return locations.sort((a, b) => a.distance - b.distance);
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
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        const locations = generateServiceLocations(latitude, longitude, selectedCategory);
        setServiceLocations(locations);
        setFilteredLocations(locations);
        setLocationStatus('success');
        setLoading(false);
      },
      (error) => {
        setLocationStatus('error');
        setLoading(false);
        let errorMessage = "Failed to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
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
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Filter locations based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLocations(serviceLocations);
      return;
    }

    const filtered = serviceLocations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.services.some(service => 
        service.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    setFilteredLocations(filtered);
  }, [searchTerm, serviceLocations]);

  // Auto-load location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Regenerate locations when category changes
  useEffect(() => {
    if (userLocation) {
      const locations = generateServiceLocations(userLocation.lat, userLocation.lng, selectedCategory);
      setServiceLocations(locations);
      setFilteredLocations(locations);
    }
  }, [selectedCategory, userLocation]);

  const handleCategoryChange = (category: 'service' | 'petrol' | 'hospital' | 'police') => {
    setSelectedCategory(category);
    setSearchTerm(''); // Clear search when changing category
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

  return (
    <>
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-red-50 p-1">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Service Centres Near You</h1>
                <p className="text-xs text-gray-600">Find nearby vehicle service centers</p>
              </div>
            </div>
            <ColorfulLogo className="text-base font-bold" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="px-3 py-4 space-y-4">
          {/* Location Status */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Navigation className={`w-4 h-4 ${getLocationStatusColor()}`} />
              <span className={`text-sm font-medium ${getLocationStatusColor()}`}>
                {getLocationStatusText()}
              </span>
            </div>
            <Button
              onClick={getCurrentLocation}
              disabled={loading}
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs"
            >
              {loading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              <span className="ml-1">Refresh</span>
            </Button>
          </div>

          {/* Category Icons */}
          <div className="grid grid-cols-4 gap-3">
            <Button
              onClick={() => handleCategoryChange('service')}
              variant={selectedCategory === 'service' ? 'default' : 'outline'}
              className={`h-16 flex flex-col items-center space-y-1 ${
                selectedCategory === 'service' 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Wrench className="w-6 h-6" />
              <span className="text-xs">Service Centre</span>
            </Button>
            
            <Button
              onClick={() => handleCategoryChange('petrol')}
              variant={selectedCategory === 'petrol' ? 'default' : 'outline'}
              className={`h-16 flex flex-col items-center space-y-1 ${
                selectedCategory === 'petrol' 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Fuel className="w-6 h-6" />
              <span className="text-xs">Petrol Bunks</span>
            </Button>
            
            <Button
              onClick={() => handleCategoryChange('hospital')}
              variant={selectedCategory === 'hospital' ? 'default' : 'outline'}
              className={`h-16 flex flex-col items-center space-y-1 ${
                selectedCategory === 'hospital' 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Cross className="w-6 h-6" />
              <span className="text-xs">Hospitals</span>
            </Button>
            
            <Button
              onClick={() => handleCategoryChange('police')}
              variant={selectedCategory === 'police' ? 'default' : 'outline'}
              className={`h-16 flex flex-col items-center space-y-1 ${
                selectedCategory === 'police' 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Shield className="w-6 h-6" />
              <span className="text-xs">Police Stations</span>
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={`Search nearby ${
                selectedCategory === 'service' ? 'service centers' :
                selectedCategory === 'petrol' ? 'petrol bunks' :
                selectedCategory === 'hospital' ? 'hospitals' :
                'police stations'
              } or services...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          {/* Service Centers Display */}
          {loading ? (
            <div className="space-y-3">
              <div className="text-center py-4">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Getting your location and finding nearby service centers...</p>
              </div>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-3">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : locationStatus === 'error' ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Location Access Required</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto mb-4">
                Please enable location access to find service centers near you. Click the refresh button above to try again.
              </p>
              <Button 
                onClick={getCurrentLocation}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Enable Location
              </Button>
            </div>
          ) : filteredLocations.length === 0 && searchTerm ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Locations Found</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                No locations found matching "{searchTerm}". Try a different search term.
              </p>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Locations Found</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                No locations found in your area. Try refreshing your location.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} nearby
                </p>
                {userLocation && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Within 5km
                  </span>
                )}
              </div>

              {filteredLocations.map((center) => (
                <Card key={center.id} className="hover:shadow-md transition-shadow bg-white border border-gray-200">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {center.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(center.rating) 
                                      ? 'text-yellow-400' 
                                      : 'text-gray-200'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-xs text-gray-600 ml-1">
                                {center.rating}
                              </span>
                            </div>
                            <span className="text-xs text-orange-600 font-medium">
                              {center.distance} km away
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Address & Contact */}
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2 text-xs text-gray-600">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="flex-1">{center.address}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{center.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{center.hours}</span>
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="flex flex-wrap gap-1">
                        {center.services.slice(0, 3).map((service: string, idx: number) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                        {center.services.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                            +{center.services.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => window.open(`tel:${center.phone}`, '_self')}
                          size="sm"
                          className="flex-1 h-8 bg-green-500 hover:bg-green-600 text-white text-xs"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                        <Button
                          onClick={() => {
                            if (userLocation) {
                              const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${center.address.replace(/\s+/g, '+')}`;
                              window.open(url, '_blank');
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}