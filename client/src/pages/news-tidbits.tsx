import { ArrowLeft, ExternalLink, Newspaper, Zap, Car, Truck, Bike, AlertTriangle, RefreshCw, Settings } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ColorfulLogo from "@/components/colorful-logo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: "policy" | "launch" | "news";
  date: string;
  source: string;
  link: string;
  priority: "high" | "medium" | "low";
}

export default function NewsTidbits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch news data from API
  const { data: newsItems = [], isLoading, error } = useQuery<NewsItem[]>({
    queryKey: ["/api/news", "government-2025"], // Updated key to force refresh
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 1000 * 60 * 5, // Cache for 5 minutes only
  });

  // Fetch cache info
  const { data: cacheInfo } = useQuery({
    queryKey: ["/api/news/cache-info", "government-2025"], // Updated key to force refresh
    refetchInterval: 1000 * 60, // Refresh every minute
  });

  // Refresh news mutation
  const refreshNewsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/news/refresh"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news/cache-info"] });
      toast({
        title: "News Refreshed",
        description: "Latest government policy updates loaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Refresh Failed",
        description: "Could not fetch latest news. Showing cached data.",
        variant: "destructive",
      });
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
                  <h1 className="text-lg font-bold text-gray-800">News Tidbits</h1>
                  <p className="text-xs text-red-600">Latest Vehicle News & Updates</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
              })} • Auto-updated daily
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card className="p-3 text-center bg-red-100 shadow-orange-200 shadow-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-red-800">Policies</span>
            </div>
            <p className="text-lg font-bold text-red-600">3</p>
          </Card>
          <Card className="p-3 text-center bg-green-100 shadow-orange-200 shadow-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-800">Launches</span>
            </div>
            <p className="text-lg font-bold text-green-600">3</p>
          </Card>
          <Card className="p-3 text-center bg-orange-100 shadow-orange-200 shadow-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Newspaper className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-orange-800">Total</span>
            </div>
            <p className="text-lg font-bold text-orange-600">6</p>
          </Card>
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
        ) : newsItems.length === 0 ? (
          <Card className="p-6 text-center shadow-orange-200 shadow-md">
            <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">No News Available</h3>
            <p className="text-xs text-gray-600 mb-4">
              No vehicle news found at the moment. Try refreshing to check for updates.
            </p>
            <Button
              onClick={() => refreshNewsMutation.mutate()}
              disabled={refreshNewsMutation.isPending}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh News
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {newsItems.map((item) => (
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