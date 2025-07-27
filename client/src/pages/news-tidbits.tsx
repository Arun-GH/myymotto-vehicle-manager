import { ArrowLeft, ExternalLink, Newspaper, Zap, Car, Truck, Bike, AlertTriangle, RefreshCw, Settings, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ColorfulLogo from "@/components/colorful-logo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: "policy" | "launch" | "news" | "event" | "offers";
  date: string;
  source: string;
  link: string;
  priority: "high" | "medium" | "low";
}

export default function NewsTidbits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for selected category filter - default to "offers"
  const [selectedCategory, setSelectedCategory] = useState<string>("offers");

  // Fetch news data from API
  const { data: newsItems = [], isLoading, error } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes only
  });

  // Fetch cache info
  const { data: cacheInfo } = useQuery({
    queryKey: ["/api/news/cache-info"],
    refetchInterval: 1000 * 60, // Refresh every minute
  });

  // Refresh news mutation
  const refreshNewsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/news/refresh"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news/cache-info"] });
      // No popup notification - just silent refresh
    },
    onError: () => {
      // Silent error handling - no popup
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "policy":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "launch":
        return <Zap className="w-4 h-4 text-green-600" />;
      case "news":
        return <Newspaper className="w-4 h-4 text-blue-600" />;
      case "event":
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case "offers":
        return <DollarSign className="w-4 h-4 text-orange-600" />;
      default:
        return <Newspaper className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "policy":
        return "bg-red-100 text-red-800";
      case "launch":
        return "bg-green-100 text-green-800";
      case "news":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-purple-100 text-purple-800";
      case "offers":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-red-500";
      case "medium":
        return "border-l-4 border-orange-500";
      case "low":
        return "border-l-4 border-gray-400";
      default:
        return "border-l-4 border-gray-300";
    }
  };

  // Filter news items based on selected category
  const filteredNewsItems = newsItems.filter(item => 
    selectedCategory === "all" ? true : item.category === selectedCategory
  );

  // Category button configuration
  const categories = [
    { id: "launch", label: "Launches", icon: Zap, color: "green" },
    { id: "event", label: "Events", icon: Calendar, color: "purple" },
    { id: "policy", label: "Policies", icon: AlertTriangle, color: "red" },
    { id: "offers", label: "Offers", icon: DollarSign, color: "orange" }
  ];

  const getCategoryButtonStyle = (categoryId: string, color: string) => {
    const isSelected = selectedCategory === categoryId;
    const baseClasses = "flex-1 p-3 text-center transition-all duration-200 flex flex-col items-center space-y-1";
    
    switch (color) {
      case "green":
        return `${baseClasses} ${isSelected 
          ? "bg-green-100 text-green-800 border-2 border-green-500 shadow-lg" 
          : "bg-white text-green-600 border border-green-200 hover:bg-green-50"}`;
      case "purple":
        return `${baseClasses} ${isSelected 
          ? "bg-purple-100 text-purple-800 border-2 border-purple-500 shadow-lg" 
          : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"}`;
      case "red":
        return `${baseClasses} ${isSelected 
          ? "bg-red-100 text-red-800 border-2 border-red-500 shadow-lg" 
          : "bg-white text-red-600 border border-red-200 hover:bg-red-50"}`;
      case "orange":
        return `${baseClasses} ${isSelected 
          ? "bg-orange-100 text-orange-800 border-2 border-orange-500 shadow-lg" 
          : "bg-white text-orange-600 border border-orange-200 hover:bg-orange-50"}`;
      default:
        return `${baseClasses} ${isSelected 
          ? "bg-gray-100 text-gray-800 border-2 border-gray-500 shadow-lg" 
          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-gray-600 hover:text-red-500">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <Newspaper className="w-6 h-6 text-orange-600" />
                <div>
                  <h1 className="text-lg font-bold text-gray-800">News Bits</h1>
                  <p className="text-xs text-red-600">Latest Vehicle News & Updates</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => refreshNewsMutation.mutate()}
                disabled={refreshNewsMutation.isPending}
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-red-50"
              >
                {refreshNewsMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-red-50"
                >
                  <Settings className="w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Today: {new Date().toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })} • Latest Updates
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Category Filter Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const itemCount = newsItems.filter(item => item.category === category.id).length;
            return (
              <Card
                key={category.id}
                className={`cursor-pointer rounded-lg shadow-orange-200 shadow-md ${getCategoryButtonStyle(category.id, category.color)}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-xs font-bold">{category.label}</span>
                <span className="text-lg font-bold">{itemCount}</span>
              </Card>
            );
          })}
        </div>

        {/* News Items */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-4 shadow-orange-200 shadow-md animate-pulse">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <div className="w-16 h-5 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                </div>
                <div className="w-full h-4 bg-gray-300 rounded mb-2"></div>
                <div className="w-full h-3 bg-gray-300 rounded mb-1"></div>
                <div className="w-3/4 h-3 bg-gray-300 rounded mb-3"></div>
                <div className="flex items-center justify-between">
                  <div className="w-20 h-3 bg-gray-300 rounded"></div>
                  <div className="w-16 h-3 bg-gray-300 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-6 text-center shadow-orange-200 shadow-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Failed to Load News</h3>
            <p className="text-xs text-gray-600 mb-4">
              Unable to fetch latest news. Please check your connection and try again.
            </p>
            <Button
              onClick={() => refreshNewsMutation.mutate()}
              disabled={refreshNewsMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {refreshNewsMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Try Again
            </Button>
          </Card>
        ) : filteredNewsItems.length === 0 ? (
          <Card className="p-6 text-center shadow-orange-200 shadow-md">
            <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">
              No {categories.find(cat => cat.id === selectedCategory)?.label} Available
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              No {selectedCategory} news found at the moment. Try selecting a different category or refreshing for updates.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setSelectedCategory("offers")}
                variant="outline"
                size="sm"
              >
                View Offers
              </Button>
              <Button
                onClick={() => refreshNewsMutation.mutate()}
                disabled={refreshNewsMutation.isPending}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNewsItems.map((item) => (
              <Card key={item.id} className={`p-4 shadow-orange-200 shadow-md ${getPriorityBorder(item.priority)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(item.category)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {item.category.toUpperCase()}
                    </span>
                    {item.priority === "high" && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
                        BREAKING
                      </span>
                    )}
                  </div>
                  <a 
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                <h3 className="font-semibold text-gray-800 text-sm mb-2">
                  {item.title}
                </h3>
                
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {item.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{item.source}</span>
                  <span>{item.date}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Dynamic Update Notice */}
        <Card className="p-3 text-center bg-blue-50 shadow-orange-200 shadow-md">
          <p className="text-xs text-blue-700">
            🔄 News updates hourly with intelligent caching • Tap refresh for latest updates
          </p>
        </Card>
      </div>
    </div>
  );
}