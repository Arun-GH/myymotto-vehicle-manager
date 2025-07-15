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
import VehicleDetails from "@/pages/vehicle-details";
import Documents from "@/pages/documents";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

// For demo purposes, we'll use a hardcoded userId. In a real app, this would come from authentication
const DEMO_USER_ID = 1;

function Router() {
  const [location, setLocation] = useLocation();
  
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile", DEMO_USER_ID],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/profile/${DEMO_USER_ID}`);
        return response.json();
      } catch (error: any) {
        if (error.message?.includes('404')) {
          return null; // Profile doesn't exist yet
        }
        throw error;
      }
    },
  });

  // Redirect to profile if no profile exists and not already on profile page
  useEffect(() => {
    if (!isLoading && !profile && location !== "/profile") {
      setLocation("/profile");
    }
  }, [isLoading, profile, location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/add-vehicle" component={AddVehicle} />
      <Route path="/vehicle/:id" component={VehicleDetails} />
      <Route path="/documents" component={Documents} />
      <Route path="/profile" component={Profile} />
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
