import { useEffect, useState } from "react";
import { Camera, MapPin, Users, Image, Mic, Shield, Check, X, Folder, FileText, Download, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import ColorfulLogo from "@/components/colorful-logo";

interface PermissionsScreenProps {
  onComplete: () => void;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  status: 'pending' | 'granted' | 'denied';
}

export default function PermissionsScreen({ onComplete }: PermissionsScreenProps) {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'camera',
      name: 'Camera Access',
      description: 'Take photos of documents and vehicle',
      icon: <Camera className="w-6 h-6" />,
      required: true,
      status: 'pending'
    },
    {
      id: 'location',
      name: 'Location Access',
      description: 'Find nearby service centers',
      icon: <MapPin className="w-6 h-6" />,
      required: true,
      status: 'pending'
    },
    {
      id: 'gallery',
      name: 'Photo Gallery',
      description: 'Upload images from your gallery',
      icon: <Image className="w-6 h-6" />,
      required: true,
      status: 'pending'
    },
    {
      id: 'contacts',
      name: 'Contacts Access',
      description: 'Save emergency contacts easily',
      icon: <Users className="w-6 h-6" />,
      required: false,
      status: 'pending'
    },
    {
      id: 'microphone',
      name: 'Microphone Access',
      description: 'Voice notes for service records',
      icon: <Mic className="w-6 h-6" />,
      required: false,
      status: 'pending'
    },
    {
      id: 'documents',
      name: 'Documents Folder',
      description: 'Access documents saved on your device',
      icon: <FileText className="w-6 h-6" />,
      required: true,
      status: 'pending'
    },
    {
      id: 'downloads',
      name: 'Downloads Folder',
      description: 'Access files in your downloads folder',
      icon: <Download className="w-6 h-6" />,
      required: true,
      status: 'pending'
    },
    {
      id: 'files',
      name: 'File Manager Access',
      description: 'Browse and upload files from your device',
      icon: <Folder className="w-6 h-6" />,
      required: true,
      status: 'pending'
    },
    {
      id: 'storage',
      name: 'Internal Storage',
      description: 'Access internal storage and saved files',
      icon: <HardDrive className="w-6 h-6" />,
      required: true,
      status: 'pending'
    }
  ]);

  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermission = async (permissionId: string) => {
    setIsRequesting(true);
    
    try {
      let granted = false;
      
      switch (permissionId) {
        case 'camera':
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              stream.getTracks().forEach(track => track.stop()); // Stop the stream
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
          // File input access is generally allowed
          granted = true;
          break;
          
        case 'contacts':
          // Contacts API is limited on web, but we can mark as granted for UI
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
          
        case 'documents':
        case 'downloads':
        case 'files':
        case 'storage':
          // File system access is granted by default in web browsers through file input
          // In mobile app, this would request actual file system permissions
          granted = true;
          break;
      }
      
      setPermissions(prev => {
        const updated = prev.map(p => 
          p.id === permissionId 
            ? { ...p, status: (granted ? 'granted' : 'denied') as Permission['status'] }
            : p
        );
        
        // Save settings automatically when permission is granted/denied
        savePermissionSettings(updated);
        return updated;
      });
    } catch (error) {
      setPermissions(prev => {
        const updated = prev.map(p => 
          p.id === permissionId 
            ? { ...p, status: 'denied' as Permission['status'] }
            : p
        );
        
        // Save settings automatically even when denied
        savePermissionSettings(updated);
        return updated;
      });
    }
    
    setIsRequesting(false);
  };

  const savePermissionSettings = (updatedPermissions: Permission[]) => {
    const permissionStatus = updatedPermissions.reduce((acc, p) => {
      acc[p.id] = p.status;
      return acc;
    }, {} as Record<string, string>);
    
    localStorage.setItem('appPermissions', JSON.stringify(permissionStatus));
  };

  const requestAllPermissions = async () => {
    setIsRequesting(true);
    
    for (const permission of permissions) {
      if (permission.status === 'pending') {
        await requestPermission(permission.id);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setIsRequesting(false);
  };

  const handleContinue = () => {
    // Store permission status in localStorage
    const permissionStatus = permissions.reduce((acc, p) => {
      acc[p.id] = p.status;
      return acc;
    }, {} as Record<string, string>);
    
    const currentUserId = localStorage.getItem("currentUserId");
    localStorage.setItem('appPermissions', JSON.stringify(permissionStatus));
    // Mark permissions as completed for this specific user
    localStorage.setItem(`permissionsCompleted_${currentUserId}`, 'true');
    onComplete();
  };

  const requiredPermissions = permissions.filter(p => p.required);
  const optionalPermissions = permissions.filter(p => !p.required);
  const allRequiredGranted = requiredPermissions.every(p => p.status === 'granted');

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-orange-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
            <div className="text-2xl font-bold mb-2">
              <ColorfulLogo />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">App Permissions</h2>
            <p className="text-gray-600 text-sm">
              To provide the best experience, Myymotto needs access to some device features
            </p>
          </div>

          {/* Required Permissions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Required Permissions
            </h3>
            <div className="space-y-3">
              {requiredPermissions.map((permission) => (
                <div key={permission.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        permission.status === 'granted' ? 'bg-green-100 text-green-600' :
                        permission.status === 'denied' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {permission.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{permission.name}</h4>
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {permission.status === 'granted' && <Check className="w-5 h-5 text-green-600" />}
                      {permission.status === 'denied' && <X className="w-5 h-5 text-red-600" />}
                      {permission.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => requestPermission(permission.id)}
                          disabled={isRequesting}
                          className="text-xs"
                        >
                          Allow
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Permissions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Optional Permissions
            </h3>
            <div className="space-y-3">
              {optionalPermissions.map((permission) => (
                <div key={permission.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        permission.status === 'granted' ? 'bg-green-100 text-green-600' :
                        permission.status === 'denied' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {permission.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{permission.name}</h4>
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {permission.status === 'granted' && <Check className="w-5 h-5 text-green-600" />}
                      {permission.status === 'denied' && <X className="w-5 h-5 text-red-600" />}
                      {permission.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => requestPermission(permission.id)}
                          disabled={isRequesting}
                          className="text-xs"
                        >
                          Allow
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={requestAllPermissions}
              disabled={isRequesting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
            >
              {isRequesting ? 'Requesting Permissions...' : 'Allow All Permissions'}
            </Button>
            
            {/* Next Button - Always visible for new users */}
            <Button
              onClick={handleContinue}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transition-all duration-200"
            >
              Next →
            </Button>
            
            {!allRequiredGranted && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-center text-sm text-orange-700">
                  Note: Some features may be limited without required permissions
                </p>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-800 text-center">
              🔒 Your privacy is important to us. These permissions are only used for app functionality and data stays on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}