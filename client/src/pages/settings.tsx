import { useState, useEffect } from "react";
import { ArrowLeft, Camera, MapPin, Users, Image, Mic, Shield, Check, X, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import ColorfulLogo from "@/components/colorful-logo";
import BottomNav from "@/components/bottom-nav";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  status: 'granted' | 'denied' | 'pending';
}

export default function Settings() {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'camera',
      name: 'Camera Access',
      description: 'Take photos of documents and vehicle',
      icon: <Camera className="w-5 h-5" />,
      required: true,
      status: 'pending'
    },
    {
      id: 'location',
      name: 'Location Access',
      description: 'Find nearby service centers',
      icon: <MapPin className="w-5 h-5" />,
      required: true,
      status: 'pending'
    },
    {
      id: 'gallery',
      name: 'Photo Gallery',
      description: 'Upload images from your gallery',
      icon: <Image className="w-5 h-5" />,
      required: true,
      status: 'pending'
    },
    {
      id: 'contacts',
      name: 'Contacts Access',
      description: 'Save emergency contacts easily',
      icon: <Users className="w-5 h-5" />,
      required: false,
      status: 'pending'
    },
    {
      id: 'microphone',
      name: 'Microphone Access',
      description: 'Voice notes for service records',
      icon: <Mic className="w-5 h-5" />,
      required: false,
      status: 'pending'
    }
  ]);

  const [isRequesting, setIsRequesting] = useState(false);

  // Load existing permissions on component mount
  useEffect(() => {
    const existingPermissions = localStorage.getItem('appPermissions');
    if (existingPermissions) {
      try {
        const permissionStatus = JSON.parse(existingPermissions);
        setPermissions(prev => prev.map(p => ({
          ...p,
          status: permissionStatus[p.id] || 'pending'
        })));
      } catch (error) {
        console.error('Error loading permissions:', error);
      }
    }
  }, []);

  const requestPermission = async (permissionId: string) => {
    setIsRequesting(true);
    
    try {
      let granted = false;
      
      switch (permissionId) {
        case 'camera':
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              stream.getTracks().forEach(track => track.stop());
              granted = true;
            } catch (error) {
              granted = false;
            }
          }
          break;
          
        case 'location':
          if (navigator.geolocation) {
            try {
              await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
              });
              granted = true;
            } catch (error) {
              granted = false;
            }
          }
          break;
          
        case 'gallery':
          granted = true;
          break;
          
        case 'contacts':
          granted = true;
          break;
          
        case 'microphone':
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              stream.getTracks().forEach(track => track.stop());
              granted = true;
            } catch (error) {
              granted = false;
            }
          }
          break;
      }
      
      const newStatus = granted ? 'granted' : 'denied';
      setPermissions(prev => prev.map(p => 
        p.id === permissionId 
          ? { ...p, status: newStatus }
          : p
      ));

      // Update localStorage
      const updatedPermissions = permissions.reduce((acc, p) => {
        acc[p.id] = p.id === permissionId ? newStatus : p.status;
        return acc;
      }, {} as Record<string, string>);
      localStorage.setItem('appPermissions', JSON.stringify(updatedPermissions));
      
    } catch (error) {
      setPermissions(prev => prev.map(p => 
        p.id === permissionId 
          ? { ...p, status: 'denied' }
          : p
      ));
    }
    
    setIsRequesting(false);
  };

  const togglePermission = (permissionId: string) => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission) return;

    if (permission.status === 'granted') {
      // Revoke permission
      setPermissions(prev => prev.map(p => 
        p.id === permissionId 
          ? { ...p, status: 'denied' }
          : p
      ));
    } else {
      // Request permission
      requestPermission(permissionId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-red-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-14 h-14 rounded-lg"
              />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">App Settings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        {/* Permissions Card */}
        <Card className="mb-6 shadow-orange">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>App Permissions</span>
            </CardTitle>
            <CardDescription>
              Control which device features Myymotto can access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Required Permissions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Required Permissions
              </h3>
              <div className="space-y-3">
                {permissions.filter(p => p.required).map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        permission.status === 'granted' ? 'bg-green-100 text-green-600' :
                        permission.status === 'denied' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {permission.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{permission.name}</h4>
                        <p className="text-xs text-gray-600">{permission.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {permission.status === 'granted' && <Check className="w-4 h-4 text-green-600" />}
                      {permission.status === 'denied' && <X className="w-4 h-4 text-red-600" />}
                      <Switch
                        checked={permission.status === 'granted'}
                        onCheckedChange={() => togglePermission(permission.id)}
                        disabled={isRequesting}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Permissions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Optional Permissions
              </h3>
              <div className="space-y-3">
                {permissions.filter(p => !p.required).map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        permission.status === 'granted' ? 'bg-green-100 text-green-600' :
                        permission.status === 'denied' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {permission.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{permission.name}</h4>
                        <p className="text-xs text-gray-600">{permission.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {permission.status === 'granted' && <Check className="w-4 h-4 text-green-600" />}
                      {permission.status === 'denied' && <X className="w-4 h-4 text-red-600" />}
                      <Switch
                        checked={permission.status === 'granted'}
                        onCheckedChange={() => togglePermission(permission.id)}
                        disabled={isRequesting}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Note */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
          <p className="text-xs text-blue-800 text-center">
            🔒 Your privacy is important to us. These permissions are only used for app functionality and data stays on your device.
          </p>
        </div>

        {/* Profile Access */}
        <Card className="mb-4 shadow-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">User Profile</h4>
                  <p className="text-sm text-gray-600">Manage your personal information</p>
                </div>
              </div>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Reset Permissions Button */}
        <Button
          onClick={() => {
            const currentUserId = localStorage.getItem("currentUserId");
            localStorage.removeItem('appPermissions');
            localStorage.removeItem(`permissionsCompleted_${currentUserId}`);
            setPermissions(prev => prev.map(p => ({ ...p, status: 'pending' })));
          }}
          variant="outline"
          className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          Reset All Permissions
        </Button>
      </div>

      <BottomNav currentPath="/" />
    </div>
  );
}