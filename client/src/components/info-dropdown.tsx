import { useState } from "react";
import { Info, Phone, MessageCircle, Star, ChevronDown, ExternalLink, MoreVertical, X } from "lucide-react";
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

export default function InfoDropdown() {
  const [showAbout, setShowAbout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertRating>({
    resolver: zodResolver(insertRatingSchema),
    defaultValues: {
      rating: 5,
      userName: "",
      phoneNumber: "",
      emailId: "",
      feedback: "",
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (data: InsertRating) => {
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
    window.open("mailto:info@arudhihsolutions.com?subject=Myymotto Support Request&body=Hi there,%0D%0A%0D%0APlease get in touch with us at info@arudhihsolutions.com for any support queries.%0D%0A%0D%0AThanks!", "_blank");
  };

  const handleFeedback = () => {
    setShowFeedback(true);
  };

  const handleReview = () => {
    setShowRating(true);
  };

  const handleStarClick = (starValue: number) => {
    form.setValue("rating", starValue);
  };

  const onSubmit = (data: InsertRating) => {
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
            About Myymotto
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
        </DropdownMenuContent>
      </DropdownMenu>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="max-w-sm mx-4 sm:mx-auto p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center text-base font-semibold text-orange-600 flex items-center justify-center gap-2">
              <Info className="w-4 h-4" />
              About Myymotto
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-2 py-2">
            <p className="text-sm text-gray-700 leading-snug">
              <strong>Myymotto</strong> is your complete mobile vehicle management companion with "Timely Care for your carrier".
            </p>
            <p className="text-sm text-gray-700 leading-snug">
              Store documents securely, track service schedules, and get renewal reminders for insurance and emissions.
            </p>
            <p className="text-sm text-gray-700 leading-snug">
              Check authentic traffic violations through government APIs and find nearby service centers effortlessly.
            </p>
            <p className="text-sm text-gray-700 leading-snug">
              Features include subscription plans, puzzle games, automotive news, and comprehensive maintenance tracking.
            </p>
          </div>
          <div className="flex justify-center pt-3">
            <Button 
              onClick={() => setShowAbout(false)}
              size="sm"
              className="px-4"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-sm mx-4 sm:mx-auto p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center text-base font-semibold text-orange-600 flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Send Feedback
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-3 py-2">
            <p className="text-sm text-gray-700 leading-snug">
              We'd love to hear your feedback and suggestions!
            </p>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-800">
                Share your thoughts with us at:
              </p>
              <p className="text-sm font-semibold text-orange-600 mt-1">
                info@arudhihsolutions.com
              </p>
            </div>
            <p className="text-xs text-gray-600">
              Your feedback helps us improve Myymotto for everyone!
            </p>
          </div>
          <div className="flex justify-center pt-3">
            <Button 
              onClick={() => setShowFeedback(false)}
              size="sm"
              className="px-4"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent className="max-w-sm mx-4 sm:mx-auto p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center text-base font-semibold text-orange-600 flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              Rate & Review Myymotto
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Star Rating */}
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-2">How would you rate your experience?</p>
              <div className="flex justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      star <= form.watch("rating")
                        ? "text-orange-500 fill-orange-500"
                        : "text-gray-300 hover:text-orange-400"
                    }`}
                    onClick={() => handleStarClick(star)}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {form.watch("rating")} out of 5 stars
              </p>
            </div>

            {/* User Details */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Your Name
                </label>
                <Input
                  {...form.register("userName")}
                  placeholder="Enter your full name"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Phone Number
                </label>
                <Input
                  {...form.register("phoneNumber")}
                  placeholder="Enter your phone number"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email ID
                </label>
                <Input
                  {...form.register("emailId")}
                  type="email"
                  placeholder="Enter your email address"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Feedback (Optional)
                </label>
                <Textarea
                  {...form.register("feedback")}
                  placeholder="Tell us what you love about Myymotto or how we can improve..."
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowRating(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1"
                disabled={ratingMutation.isPending}
              >
                {ratingMutation.isPending ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}