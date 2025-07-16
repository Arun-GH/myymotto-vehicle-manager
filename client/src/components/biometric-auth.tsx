import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Button } from '@/components/ui/button';
import { Fingerprint, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BiometricAuthProps {
  onSuccess: (identifier: string) => void;
  onError?: (error: string) => void;
  identifier: string;
}

export default function BiometricAuth({ onSuccess, onError, identifier }: BiometricAuthProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const info = await Device.getInfo();
      // Check if device is mobile and potentially supports biometrics
      setIsSupported(info.platform === 'android' || info.platform === 'ios');
    } catch (error) {
      console.log('Biometric check failed:', error);
      setIsSupported(false);
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, you would use a biometric plugin
      // For now, we'll simulate biometric authentication
      const storedIdentifier = localStorage.getItem('biometricIdentifier');
      
      if (storedIdentifier === identifier) {
        // Simulate biometric prompt
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful authentication
        onSuccess(identifier);
        toast({
          title: "Biometric Authentication Successful",
          description: "Welcome back!",
        });
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Biometric authentication failed';
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const setupBiometric = async () => {
    try {
      // Store identifier for future biometric auth
      localStorage.setItem('biometricIdentifier', identifier);
      toast({
        title: "Biometric Setup Complete",
        description: "You can now use biometric authentication",
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Could not setup biometric authentication",
        variant: "destructive",
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Biometric Authentication</p>
            <p className="text-xs text-gray-500">Not supported on this device</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fingerprint className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">Biometric Authentication</p>
            <p className="text-xs text-blue-600">Use your fingerprint for secure access</p>
          </div>
        </div>
        <Button
          onClick={handleBiometricAuth}
          disabled={isLoading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? "Authenticating..." : "Use Biometric"}
        </Button>
      </div>
    </div>
  );
}