import { useState } from "react";
import { Info, Phone, MessageCircle, Star, ChevronDown, ExternalLink, MoreVertical, X, LogOut, Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRatingSchema, type InsertRating } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  DialogDescription,
} from "@/components/ui/dialog";

export default function InfoDropdown() {
  const [showAbout, setShowAbout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Check if current user is admin (user ID 1 for demo)
  const currentUserId = localStorage.getItem("currentUserId") || "1";
  const isAdmin = currentUserId === "1";

  const form = useForm<Pick<InsertRating, 'rating' | 'feedback'>>({
    resolver: zodResolver(insertRatingSchema.pick({ rating: true, feedback: true })),
    defaultValues: {
      rating: 5,
      feedback: "",
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (data: Pick<InsertRating, 'rating' | 'feedback'>) => {
      // The API will auto-populate user details from profile
      return apiRequest("POST", "/api/ratings", data);
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your rating has been submitted successfully.",
      });
      setShowRating(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
      console.error("Rating submission error:", error);
    },
  });

  const handleAbout = () => {
    setShowAbout(true);
  };

  const handleContact = () => {
    window.open("mailto:info@arudhihsolutions.com?subject=MyyMotto Support Request&body=Dear Arudhih Team,%0D%0AI am reaching out to request information and assistance regarding few features on the app.I would appreciate it if someone from your team could get in touch with me at your earliest convenience.%0D%0A%0D%0ARegards,", "_blank");
  };

  const handleFeedback = () => {
    setShowFeedback(true);
  };

  const handleReview = () => {
    setShowRating(true);
  };

  const handleAdminDashboard = () => {
    setLocation("/admin-dashboard");
  };

  const handleLogout = () => {
    // Clear all localStorage data for logout
    localStorage.clear();
    // Redirect to sign-in page
    window.location.href = "/sign-in";
  };

  const handleStarClick = (starValue: number) => {
    form.setValue("rating", starValue);
  };

  const onSubmit = (data: Pick<InsertRating, 'rating' | 'feedback'>) => {
    ratingMutation.mutate(data);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:bg-red-50"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleAbout} className="cursor-pointer">
            <Info className="w-4 h-4 mr-2" />
            About MyyMotto
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/account-management")} className="cursor-pointer text-orange-600 hover:text-orange-700 hover:bg-orange-50">
            <Shield className="w-4 h-4 mr-2" />
            Account Management
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/calendar-reminder")} className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Bell className="w-4 h-4 mr-2" />
            Alert & Reminders
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleContact} className="cursor-pointer">
            <Phone className="w-4 h-4 mr-2" />
            Contact Support
            <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFeedback} className="cursor-pointer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Feedback
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleReview} className="cursor-pointer">
            <Star className="w-4 h-4 mr-2" />
            Rate & Review
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={handleAdminDashboard} className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Shield className="w-4 h-4 mr-2" />
              Admin Dashboard
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="w-[90%] max-w-md mx-auto p-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl shadow-orange-500/20 border-0">
          <DialogHeader className="pb-4 text-center">
            <DialogTitle className="text-lg font-bold text-orange-600 flex items-center justify-center gap-2 mb-2">
              <Info className="w-5 h-5" />
              About MyyMotto
            </DialogTitle>
            <div className="w-12 h-0.5 bg-orange-500 mx-auto rounded-full"></div>
          </DialogHeader>
          <div className="text-center space-y-3 py-2">
            <p className="text-base text-gray-800 leading-relaxed font-medium">
              <span className="font-bold">
                <span className="text-blue-900">M</span>
                <span className="text-yellow-500">y</span>
                <span className="text-yellow-500">y</span>
                <span className="text-blue-900">M</span>
                <span className="text-green-500">o</span>
                <span className="text-red-600">t</span>
                <span className="text-red-600">t</span>
                <span className="text-green-500">o</span>
              </span> - your complete mobile vehicle management companion by Arudhih Solutions LLP
            </p>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                <strong>✓ Secure Document Storage</strong> - Store certificates safely on your device
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                <strong>✓ Smart Reminders</strong> - Get timely alerts for renewals and services
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                <strong>✓ Government APIs</strong> - Check authentic traffic violations
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>✓ Complete Tracking</strong> - Maintenance schedules and service history
              </p>
            </div>
            <p className="text-xs text-orange-600 font-medium italic">
              "Timely Care for your carrier"
            </p>
          </div>
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setShowAbout(false)}
              className="px-8 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="w-[90%] max-w-md mx-auto p-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl shadow-orange-500/20 border-0">
          <DialogHeader className="pb-4 text-center">
            <DialogTitle className="text-lg font-bold text-orange-600 flex items-center justify-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5" />
              Send Feedback
            </DialogTitle>
            <div className="w-12 h-0.5 bg-orange-500 mx-auto rounded-full"></div>
          </DialogHeader>
          <div className="text-center space-y-4 py-2">
            <p className="text-base text-gray-800 leading-relaxed font-medium">
              We'd love to hear your feedback and suggestions!
            </p>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 shadow-sm">
              <p className="text-sm font-medium text-gray-800 mb-2">
                📧 Share your thoughts with us:
              </p>
              <div className="bg-white p-3 rounded-lg border border-orange-300">
                <p className="text-base font-bold text-orange-600 select-all">
                  info@arudhihsolutions.com
                </p>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-medium">
                💡 Your feedback helps us improve MyyMotto for everyone!
              </p>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setShowFeedback(false)}
              className="px-8 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent className="w-[90%] max-w-md mx-auto p-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl shadow-orange-500/20 border-0">
          <DialogHeader className="pb-4 text-center">
            <DialogTitle className="text-lg font-bold text-orange-600 flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5" />
              Rate MyyMotto
            </DialogTitle>
            <div className="w-12 h-0.5 bg-orange-500 mx-auto rounded-full"></div>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Star Rating */}
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-4 leading-relaxed font-medium">
                Rate your overall experience and usefulness of MyyMotto
              </p>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <div className="flex justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-10 h-10 cursor-pointer transition-all duration-200 hover:scale-110 ${
                        star <= form.watch("rating")
                          ? "text-orange-500 fill-orange-500 drop-shadow-sm"
                          : "text-gray-300 hover:text-orange-400"
                      }`}
                      onClick={() => handleStarClick(star)}
                    />
                  ))}
                </div>
                <p className="text-sm text-orange-600 font-semibold">
                  {form.watch("rating")} of 5 stars selected
                </p>
              </div>
            </div>

            {/* Feedback Section */}
            <div>
              <label className="text-sm font-medium text-gray-800 mb-2 block">
                Share your thoughts <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <Textarea
                {...form.register("feedback")}
                placeholder="What do you love about MyyMotto? How can we make it even better?"
                rows={4}
                className="text-sm resize-none border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 text-sm border-gray-300 hover:bg-gray-50"
                onClick={() => setShowRating(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 text-sm bg-orange-600 hover:bg-orange-700 shadow-lg transition-all duration-200"
                disabled={ratingMutation.isPending}
              >
                {ratingMutation.isPending ? "Sending..." : "Submit Rating"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}