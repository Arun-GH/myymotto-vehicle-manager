import { useState } from "react";
import { Share2, MessageCircle, X, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ColorfulLogo from "@/components/colorful-logo";

interface ReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReferralDialog({ open, onOpenChange }: ReferralDialogProps) {
  const [showLaterReminder, setShowLaterReminder] = useState(false);

  const shareMessage = `🚗 Hey! I've been using MyyMotto to manage my vehicles and it's amazing! 

✅ Track insurance & emission renewals
✅ Store all vehicle documents safely
✅ Get timely notifications for renewals
✅ Emergency contacts management
✅ Find nearby service centers

*Timely Care for your carrier* 

Try it out: ${window.location.origin}`;

  const handleShareNow = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
  };

  const handleShareLater = () => {
    setShowLaterReminder(true);
    // Store reminder in localStorage to show later
    localStorage.setItem('myymottoReferralReminder', 'true');
    setTimeout(() => {
      setShowLaterReminder(false);
      onOpenChange(false);
    }, 2000);
  };

  if (showLaterReminder) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">We'll remind you later!</h3>
            <p className="text-gray-600">You can share MyyMotto with friends anytime from the profile page.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-orange-500" />
              <DialogTitle className="text-lg font-semibold">Spread the word!</DialogTitle>
            </div>
          </div>
          <DialogDescription>
            Great job adding your vehicle! Help a friend get organized with their vehicles too.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <ColorfulLogo className="text-sm font-bold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Share MyyMotto</p>
                  <p className="text-xs text-red-600">Timely Care for your carrier</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                Help your friends stay on top of their vehicle maintenance, renewals, and documents!
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={handleShareNow}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Share on WhatsApp
            </Button>

            <Button 
              onClick={handleShareLater}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Sharing is caring! Help your friends stay organized.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}