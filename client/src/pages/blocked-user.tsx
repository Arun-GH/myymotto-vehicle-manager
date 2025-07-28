import { Mail, Shield, Phone, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function BlockedUser() {
  const handleEmailSupport = () => {
    window.open(
      "mailto:info@arudhih.com?subject=Account%20Access%20Request%20-%20Myymotto&body=Dear%20Arudhih%20Team%2C%0D%0A%0D%0AI%20am%20writing%20to%20request%20the%20restoration%20of%20my%20Myymotto%20account%20access.%20My%20account%20has%20been%20blocked%2C%20and%20I%20would%20like%20to%20understand%20the%20reason%20and%20request%20unblocking.%0D%0A%0D%0AUser%20Details%3A%0D%0A-%20Mobile%2FEmail%3A%20%5BYour%20registered%20mobile%2Femail%5D%0D%0A-%20Name%3A%20%5BYour%20name%5D%0D%0A-%20Reason%20for%20access%20request%3A%20%5BExplain%20briefly%5D%0D%0A%0D%0AI%20understand%20that%20accounts%20are%20blocked%20for%20policy%20violations%20and%20I%20assure%20you%20of%20my%20compliance%20with%20app%20guidelines%20going%20forward.%0D%0A%0D%0AThank%20you%20for%20your%20consideration.%0D%0A%0D%0ABest%20regards%2C%0D%0A%5BYour%20Name%5D",
      "_blank"
    );
  };

  const handleCallSupport = () => {
    window.open("tel:+918880105082", "_self");
  };

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Redirect to sign-in page
    window.location.href = "/sign-in";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-md mb-6">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <img 
            src={logoImage} 
            alt="Myymotto Logo" 
            className="w-12 h-12 rounded-lg"
          />
          <div className="text-center">
            <div className="text-xl font-bold">
              <ColorfulLogo />
            </div>
            <p className="text-xs text-red-600">Timely Care for your carrier</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="w-full max-w-md shadow-2xl shadow-red-500/20 border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Account Access Restricted
          </CardTitle>
          <div className="w-16 h-0.5 bg-red-500 mx-auto rounded-full mt-2"></div>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-base font-medium text-gray-800 mb-2">
              Your account has been temporarily blocked by our admin team.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              This action was taken due to a violation of our terms of service or app usage policies.
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-orange-600" />
              Request Access Restoration
            </h3>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              Contact our support team to understand the reason for blocking and request account restoration.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleEmailSupport}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Support Team
                <ExternalLink className="w-3 h-3 opacity-75" />
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span>or</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
              
              <Button
                onClick={handleCallSupport}
                variant="outline"
                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 font-medium py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Support: +91 8880105082
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              💡 <strong>Support Email:</strong> info@arudhih.com
              <br />
              Response time: 24-48 hours
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="text-gray-600 hover:text-red-600 hover:bg-red-50 text-sm font-medium"
            >
              Try Different Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-6 text-xs text-gray-500">
        by Arudhih Solutions LLP
      </div>
    </div>
  );
}