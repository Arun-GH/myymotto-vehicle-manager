import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Button } from '@/components/ui/button';
import { Fingerprint, Smartphone, Loader2 } from 'lucide-react';
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
      
      // Check for WebAuthn support in browsers
      if (info.platform === 'web' && window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);
        return;
      }
      
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
      const info = await Device.getInfo();
      
      // Check if we have stored biometric setup for this user
      const biometricEnabled = localStorage.getItem(`biometricEnabled_${identifier}`) === 'true';
      if (!biometricEnabled) {
        throw new Error('Biometric authentication not set up for this user');
      }
      
      if (info.platform === 'web' && window.PublicKeyCredential) {
        // Use WebAuthn for web browsers
        await authenticateWithWebAuthn();
      } else {
        // Use Capacitor Biometric Auth for mobile
        await authenticateWithMobileBiometric();
      }
      
      // Store authentication state
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authMethod", "biometric");
      localStorage.setItem("lastUsedIdentifier", identifier);
      
      onSuccess(identifier);
      toast({
        title: "Authentication Successful",
        description: "Welcome back!",
      });
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

  const authenticateWithWebAuthn = async () => {
    // Get stored credential ID for this user
    const credentialId = localStorage.getItem(`webauthn_credentialId_${identifier}`);
    if (!credentialId) {
      throw new Error('No biometric credentials found. Please set up biometric authentication first.');
    }

    // Create authentication request
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{
          id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
          type: 'public-key'
        }],
        userVerification: 'required'
      }
    });

    if (!assertion) {
      throw new Error('Biometric authentication failed');
    }
  };

  const authenticateWithMobileBiometric = async () => {
    // For mobile platforms, simulate biometric prompt
    // In a real implementation, you would use @capacitor-community/biometric-auth
    const storedIdentifier = localStorage.getItem(`biometricIdentifier_${identifier}`);
    
    if (storedIdentifier !== identifier) {
      throw new Error('Biometric authentication failed');
    }

    // Simulate biometric prompt delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Random chance of failure to simulate real biometric behavior
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Biometric authentication failed. Please try again.');
    }
  };

  const setupBiometric = async () => {
    try {
      const info = await Device.getInfo();
      
      if (info.platform === 'web' && window.PublicKeyCredential) {
        await setupWebAuthn();
      } else {
        await setupMobileBiometric();
      }
      
      // Mark biometric as enabled for this user
      localStorage.setItem(`biometricEnabled_${identifier}`, 'true');
      localStorage.setItem(`biometricIdentifier_${identifier}`, identifier);
      
      toast({
        title: "Biometric Setup Complete",
        description: "You can now use fingerprint to login quickly",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Setup failed';
      toast({
        title: "Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const setupWebAuthn = async () => {
    // Create registration request
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    
    const userId = new TextEncoder().encode(identifier);
    
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: "MyyMotto",
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: identifier,
          displayName: identifier,
        },
        pubKeyCredParams: [{
          type: "public-key",
          alg: -7, // ES256
        }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000,
      }
    });

    if (!credential) {
      throw new Error('Failed to create biometric credential');
    }

    // Store credential ID for future authentication
    const publicKeyCredential = credential as PublicKeyCredential;
    const credentialId = btoa(String.fromCharCode(...Array.from(new Uint8Array(publicKeyCredential.rawId))));
    localStorage.setItem(`webauthn_credentialId_${identifier}`, credentialId);
  };

  const setupMobileBiometric = async () => {
    // For mobile platforms, just store the setup flag
    // In a real implementation, you would use @capacitor-community/biometric-auth
    // to check if biometric is available and prompt user to enable it
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Fingerprint Login</p>
            <p className="text-xs text-gray-500">Not supported on this device</p>
          </div>
        </div>
      </div>
    );
  }

  const biometricEnabled = localStorage.getItem(`biometricEnabled_${identifier}`) === 'true';

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fingerprint className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              {biometricEnabled ? "Fingerprint Login" : "Set up Fingerprint"}
            </p>
            <p className="text-xs text-blue-600">
              {biometricEnabled ? "Touch sensor for quick access" : "Enable for faster login"}
            </p>
          </div>
        </div>
        
        {biometricEnabled ? (
          <Button
            onClick={handleBiometricAuth}
            disabled={isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Use Fingerprint"
            )}
          </Button>
        ) : (
          <Button
            onClick={setupBiometric}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100 min-w-[80px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              "Enable"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}