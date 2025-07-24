import { useState } from "react";
import { Calendar, Camera, Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CameraCapture from "./camera-capture";

interface VehicleDocumentSectionProps {
  title: string;
  documentType: string;
  documents: File[];
  onDocumentsChange: (documents: File[]) => void;
  dateValue?: string;
  onDateChange?: (date: string) => void;
  dateLabel?: string;
  textValue?: string;
  onTextChange?: (text: string) => void;
  textLabel?: string;
  textPlaceholder?: string;
}

export default function VehicleDocumentSection({
  title,
  documentType,
  documents,
  onDocumentsChange,
  dateValue,
  onDateChange,
  dateLabel,
  textValue,
  onTextChange,
  textLabel,
  textPlaceholder
}: VehicleDocumentSectionProps) {
  const [showCamera, setShowCamera] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onDocumentsChange([...documents, ...files]);
    event.target.value = ""; // Reset input
  };

  const handleCameraCapture = (file: File) => {
    onDocumentsChange([...documents, file]);
    setShowCamera(false);
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    onDocumentsChange(newDocuments);
  };

  return (
    <Card className="mb-4 shadow-orange">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <File className="w-5 h-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Field (if provided) */}
        {textLabel && onTextChange && (
          <div className="space-y-2">
            <Label htmlFor={`${documentType}-text`} className="text-sm font-medium">
              {textLabel}
            </Label>
            <Input
              id={`${documentType}-text`}
              type="text"
              value={textValue || ""}
              onChange={(e) => onTextChange(e.target.value.toUpperCase())}
              placeholder={textPlaceholder}
              className="h-9"
            />
          </div>
        )}

        {/* Date Field (if provided) */}
        {dateLabel && onDateChange && (
          <div className="space-y-2">
            <Label htmlFor={`${documentType}-date`} className="flex items-center space-x-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span>{dateLabel}</span>
            </Label>
            <Input
              id={`${documentType}-date`}
              type="text"
              placeholder="dd/mm/yyyy"
              value={dateValue || ""}
              onChange={(e) => onDateChange(e.target.value)}
              className="h-9"
              maxLength={10}
            />
          </div>
        )}

        {/* Upload Buttons */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="file"
              id={`upload-${documentType}`}
              accept="image/*,.pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById(`upload-${documentType}`)?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCamera(true)}
          >
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </Button>
        </div>

        {/* Document List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Uploaded Documents:</Label>
            <div className="space-y-2">
              {documents.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <File className="w-4 h-4" />
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}