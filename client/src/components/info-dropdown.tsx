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

export default function InfoDropdown() {
  const [showAbout, setShowAbout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

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
    // Open app store or play store review page
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("android")) {
      window.open("https://play.google.com/store/apps/details?id=com.myymotto.app", "_blank");
    } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
      window.open("https://apps.apple.com/app/myymotto/id123456789", "_blank");
    } else {
      // For web users, open general review link
      window.open("https://reviews.myymotto.app", "_blank");
    }
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
            <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
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
    </>
  );
}