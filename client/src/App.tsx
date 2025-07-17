import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import { type UserProfile } from "@shared/schema";
import Dashboard from "@/pages/dashboard";
import AddVehicle from "@/pages/add-vehicle";
import EditVehicle from "@/pages/edit-vehicle";
import UploadDocuments from "@/pages/upload-documents";
import ViewDocuments from "@/pages/view-documents";

import ServiceCenters from "@/pages/service-centers";
import Documents from "@/pages/documents";
import Profile from "@/pages/profile";
import EmergencyContacts from "@/pages/emergency-contacts";
import Subscribe from "@/pages/subscribe";
import SignIn from "@/pages/sign-in";
import TrafficViolations from "@/pages/traffic-violations";
import InsuranceRenewals from "@/pages/insurance-renewals";
import NotFound from "@/pages/not-found";

function Router() {
  const [location, setLocation] = useLocation();
  
  // Check if user is authenticated (in a real app, this would come from session/token)
  const currentUserId = localStorage.getItem("currentUserId");
  const isAuthenticated = !!currentUserId;
  
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
    }
  }, [isAuthenticated, isLoading, profile, location, setLocation]);

  return (
    <Switch>
      <Route path="/sign-in" component={SignIn} />
      <Route path="/" component={Dashboard} />
      <Route path="/add-vehicle" component={AddVehicle} />
      <Route path="/vehicle/:id/edit" component={EditVehicle} />
      <Route path="/vehicle/:id/upload" component={UploadDocuments} />
      <Route path="/vehicle/:id/documents" component={ViewDocuments} />

      <Route path="/service-centers" component={ServiceCenters} />
      <Route path="/documents" component={Documents} />
      <Route path="/emergency-contacts" component={EmergencyContacts} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/profile" component={Profile} />
      <Route path="/traffic-violations" component={TrafficViolations} />
      <Route path="/insurance-renewals" component={InsuranceRenewals} />
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
