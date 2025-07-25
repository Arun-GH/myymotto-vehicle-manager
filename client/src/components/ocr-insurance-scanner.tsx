import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Scan, CheckCircle, AlertCircle, Camera, Upload } from 'lucide-react';
import { ocrService, type InsurancePolicyData } from '@/lib/ocr-utils';
import { toast } from '@/hooks/use-toast';

interface OCRInsuranceScannerProps {
  onDataExtracted: (data: InsurancePolicyData) => void;
  onClose: () => void;
}

export function OCRInsuranceScanner({ onDataExtracted, onClose }: OCRInsuranceScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<InsurancePolicyData | null>(null);
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setExtractedData(null);
      setRawText('');
    } else {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpg,.jpeg,.png,.gif,.bmp,.webp';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setExtractedData(null);
        setRawText('');
      }
    };
    input.click();
  };

  const processImage = async () => {
    if (!selectedFile) {
      toast({
        title: "No Image Selected",
        description: "Please select an insurance policy image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Extract text using OCR
      const text = await ocrService.extractText(selectedFile);
      setRawText(text);

      // Parse insurance policy data
      const parsedData = ocrService.parseInsurancePolicyData(text);
      setExtractedData(parsedData);

      toast({
        title: "OCR Complete",
        description: "Insurance policy data extracted successfully",
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "OCR Failed",
        description: "Failed to extract text from image. Please try a clearer image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      onClose();
    }
  };

  const updateExtractedData = (field: keyof InsurancePolicyData, value: string) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [field]: value
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Insurance Policy Scanner
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* File Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Insurance Policy Image</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCameraCapture}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Camera
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => document.getElementById('ocr-file-input')?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
                <input
                  id="ocr-file-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Image</Label>
              <img 
                src={previewUrl} 
                alt="Insurance policy preview" 
                className="w-full max-h-48 object-contain rounded-lg border"
              />
              <Button
                onClick={processImage}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Image...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 mr-2" />
                    Extract Insurance Data
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Scanning document and extracting policy information...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Extracted Data */}
          {extractedData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <Label className="text-sm font-medium">Extracted Insurance Data</Label>
                <Badge variant="secondary">Editable</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Insurance Provider</Label>
                  <Input
                    value={extractedData.provider || ''}
                    onChange={(e) => updateExtractedData('provider', e.target.value)}
                    placeholder="e.g., HDFC ERGO"
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Policy Number</Label>
                  <Input
                    value={extractedData.policyNumber || ''}
                    onChange={(e) => updateExtractedData('policyNumber', e.target.value)}
                    placeholder="Policy number"
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Insured Date</Label>
                  <Input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={extractedData.insuredDate || ''}
                    onChange={(e) => updateExtractedData('insuredDate', e.target.value)}
                    className="h-8"
                    maxLength={10}
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Expiry Date</Label>
                  <Input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={extractedData.expiryDate || ''}
                    onChange={(e) => updateExtractedData('expiryDate', e.target.value)}
                    className="h-8"
                    maxLength={10}
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Sum Insured</Label>
                  <Input
                    value={extractedData.sumInsured || ''}
                    onChange={(e) => updateExtractedData('sumInsured', e.target.value)}
                    placeholder="e.g., ₹500,000"
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Premium Amount</Label>
                  <Input
                    value={extractedData.premiumAmount || ''}
                    onChange={(e) => updateExtractedData('premiumAmount', e.target.value)}
                    placeholder="e.g., ₹12,000"
                    className="h-8"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label className="text-xs">Insured Name</Label>
                  <Input
                    value={extractedData.insuredName || ''}
                    onChange={(e) => updateExtractedData('insuredName', e.target.value)}
                    placeholder="Policy holder name"
                    className="h-8"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label className="text-xs">Vehicle Number</Label>
                  <Input
                    value={extractedData.vehicleNumber || ''}
                    onChange={(e) => updateExtractedData('vehicleNumber', e.target.value)}
                    placeholder="e.g., KA01AB1234"
                    className="h-8"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUseData} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Use This Data
                </Button>
                <Button variant="outline" onClick={() => setExtractedData(null)}>
                  Scan Again
                </Button>
              </div>
            </div>
          )}

          {/* Raw Text (Debug) */}
          {rawText && (
            <details className="space-y-2">
              <summary className="text-sm font-medium cursor-pointer flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                View Raw Extracted Text
              </summary>
              <Textarea
                value={rawText}
                readOnly
                className="h-32 text-xs font-mono"
                placeholder="Extracted text will appear here..."
              />
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}