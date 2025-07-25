import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Users, 
  Car, 
  FileText, 
  DollarSign, 
  Download, 
  Eye, 
  Calendar,
  Shield,
  TrendingUp,
  AlertTriangle,
  Database
} from "lucide-react";
import type { UserProfile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalVehicles: number;
  subscriptionRevenue: number;
  newUsersThisMonth: number;
  newVehiclesThisMonth: number;
  totalBroadcasts: number;
  totalRatings: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);

  // Check admin access
  const { data: currentUser } = useQuery<UserProfile>({
    queryKey: ["/api/profile/1"], // Current logged in user
  });

  // Redirect non-admin users - check for admin phone numbers
  const isAdminUser = currentUser && (
    currentUser.isAdmin || 
    currentUser.alternatePhone === '+919880105082' || 
    currentUser.alternatePhone === '9880105082'
  );

  // Fetch admin statistics
  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!isAdminUser,
  });

  // Fetch recent users
  const { data: recentUsers = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users/recent"],
    enabled: !!isAdminUser,
  });

  // Fetch recent vehicles
  const { data: recentVehicles = [], isLoading: vehiclesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/vehicles/recent"],
    enabled: !!isAdminUser,
  });

  // Fetch recent broadcasts
  const { data: recentBroadcasts = [], isLoading: broadcastsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/broadcasts/recent"],
    enabled: !!isAdminUser,
  });

  // Fetch recent ratings
  const { data: recentRatings = [], isLoading: ratingsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/ratings/recent"],
    enabled: !!isAdminUser,
  });

  const handleDownload = async (dataType: string) => {
    setDownloadLoading(dataType);
    try {
      const response = await apiRequest("GET", `/api/admin/export/${dataType}`);
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(response, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${dataType}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloadLoading(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (currentUser && !isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <Card className="w-96 p-6 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have admin privileges to access this page.</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLocation("/")}
                className="text-gray-600 hover:text-gray-800 hover:bg-red-50 p-1 rounded-full mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-sm text-red-600">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-orange">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Users</p>
                  <p className="text-lg font-bold text-blue-600">{adminStats?.totalUsers || 0}</p>
                </div>
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-orange">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Vehicles</p>
                  <p className="text-lg font-bold text-green-600">{adminStats?.totalVehicles || 0}</p>
                </div>
                <Car className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-orange">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Revenue</p>
                  <p className="text-lg font-bold text-yellow-600">₹{adminStats?.subscriptionRevenue || 0}</p>
                </div>
                <DollarSign className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-orange">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Broadcasts</p>
                  <p className="text-lg font-bold text-purple-600">{adminStats?.totalBroadcasts || 0}</p>
                </div>
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Export Section */}
        <Card className="shadow-orange mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => handleDownload("users")}
                disabled={downloadLoading === "users"}
                variant="outline"
                className="h-12"
              >
                <Users className="w-4 h-4 mr-2" />
                {downloadLoading === "users" ? "..." : "Users"}
              </Button>
              <Button
                onClick={() => handleDownload("vehicles")}
                disabled={downloadLoading === "vehicles"}
                variant="outline"
                className="h-12"
              >
                <Car className="w-4 h-4 mr-2" />
                {downloadLoading === "vehicles" ? "..." : "Vehicles"}
              </Button>
              <Button
                onClick={() => handleDownload("broadcasts")}
                disabled={downloadLoading === "broadcasts"}
                variant="outline"
                className="h-12"
              >
                <FileText className="w-4 h-4 mr-2" />
                {downloadLoading === "broadcasts" ? "..." : "Broadcasts"}
              </Button>
              <Button
                onClick={() => handleDownload("ratings")}
                disabled={downloadLoading === "ratings"}
                variant="outline"
                className="h-12"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {downloadLoading === "ratings" ? "..." : "Ratings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Data Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Recent Users</TabsTrigger>
            <TabsTrigger value="vehicles">Recent Vehicles</TabsTrigger>
            <TabsTrigger value="broadcasts">Recent Posts</TabsTrigger>
            <TabsTrigger value="ratings">Recent Ratings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <Card className="shadow-orange">
              <CardHeader>
                <CardTitle className="text-lg">Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-600">{user.mobile || "No mobile"}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.subscriptionStatus === "paid" ? "default" : "secondary"}>
                            {user.subscriptionStatus}
                          </Badge>
                          <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <Card className="shadow-orange">
              <CardHeader>
                <CardTitle className="text-lg">Recent Vehicles</CardTitle>
              </CardHeader>
              <CardContent>
                {vehiclesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentVehicles.map((vehicle: any) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{vehicle.vehicleType || "Unknown"}</Badge>
                          <p className="text-xs text-gray-500">{formatDate(vehicle.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="broadcasts" className="space-y-4">
            <Card className="shadow-orange">
              <CardHeader>
                <CardTitle className="text-lg">Recent Broadcast Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {broadcastsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentBroadcasts.map((broadcast: any) => (
                      <div key={broadcast.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{broadcast.title}</p>
                          <p className="text-sm text-gray-600 truncate">{broadcast.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{broadcast.type}</Badge>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {broadcast.viewCount || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-4">
            <Card className="shadow-orange">
              <CardHeader>
                <CardTitle className="text-lg">Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                {ratingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRatings.map((rating: any) => (
                      <div key={rating.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{rating.userName}</p>
                          <p className="text-sm text-gray-600">{rating.feedback || "No feedback"}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex text-yellow-500">
                            {"★".repeat(rating.rating)}{"☆".repeat(5 - rating.rating)}
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(rating.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}