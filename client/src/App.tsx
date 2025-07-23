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

  // Authentication and routing logic
  useEffect(() => {
    if (!isAuthenticated && location !== "/sign-in") {
      setLocation("/sign-in");
    } else if (isAuthenticated && !isLoading && !profile && location !== "/profile") {
      setLocation("/profile");
    } else if (isAuthenticated && !isLoading && profile) {
      // Check if this is a new user who needs permissions setup
      const permissionsCompleted = localStorage.getItem(`permissionsCompleted_${currentUserId}`);
      if (!permissionsCompleted && !showPermissions && !showSplash) {
        setShowPermissions(true);
      }
    }
  }, [isAuthenticated, isLoading, profile, location, setLocation, currentUserId, showPermissions, showSplash]);

  // Show splash screen for 2 seconds on app start
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show permissions screen
  if (showPermissions) {
    return <PermissionsScreen onComplete={handlePermissionsComplete} />;
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
