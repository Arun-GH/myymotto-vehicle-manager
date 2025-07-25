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
  ShieldOff,
  TrendingUp,
  AlertTriangle,
  Database,
  MessageCircle,
  Send,
  Trash2
} from "lucide-react";
import type { UserProfile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  maleUsers: number;
  femaleUsers: number;
  usersByState: { [state: string]: number };
  totalVehicles: number;
  twoWheelers: number;
  threeWheelers: number;
  fourWheelers: number;
  subscriptionRevenue: number;
  newUsersThisMonth: number;
  newVehiclesThisMonth: number;
  totalBroadcasts: number;
  totalRatings: number;
}

function AdminMessages() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [todaysMessage, setTodaysMessage] = useState<any>(null);

  useEffect(() => {
    loadTodaysMessage();
  }, []);

  const loadTodaysMessage = async () => {
    try {
      const response = await apiRequest("GET", "/api/admin/messages/today");
      const data = await response.json();
      setTodaysMessage(data);
    } catch (error) {
      console.error("Error loading today's message:", error);
    }
  };

  const handleCreateMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiRequest("POST", "/api/admin/messages", {
        message: message.trim(),
        messageDate: today
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Daily message created successfully",
        });
        setMessage("");
        loadTodaysMessage();
      } else {
        throw new Error("Failed to create message");
      }
    } catch (error) {
      console.error("Error creating message:", error);
      toast({
        title: "Error",
        description: "Failed to create daily message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await apiRequest("DELETE", `/api/admin/messages/${id}`);
      if (response.ok) {
        toast({
          title: "Success",
          description: "Message deleted successfully",
        });
        loadTodaysMessage();
      } else {
        throw new Error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-orange">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Daily User Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Today's Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a greeting message for all users today..."
                className="h-20"
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1">
                {message.length}/200 characters
              </div>
            </div>
            
            <Button
              onClick={handleCreateMessage}
              disabled={loading || !message.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Sending..." : "Send Message to All Users"}
            </Button>
          </div>

          {todaysMessage && (
            <div className="border rounded-lg p-4 bg-orange-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-orange-800">Active Message</p>
                  <p className="text-sm text-gray-700 mt-1">{todaysMessage.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Date: {new Date(todaysMessage.messageDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleDeleteMessage(todaysMessage.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p>• Messages are shown to all users on their dashboard</p>
            <p>• Only one message per day is allowed</p>
            <p>• Messages are automatically displayed when users open the app</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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

  // Fetch all invoices
  const { data: allInvoices = [], isLoading: invoicesLoading, refetch: refetchInvoices } = useQuery<any[]>({
    queryKey: ["/api/admin/invoices"],
    enabled: !!isAdminUser,
  });

  // Fetch all account information
  const { data: allAccounts = [], isLoading: accountsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/accounts"],
    enabled: !!isAdminUser,
  });

  const handleDownload = async (dataType: string) => {
    setDownloadLoading(dataType);
    try {
      const response = await apiRequest("GET", `/api/admin/export/${dataType}?userId=1`);
      
      // Log the response to debug
      console.log(`${dataType} export data:`, response);
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(response, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `myymotto-${dataType}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert(`Failed to download ${dataType} data. Please try again.`);
    } finally {
      setDownloadLoading(null);
    }
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      const response = await apiRequest("GET", `/api/admin/invoices/download/${invoiceId}?userId=1`);
      const data = await response.json();
      
      // Create and download invoice file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${data.invoiceNumber || invoiceId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  // User management handlers
  const handleBlockUser = async (targetUserId: number) => {
    try {
      const response = await apiRequest("POST", `/api/admin/users/${targetUserId}/block`, {
        reason: "Admin action"
      });
      
      if (response.ok) {
        // Refresh the users data
        window.location.reload();
      }
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const handleUnblockUser = async (targetUserId: number) => {
    try {
      const response = await apiRequest("POST", `/api/admin/users/${targetUserId}/unblock`, {});
      
      if (response.ok) {
        // Refresh the users data
        window.location.reload();
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  // Post management handler
  const handleDeletePost = async (broadcastId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await apiRequest("DELETE", `/api/admin/broadcasts/${broadcastId}`, {});
        
        if (response.ok) {
          // Refresh the broadcasts data
          window.location.reload();
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
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

        {/* Enhanced User Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-orange">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                User Activity Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="font-semibold">{adminStats?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Active Users</span>
                  <span className="font-semibold">{adminStats?.dailyActiveUsers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Active Users</span>
                  <span className="font-semibold">{adminStats?.monthlyActiveUsers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Users This Month</span>
                  <span className="font-semibold">{adminStats?.newUsersThisMonth || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-orange">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-pink-600" />
                Gender Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Male Users</span>
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">{adminStats?.maleUsers || 0}</span>
                    <div className="w-16 h-2 bg-gray-200 rounded">
                      <div 
                        className="h-2 bg-blue-500 rounded" 
                        style={{ 
                          width: `${((adminStats?.maleUsers || 0) / (adminStats?.totalUsers || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Female Users</span>
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">{adminStats?.femaleUsers || 0}</span>
                    <div className="w-16 h-2 bg-gray-200 rounded">
                      <div 
                        className="h-2 bg-pink-500 rounded" 
                        style={{ 
                          width: `${((adminStats?.femaleUsers || 0) / (adminStats?.totalUsers || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="pt-2 text-xs text-gray-500">
                  Total: {(adminStats?.maleUsers || 0) + (adminStats?.femaleUsers || 0)} users with gender data
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Type Breakdown */}
        <Card className="shadow-orange mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Car className="w-5 h-5 mr-2 text-green-600" />
              Vehicle Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{adminStats?.twoWheelers || 0}</div>
                <div className="text-sm text-gray-600">2-Wheelers</div>
                <div className="text-xs text-gray-500">
                  {((adminStats?.twoWheelers || 0) / (adminStats?.totalVehicles || 1) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{adminStats?.threeWheelers || 0}</div>
                <div className="text-sm text-gray-600">3-Wheelers</div>
                <div className="text-xs text-gray-500">
                  {((adminStats?.threeWheelers || 0) / (adminStats?.totalVehicles || 1) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{adminStats?.fourWheelers || 0}</div>
                <div className="text-sm text-gray-600">4-Wheelers</div>
                <div className="text-xs text-gray-500">
                  {((adminStats?.fourWheelers || 0) / (adminStats?.totalVehicles || 1) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* State Distribution */}
        <Card className="shadow-orange mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Database className="w-5 h-5 mr-2 text-purple-600" />
              Users by State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {adminStats?.usersByState && Object.entries(adminStats.usersByState)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .map(([state, count]) => (
                  <div key={state} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">{state}</span>
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">{count as number}</span>
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div 
                          className="h-2 bg-purple-500 rounded" 
                          style={{ 
                            width: `${((count as number) / (adminStats?.totalUsers || 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              {(!adminStats?.usersByState || Object.keys(adminStats.usersByState).length === 0) && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No state data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Data Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="broadcasts">Posts</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <Card className="shadow-orange">
              <CardHeader>
                <CardTitle className="text-lg">Users</CardTitle>
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
                          {user.isBlocked && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              <Shield className="w-3 h-3 mr-1" />
                              Blocked
                            </Badge>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <Badge variant={user.subscriptionStatus === "paid" ? "default" : "secondary"}>
                            {user.subscriptionStatus}
                          </Badge>
                          <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                          <div className="flex gap-1">
                            {user.isBlocked ? (
                              <Button
                                onClick={() => handleUnblockUser(user.id)}
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs px-2 text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <ShieldOff className="w-3 h-3 mr-1" />
                                Unblock
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleBlockUser(user.id)}
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs px-2 text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                Block
                              </Button>
                            )}
                          </div>
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
                <CardTitle className="text-lg">Vehicles</CardTitle>
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
                <CardTitle className="text-lg">Broadcast Posts</CardTitle>
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
                        <div className="text-right flex flex-col items-end gap-1">
                          <Badge variant="outline">{broadcast.type}</Badge>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {broadcast.viewCount || 0}
                          </p>
                          <Button
                            onClick={() => handleDeletePost(broadcast.id)}
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs px-2 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
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
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Ratings</span>
                  <div className="text-sm font-normal text-gray-600">
                    Average: {recentRatings.length > 0 ? (
                      <span className="font-semibold text-orange-600">
                        {(recentRatings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / recentRatings.length).toFixed(1)}/5
                      </span>
                    ) : (
                      <span className="text-gray-400">No ratings</span>
                    )}
                  </div>
                </CardTitle>
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

          <TabsContent value="invoices" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-orange">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Invoice Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {invoicesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allInvoices.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No invoices found</p>
                      ) : (
                        allInvoices.slice(0, 5).map((invoice: any) => (
                          <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">#{invoice.invoiceNumber}</p>
                              <p className="text-sm text-gray-600">{invoice.customerName}</p>
                              <p className="text-xs text-gray-500">₹{(invoice.totalAmount || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <Badge variant={invoice.invoiceStatus === 'paid' ? 'default' : 'outline'}>
                                {invoice.invoiceStatus}
                              </Badge>
                              <p className="text-xs text-gray-500">
                                {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'No date'}
                              </p>
                              <Button
                                onClick={() => handleDownloadInvoice(invoice.id)}
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs px-2"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                      {allInvoices.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          Showing 5 of {allInvoices.length} invoices
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-orange">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-600" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {accountsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allAccounts.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No account information found</p>
                      ) : (
                        allAccounts.slice(0, 5).map((account: any) => (
                          <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{account.customerName}</p>
                              <p className="text-sm text-gray-600">{account.customerPhone}</p>
                              <p className="text-xs text-gray-500">{account.customerEmail}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={account.subscriptionStatus === 'active' ? 'default' : 'outline'}>
                                {account.subscriptionStatus || 'inactive'}
                              </Badge>
                              <p className="text-xs text-gray-500">
                                {account.accountCreatedDate ? new Date(account.accountCreatedDate).toLocaleDateString() : 'No date'}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      {allAccounts.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          Showing 5 of {allAccounts.length} accounts
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Invoice Statistics */}
            <Card className="shadow-orange">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Subscription Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{allInvoices.length}</p>
                    <p className="text-xs text-gray-600">Total Invoices</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {allInvoices.filter((inv: any) => inv.invoiceStatus === 'paid').length}
                    </p>
                    <p className="text-xs text-gray-600">Paid Invoices</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {allInvoices.filter((inv: any) => inv.invoiceStatus === 'pending').length}
                    </p>
                    <p className="text-xs text-gray-600">Pending Payments</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{allInvoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-600">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <AdminMessages />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}