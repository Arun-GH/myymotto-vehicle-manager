import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import { type UserProfile } from "@shared/schema";
import SplashScreen from "@/components/splash-screen";
import PermissionsScreen from "@/components/permissions-screen";
import Dashboard from "@/pages/dashboard";
import AddVehicle from "@/pages/add-vehicle";
import EditVehicle from "@/pages/edit-vehicle";
import UploadDocuments from "@/pages/upload-documents";
import LocalDocuments from "@/pages/local-documents";

import ServiceCenters from "@/pages/service-centers";
import Profile from "@/pages/profile";
import EmergencyContacts from "@/pages/emergency-contacts";
import Subscribe from "@/pages/subscribe";
import SignIn from "@/pages/sign-in";
import TrafficViolations from "@/pages/traffic-violations";
import InsuranceRenewals from "@/pages/insurance-renewals";
import Insurance from "@/pages/insurance";
import Settings from "@/pages/settings";
import ClimbingGame from "@/pages/climbing-game";
import CombinedServicePage from "@/pages/combined-service";
import ServiceLogs from "@/pages/service-logs";
import AddServiceLog from "@/pages/add-service-log";
import VehicleAlerts from "@/pages/vehicle-alerts";
import NewsTidbits from "@/pages/news-tidbits";
import DashboardCustomize from "@/pages/dashboard-customize";
import BroadcastPage from "@/pages/broadcast";
import AdminDashboard from "@/pages/admin-dashboard";

import NotFound from "@/pages/not-found";

function Router() {
  const [location, setLocation] = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const [showPermissions, setShowPermissions] = useState(false);
  
  // Check if user is authenticated - need proper authentication flag, not just userId
  const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
    // After splash, check authentication and redirect accordingly
    if (!isAuthenticated) {
      setLocation("/sign-in");
    }
  };

  // Handle permissions completion
  const handlePermissionsComplete = () => {
    setShowPermissions(false);
  };
  
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null;
      try {
        const response = await apiRequest("GET", `/api/profile/${currentUserId}`);
        return response.json();
      } catch (error: any) {
        if (error.message?.includes('404')) {
          return null; // Profile doesn't exist yet
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // Check if user has vehicles
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["/api/vehicles", currentUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles?userId=${currentUserId}`);
      return response.json();
    },
    enabled: isAuthenticated && !!currentUserId,
  });

  // Authentication and routing logic
  useEffect(() => {
    if (!isAuthenticated && location !== "/sign-in") {
      setLocation("/sign-in");
    } else if (isAuthenticated && !isLoading && !vehiclesLoading) {
      if (!profile && location !== "/profile") {
        setLocation("/profile");
      } else if (profile) {
        // For existing users with vehicles, skip permissions and go directly to dashboard
        if (vehicles && vehicles.length > 0 && location === "/") {
          // User has vehicles, they are an existing user - no need for permissions
          return;
        }
        
        // Check if this is a new user who needs permissions setup
        const permissionsCompleted = localStorage.getItem(`permissionsCompleted_${currentUserId}`);
        if (!permissionsCompleted && !showPermissions && !showSplash && (!vehicles || vehicles.length === 0)) {
          setShowPermissions(true);
        }
      }
    }
  }, [isAuthenticated, isLoading, vehiclesLoading, profile, vehicles, location, setLocation, currentUserId, showPermissions, showSplash]);

  // Show splash screen for 2 seconds on app start
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show permissions screen
  if (showPermissions) {
    return <PermissionsScreen onComplete={handlePermissionsComplete} />;
  }

  // Show loading while checking authentication and profile for existing users
  if (isAuthenticated && (isLoading || vehiclesLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/sign-in" component={SignIn} />
      <Route path="/" component={Dashboard} />
      <Route path="/add-vehicle" component={AddVehicle} />
      <Route path="/vehicle/:id/edit" component={EditVehicle} />
      <Route path="/vehicle/:id/upload" component={UploadDocuments} />
      <Route path="/vehicle/:id/upload-documents" component={UploadDocuments} />
      <Route path="/vehicle/:id/local-documents" component={LocalDocuments} />
      <Route path="/vehicle/:id/service" component={CombinedServicePage} />
      <Route path="/vehicle/:id/service-logs" component={ServiceLogs} />
      <Route path="/vehicle/:id/add-service-log" component={AddServiceLog} />

      <Route path="/vehicle/:id/alerts" component={VehicleAlerts} />

      <Route path="/service-centers" component={ServiceCenters} />
      <Route path="/emergency-contacts" component={EmergencyContacts} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/climbing-game" component={ClimbingGame} />
      <Route path="/news-tidbits" component={NewsTidbits} />
      <Route path="/dashboard/customize" component={DashboardCustomize} />
      <Route path="/traffic-violations" component={TrafficViolations} />
      <Route path="/insurance-renewals" component={InsuranceRenewals} />
      <Route path="/insurance" component={Insurance} />
      <Route path="/broadcast" component={BroadcastPage} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen max-w-md mx-auto bg-background relative">
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
