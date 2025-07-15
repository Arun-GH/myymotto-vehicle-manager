import { useState, useRef } from "react";
import { Camera, Upload, X, File, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CameraCapture from "./camera-capture";

interface DocumentUploadProps {
  documents: File[];
  onDocumentsChange: (documents: File[]) => void;
}

export default function DocumentUpload({ documents, onDocumentsChange }: DocumentUploadProps) {
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onDocumentsChange([...documents, ...files]);
  };

  const handleCameraCapture = (file: File) => {
    onDocumentsChange([...documents, file]);
    setShowCamera(false);
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    onDocumentsChange(newDocuments);
  };

  const formatFileSize = (bytes: number) => {
    return Math.round(bytes / 1024) + " KB";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">Documents</label>
      
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="p-6 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Upload or capture documents
          </p>
          <div className="flex space-x-2 justify-center">
            <Button
              type="button"
              onClick={() => setShowCamera(true)}
              className="flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Files</span>
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Documents ({documents.length})</p>
          {documents.map((file, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDocument(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
