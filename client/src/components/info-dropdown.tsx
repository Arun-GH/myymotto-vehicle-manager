import { useState } from "react";
import { Info, Phone, MessageCircle, Star, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InfoDropdown() {
  const handleAbout = () => {
    window.open("https://about.myymotto.app", "_blank");
  };

  const handleContact = () => {
    window.open("mailto:support@myymotto.app?subject=Myymotto Support Request", "_blank");
  };

  const handleFeedback = () => {
    window.open("https://forms.google.com/feedback-myymotto", "_blank");
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:bg-red-50 flex items-center space-x-1"
        >
          <Info className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Info</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleAbout} className="cursor-pointer">
          <Info className="w-4 h-4 mr-2" />
          About Myymotto
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleContact} className="cursor-pointer">
          <Phone className="w-4 h-4 mr-2" />
          Contact Support
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFeedback} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 mr-2" />
          Send Feedback
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReview} className="cursor-pointer">
          <Star className="w-4 h-4 mr-2" />
          Rate & Review
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}