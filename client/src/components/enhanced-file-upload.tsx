import { useRef } from "react";
import { Camera, Upload, Folder, FileText, Download, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EnhancedFileUploadProps {
  onFileSelect: (files: FileList) => void;
  onCameraCapture?: () => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  showLabels?: boolean;
}

export default function EnhancedFileUpload({
  onFileSelect,
  onCameraCapture,
  accept = "image/*,application/pdf,.doc,.docx,.txt",
  multiple = true,
  className = "",
  showLabels = true
}: EnhancedFileUploadProps) {
  const { toast } = useToast();
  
  // Multiple file input refs for different access methods
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);
  const downloadsInputRef = useRef<HTMLInputElement>(null);
  const storageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (files: FileList | null, source: string) => {
    if (files && files.length > 0) {
      onFileSelect(files);
      toast({
        title: "Files Selected",
        description: `${files.length} file(s) selected from ${source}`,
        className: "bg-green-50 border-green-200 text-green-800"
      });
    }
  };

  const triggerFileInput = (inputRef: React.RefObject<HTMLInputElement>, source: string) => {
    inputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* File Access Options */}
      <div className="grid grid-cols-3 gap-2">
        {/* Camera Capture */}
        <Button
          type="button"
          variant="outline"
          onClick={onCameraCapture || (() => triggerFileInput(cameraInputRef, "Camera"))}
          className="h-12 flex flex-col items-center justify-center border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          <Camera className="w-4 h-4 mb-1" />
          {showLabels && <span className="text-xs">Camera</span>}
        </Button>

        {/* Photos & Documents */}
        <Button
          type="button"
          variant="outline"
          onClick={() => triggerFileInput(galleryInputRef, "Photos & Documents")}
          className="h-12 flex flex-col items-center justify-center border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <Upload className="w-4 h-4 mb-1" />
          {showLabels && <span className="text-xs">Photos & Documents</span>}
        </Button>

        {/* Documents Folder */}
        <Button
          type="button"
          variant="outline"
          onClick={() => triggerFileInput(documentsInputRef, "Documents")}
          className="h-12 flex flex-col items-center justify-center border-green-300 text-green-700 hover:bg-green-50"
        >
          <FileText className="w-4 h-4 mb-1" />
          {showLabels && <span className="text-xs">Documents</span>}
        </Button>

        {/* Downloads Folder */}
        <Button
          type="button"
          variant="outline"
          onClick={() => triggerFileInput(downloadsInputRef, "Downloads")}
          className="h-12 flex flex-col items-center justify-center border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          <Download className="w-4 h-4 mb-1" />
          {showLabels && <span className="text-xs">Downloads</span>}
        </Button>

        {/* File Manager */}
        <Button
          type="button"
          variant="outline"
          onClick={() => triggerFileInput(storageInputRef, "File Manager")}
          className="h-12 flex flex-col items-center justify-center border-teal-300 text-teal-700 hover:bg-teal-50"
        >
          <Folder className="w-4 h-4 mb-1" />
          {showLabels && <span className="text-xs">Files</span>}
        </Button>

        {/* Internal Storage */}
        <Button
          type="button"
          variant="outline"
          onClick={() => triggerFileInput(storageInputRef, "Internal Storage")}
          className="h-12 flex flex-col items-center justify-center border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <HardDrive className="w-4 h-4 mb-1" />
          {showLabels && <span className="text-xs">Storage</span>}
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-center text-gray-500">
        📁 Choose files from camera, gallery, documents, downloads, or internal storage
      </p>

      {/* Hidden File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileInput(e.target.files, "Photos & Documents")}
        className="hidden"
      />
      
      <input
        ref={documentsInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileInput(e.target.files, "Documents")}
        className="hidden"
        // Note: In mobile app, this would open documents folder specifically
      />
      
      <input
        ref={downloadsInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileInput(e.target.files, "Downloads")}
        className="hidden"
        // Note: In mobile app, this would open downloads folder specifically
      />
      
      <input
        ref={storageInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileInput(e.target.files, "Internal Storage")}
        className="hidden"
        // Note: In mobile app, this would open file manager/internal storage
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileInput(e.target.files, "Camera")}
        className="hidden"
      />
    </div>
  );
}