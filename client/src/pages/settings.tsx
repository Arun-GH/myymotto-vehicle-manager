import { useState, useEffect } from "react";
import { ArrowLeft, Camera, MapPin, Users, Image, Mic, Shield, Check, X, Settings as SettingsIcon, LayoutGrid, Download, Upload, Mail, Cloud, HardDrive, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import ColorfulLogo from "@/components/colorful-logo";
import BottomNav from "@/components/bottom-nav";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";
import { BackupManager } from "@/lib/backup-utils";
import { useToast } from "@/hooks/use-toast";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  status: 'granted' | 'denied' | 'pending';
}

export default function Settings() {
  const { toast } = useToast();
  const [backupStats, setBackupStats] = useState({
    totalDocuments: 0,
    totalSize: '0 Bytes',
    lastBackup: null as string | null,
    needsBackup: false,
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
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

  // Load backup stats and existing permissions on component mount
  useEffect(() => {
    loadBackupStats();
  }, []);

  const loadBackupStats = async () => {
    try {
      const stats = await BackupManager.getBackupStats();
      setBackupStats(stats);
    } catch (error) {
      console.error('Failed to load backup stats:', error);
    }
  };

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

  // Backup action functions
  const handleDownloadBackup = async () => {
    setIsBackingUp(true);
    try {
      const userId = localStorage.getItem('currentUserId') || '1';
      await BackupManager.exportToFile(userId);
      BackupManager.markBackupCompleted();
      await loadBackupStats();
      toast({
        title: "Backup Downloaded",
        description: "Your data has been saved to your device downloads.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: error instanceof Error ? error.message : "Failed to create backup",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleEmailBackup = async () => {
    setIsBackingUp(true);
    try {
      const userId = localStorage.getItem('currentUserId') || '1';
      await BackupManager.shareViaEmail(userId);
      BackupManager.markBackupCompleted();
      await loadBackupStats();
      toast({
        title: "Email Opened",
        description: "Send the email to save your backup safely.",
      });
    } catch (error) {
      toast({
        title: "Email Failed",
        description: error instanceof Error ? error.message : "Failed to create email backup",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleGoogleDriveBackup = async () => {
    setIsBackingUp(true);
    try {
      const userId = localStorage.getItem('currentUserId') || '1';
      await BackupManager.uploadToGoogleDrive(userId);
      BackupManager.markBackupCompleted();
      await loadBackupStats();
      toast({
        title: "Backup Ready",
        description: "File is ready to upload to Google Drive.",
      });
    } catch (error) {
      toast({
        title: "Drive Backup Failed",
        description: error instanceof Error ? error.message : "Failed to prepare Drive backup",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    try {
      await BackupManager.restoreFromFile(file);
      await loadBackupStats();
      toast({
        title: "Restore Complete",
        description: "Your data has been restored successfully.",
      });
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: error instanceof Error ? error.message : "Failed to restore backup",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-red-50 p-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">App Settings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 pb-20 bg-warm-pattern">
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

        {/* Data Backup & Management Card */}
        <Card className="mb-6 shadow-orange">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-green-600" />
              <span>Data Management</span>
              {backupStats.needsBackup && (
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              )}
            </CardTitle>
            <CardDescription>
              Backup your vehicle documents and data to prevent loss when switching phones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Backup Status */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{backupStats.totalDocuments}</p>
                  <p className="text-xs text-gray-600">Documents</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">{backupStats.totalSize}</p>
                  <p className="text-xs text-gray-600">Total Size</p>
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-600">
                  Last backup: {backupStats.lastBackup || 'Never'}
                </p>
                {backupStats.needsBackup && (
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    ⚠️ Backup recommended (weekly backup keeps your data safe)
                  </p>
                )}
              </div>
            </div>

            {/* Backup Options */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Backup Options
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={handleDownloadBackup}
                  disabled={isBackingUp}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isBackingUp ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Download Backup File
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleEmailBackup}
                    disabled={isBackingUp}
                    variant="outline"
                    className="h-10"
                  >
                    {isBackingUp ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Mail className="w-3 h-3 mr-1" />}
                    Email Backup
                  </Button>
                  <Button
                    onClick={handleGoogleDriveBackup}
                    disabled={isBackingUp}
                    variant="outline"
                    className="h-10"
                  >
                    {isBackingUp ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Cloud className="w-3 h-3 mr-1" />}
                    Google Drive
                  </Button>
                </div>
              </div>
            </div>

            {/* Restore Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Restore Data
              </h3>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  disabled={isRestoring}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  disabled={isRestoring}
                  variant="outline"
                  className="w-full h-10 border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  {isRestoring ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Restore from Backup File
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Select a backup file to restore your data
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Note */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
          <p className="text-xs text-blue-800 text-center">
            🔒 Your privacy is important to us. All backups are created locally and never stored on our servers.
          </p>
        </div>

        {/* Profile Access */}
        {/* Dashboard Customization */}
        <Card className="mb-4 shadow-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Customize Dashboard</h4>
                  <p className="text-sm text-gray-600">Personalize your dashboard layout and widgets</p>
                </div>
              </div>
              <Link href="/dashboard/customize">
                <Button variant="outline" size="sm">
                  Customize
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

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