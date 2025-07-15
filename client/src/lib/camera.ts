import { useRef, useCallback, useEffect, useState } from "react";

interface CameraState {
  stream: MediaStream | null;
  isSupported: boolean;
  error: string | null;
}

export function useCamera(videoRef: React.RefObject<HTMLVideoElement>) {
  const [state, setState] = useState<CameraState>({
    stream: null,
    isSupported: typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
    error: null,
  });

  const startCamera = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: "Camera not supported on this device" }));
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null }));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState(prev => ({ ...prev, stream }));
    } catch (error) {
      console.error("Error accessing camera:", error);
      setState(prev => ({ 
        ...prev, 
        error: "Failed to access camera. Please check permissions and try again." 
      }));
    }
  }, [state.isSupported, videoRef]);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
      setState(prev => ({ ...prev, stream: null }));
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [state.stream, videoRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [state.stream]);

  return {
    startCamera,
    stopCamera,
    isSupported: state.isSupported,
    error: state.error,
    stream: state.stream,
  };
}
