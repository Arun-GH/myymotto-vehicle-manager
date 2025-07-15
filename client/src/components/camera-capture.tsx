import { useState, useRef, useCallback } from "react";
import { Camera, X, RotateCcw, Check } from "lucide-react";
import { useCamera } from "@/lib/camera";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const { startCamera, stopCamera, isSupported, error } = useCamera(videoRef);

  const handleStartCamera = useCallback(async () => {
    try {
      await startCamera();
    } catch (err) {
      console.error("Failed to start camera:", err);
    }
  }, [startCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageDataUrl);
    setIsCapturing(true);
  };

  const confirmCapture = () => {
    if (!capturedImage || !canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `document-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
      }
    }, "image/jpeg", 0.8);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCapturing(false);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isSupported) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Camera Not Supported</h3>
          <p className="text-muted-foreground mb-4">
            Your device or browser doesn't support camera access.
          </p>
          <Button onClick={onClose}>Close</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <h2 className="text-lg font-semibold">Capture Document</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white p-4">
                  <p className="mb-4">{error}</p>
                  <Button onClick={handleStartCamera} variant="secondary">
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured document"
            className="w-full h-full object-cover"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay Grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border-2 border-white/30 relative">
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20"></div>
            <div className="absolute bottom-1/3 left-0 right-0 h-px bg-white/20"></div>
            <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/20"></div>
            <div className="absolute top-0 bottom-0 right-1/3 w-px bg-white/20"></div>
          </div>
          <div className="absolute inset-4 border-2 border-white rounded-lg"></div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 text-center">
        {!capturedImage ? (
          <div className="flex items-center justify-center space-x-8">
            {videoRef.current && !error && (
              <Button
                onClick={capturePhoto}
                size="lg"
                className="w-16 h-16 rounded-full bg-white text-black hover:bg-white/90"
              >
                <Camera className="w-8 h-8" />
              </Button>
            )}
            {!videoRef.current?.srcObject && !error && (
              <Button onClick={handleStartCamera} size="lg" variant="secondary">
                Start Camera
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={retakePhoto}
              variant="secondary"
              size="lg"
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Retake</span>
            </Button>
            <Button
              onClick={confirmCapture}
              size="lg"
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-5 h-5" />
              <span>Use Photo</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
