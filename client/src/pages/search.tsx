import { useState, useEffect } from "react";
import { Search, Car, FileText, Calendar, ArrowLeft, Filter } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { type Vehicle } from "@shared/schema";
import ColorfulLogo from "@/components/colorful-logo";

interface SearchResult {
  id: string;
  type: 'vehicle' | 'document' | 'service' | 'notification';
  title: string;
  subtitle: string;
  description: string;
  link: string;
  vehicleId?: number;
  date?: string;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'vehicles' | 'documents' | 'services'>('all');

  const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";

  // Fetch user data for search
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles", currentUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles?userId=${currentUserId}`);
      return response.json();
    },
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications", currentUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/notifications?userId=${currentUserId}`);
      return response.json();
    },
  });

  // Perform search when search term changes
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    performSearch(searchTerm);
  }, [searchTerm, vehicles, notifications, filter]);

  const performSearch = (query: string) => {
    const results: SearchResult[] = [];
    const lowercaseQuery = query.toLowerCase();

    // Search vehicles
    if (filter === 'all' || filter === 'vehicles') {
      vehicles.forEach((vehicle) => {
        const searchableText = `${vehicle.make} ${vehicle.model} ${vehicle.licenseNumber} ${vehicle.vehicleType} ${vehicle.fuelType}`.toLowerCase();
        if (searchableText.includes(lowercaseQuery)) {
          results.push({
            id: `vehicle-${vehicle.id}`,
            type: 'vehicle',
            title: `${vehicle.make} ${vehicle.model}`.trim() || 'Vehicle',
            subtitle: vehicle.licenseNumber || 'No license number',
            description: `${vehicle.vehicleType} • ${vehicle.fuelType}`.replace('• undefined', '').replace('undefined • ', ''),
            link: `/vehicle/${vehicle.id}/edit`,
            vehicleId: vehicle.id
          });
        }
      });
    }

    // Search notifications/reminders
    if (filter === 'all' || filter === 'services') {
      notifications.forEach((notification) => {
        const searchableText = `${notification.title} ${notification.message} ${notification.type}`.toLowerCase();
        if (searchableText.includes(lowercaseQuery)) {
          results.push({
            id: `notification-${notification.id}`,
            type: 'notification',
            title: notification.title,
            subtitle: notification.type.charAt(0).toUpperCase() + notification.type.slice(1) + ' Reminder',
            description: notification.message,
            link: `/vehicle/${notification.vehicleId}/edit`,
            vehicleId: notification.vehicleId,
            date: notification.createdAt
          });
        }
      });
    }

    // Add general app features if they match search
    if (filter === 'all') {
      const appFeatures = [
        {
          id: 'add-vehicle',
          type: 'vehicle' as const,
          title: 'Add New Vehicle',
          subtitle: 'Vehicle Management',
          description: 'Add a new vehicle to your account',
          link: '/add-vehicle'
        },
        {
          id: 'profile',
          type: 'document' as const,
          title: 'Profile Settings',
          subtitle: 'Account Management',
          description: 'Manage your profile and personal information',
          link: '/profile'
        },
        {
          id: 'traffic-violations',
          type: 'service' as const,
          title: 'Traffic Violations',
          subtitle: 'Legal Compliance',
          description: 'Check traffic violations for your vehicles',
          link: '/traffic-violations'
        },
        {
          id: 'insurance',
          type: 'document' as const,
          title: 'Insurance Management',
          subtitle: 'Policy Management',
          description: 'Manage vehicle insurance and renewals',
          link: '/insurance'
        },
        {
          id: 'broadcast',
          type: 'service' as const,
          title: 'Community Posts',
          subtitle: 'Social Features',
          description: 'View and create community posts',
          link: '/broadcast'
        }
      ];

      appFeatures.forEach((feature) => {
        const searchableText = `${feature.title} ${feature.subtitle} ${feature.description}`.toLowerCase();
        if (searchableText.includes(lowercaseQuery)) {
          results.push(feature);
        }
      });
    }

    setSearchResults(results);
    setIsSearching(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'vehicle': return <Car className="w-4 h-4 text-blue-600" />;
      case 'document': return <FileText className="w-4 h-4 text-green-600" />;
      case 'service': return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'notification': return <Calendar className="w-4 h-4 text-orange-600" />;
      default: return <Search className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vehicle': return 'bg-blue-50 text-blue-700';
      case 'document': return 'bg-green-50 text-green-700';
      case 'service': return 'bg-purple-50 text-purple-700';
      case 'notification': return 'bg-orange-50 text-orange-700';
      default: return 'bg-gray-50 text-gray-700';
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
                <h1 className="text-lg font-semibold text-gray-900">Search</h1>
                <p className="text-xs text-gray-600">Find vehicles, documents & more</p>
              </div>
            </div>
            <ColorfulLogo className="text-base font-bold" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="px-3 py-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search vehicles, documents, reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          {/* Filter Options */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All', icon: Search },
              { id: 'vehicles', label: 'Vehicles', icon: Car },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'services', label: 'Services', icon: Calendar }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={filter === id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(id as any)}
                className={`flex-shrink-0 h-8 px-3 text-xs ${
                  filter === id 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3 h-3 mr-1.5" />
                {label}
              </Button>
            ))}
          </div>

          {/* Search Results */}
          {searchTerm.trim().length < 2 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search Your Data</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Type at least 2 characters to search through your vehicles, documents, reminders, and app features.
              </p>
            </div>
          ) : isSearching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-3">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                No results found for "{searchTerm}". Try different keywords or check the filters above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  filter === 'all' ? 'bg-gray-100 text-gray-700' : getTypeColor(filter)
                }`}>
                  {filter === 'all' ? 'All Categories' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </span>
              </div>

              {searchResults.map((result) => (
                <Link key={result.id} href={result.link}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {result.title}
                              </h3>
                              <p className="text-xs text-gray-600 truncate">
                                {result.subtitle}
                              </p>
                            </div>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getTypeColor(result.type)}`}>
                              {result.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {result.description}
                          </p>
                          {result.date && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(result.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}