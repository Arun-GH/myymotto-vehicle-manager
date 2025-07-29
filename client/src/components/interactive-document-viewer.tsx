import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Edit3, 
  Trash2, 
  Save,
  Plus,
  Move,
  Type,
  FileText
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Component for viewing text files
function TextFileViewer({ fileData, mimeType }: { fileData: ArrayBuffer; mimeType: string }) {
  const [textContent, setTextContent] = useState<string>('Loading...');

  useEffect(() => {
    const loadText = async () => {
      try {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(fileData);
        setTextContent(text);
      } catch (error) {
        console.error('Error decoding text file:', error);
        setTextContent('Error: Unable to decode text file');
      }
    };
    
    loadText();
  }, [fileData]);

  return (
    <div className="w-full h-full p-4 bg-white overflow-auto">
      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
        {textContent}
      </pre>
    </div>
  );
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  type: 'note' | 'highlight';
  color: string;
}

interface InteractiveDocumentViewerProps {
  documentId: string;
  fileName: string;
  fileData: ArrayBuffer;
  mimeType: string;
  onClose: () => void;
  onSave?: (annotations: Annotation[]) => void;
}

export function InteractiveDocumentViewer({
  documentId,
  fileName,
  fileData,
  mimeType,
  onClose,
  onSave
}: InteractiveDocumentViewerProps) {
  console.log("InteractiveDocumentViewer props:", { documentId, fileName, mimeType, fileDataLength: fileData.byteLength });
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [annotationType, setAnnotationType] = useState<'note' | 'highlight'>('note');
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [fileUrl, setFileUrl] = useState<string>('');

  useEffect(() => {
    console.log("Creating blob URL for file data, size:", fileData.byteLength);
    // Create blob URL for file data
    const blob = new Blob([fileData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    console.log("Created blob URL:", url);
    setFileUrl(url);

    // Load existing annotations from localStorage
    const savedAnnotations = localStorage.getItem(`annotations_${documentId}`);
    if (savedAnnotations) {
      setAnnotations(JSON.parse(savedAnnotations));
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [fileData, mimeType, documentId]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
    
    toast({
      title: "Download Started",
      description: `${fileName} is being downloaded.`,
    });
  };

  const getRelativePosition = (e: React.MouseEvent) => {
    if (!imageRef.current) return { x: 0, y: 0 };
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isAddingAnnotation) return;
    
    const pos = getRelativePosition(e);
    setDrawStart(pos);
    setIsDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !drawStart) return;
    
    const endPos = getRelativePosition(e);
    const width = Math.abs(endPos.x - drawStart.x);
    const height = Math.abs(endPos.y - drawStart.y);
    
    // Only create annotation if area is meaningful
    if (width > 1 && height > 1) {
      const newAnnotation: Annotation = {
        id: `annotation_${Date.now()}`,
        x: Math.min(drawStart.x, endPos.x),
        y: Math.min(drawStart.y, endPos.y),
        width,
        height,
        text: annotationType === 'note' ? 'Click to add note...' : 'Highlighted text',
        type: annotationType,
        color: annotationType === 'note' ? '#3b82f6' : '#fbbf24'
      };
      
      setAnnotations(prev => [...prev, newAnnotation]);
      setSelectedAnnotation(newAnnotation.id);
      if (annotationType === 'note') {
        setEditingText('');
      }
    }
    
    setIsDrawing(false);
    setDrawStart(null);
    setIsAddingAnnotation(false);
  };

  const handleAnnotationClick = (annotationId: string) => {
    setSelectedAnnotation(annotationId);
    const annotation = annotations.find(a => a.id === annotationId);
    if (annotation) {
      setEditingText(annotation.text);
    }
  };

  const handleSaveAnnotation = () => {
    if (!selectedAnnotation) return;
    
    setAnnotations(prev => prev.map(annotation => 
      annotation.id === selectedAnnotation 
        ? { ...annotation, text: editingText }
        : annotation
    ));
    
    setSelectedAnnotation(null);
    setEditingText('');
    
    toast({
      title: "Annotation Saved",
      description: "Your annotation has been updated.",
    });
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== annotationId));
    setSelectedAnnotation(null);
    
    toast({
      title: "Annotation Deleted",
      description: "Annotation has been removed.",
    });
  };

  const handleSaveAll = () => {
    // Save annotations to localStorage
    localStorage.setItem(`annotations_${documentId}`, JSON.stringify(annotations));
    
    if (onSave) {
      onSave(annotations);
    }
    
    toast({
      title: "Annotations Saved",
      description: `Saved ${annotations.length} annotation(s) for ${fileName}`,
    });
  };

  const isPDF = mimeType === 'application/pdf';
  const isImage = mimeType.startsWith('image/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <Card className="w-full h-full max-w-6xl bg-white shadow-2xl flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span className="text-lg font-semibold truncate">{fileName}</span>
              <Badge variant="secondary" className="text-xs">
                {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 25}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 300}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              {isImage && (
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="w-4 h-4" />
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-1">
              {isImage && (
                <>
                  <Button
                    variant={annotationType === 'note' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setAnnotationType('note');
                      setIsAddingAnnotation(true);
                    }}
                    disabled={isAddingAnnotation}
                  >
                    <Type className="w-4 h-4 mr-1" />
                    Note
                  </Button>
                  <Button
                    variant={annotationType === 'highlight' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setAnnotationType('highlight');
                      setIsAddingAnnotation(true);
                    }}
                    disabled={isAddingAnnotation}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Highlight
                  </Button>
                </>
              )}
              
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveAll}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save All
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex overflow-hidden p-0">
          {/* Document Display */}
          <div className="flex-1 relative overflow-auto bg-gray-100" ref={containerRef}>
            <div 
              className="relative inline-block min-w-full min-h-full flex items-center justify-center p-4"
              style={{ 
                cursor: isAddingAnnotation ? 'crosshair' : 'default'
              }}
            >
              {isImage ? (
                <div className="relative">
                  <img
                    ref={imageRef}
                    src={fileUrl}
                    alt={fileName}
                    className="max-w-none shadow-lg"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    draggable={false}
                  />
                  
                  {/* Annotations Overlay */}
                  {annotations.map(annotation => (
                    <div
                      key={annotation.id}
                      className={`absolute border-2 cursor-pointer ${
                        annotation.type === 'note' 
                          ? 'border-blue-500 bg-blue-500 bg-opacity-20' 
                          : 'border-yellow-500 bg-yellow-500 bg-opacity-30'
                      } ${selectedAnnotation === annotation.id ? 'ring-2 ring-red-500' : ''}`}
                      style={{
                        left: `${annotation.x}%`,
                        top: `${annotation.y}%`,
                        width: `${annotation.width}%`,
                        height: `${annotation.height}%`,
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transformOrigin: 'top left',
                      }}
                      onClick={() => handleAnnotationClick(annotation.id)}
                    >
                      {annotation.type === 'note' && (
                        <div className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap max-w-32 truncate">
                          {annotation.text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : isPDF ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-full border-0"
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top left',
                      width: `${10000 / zoom}%`,
                      height: `${10000 / zoom}%`,
                    }}
                    title={fileName}
                  />
                  {/* PDF fallback if iframe fails */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ display: 'none' }}>
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">PDF preview unavailable</p>
                      <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ) : mimeType.startsWith('text/') || mimeType === 'application/json' ? (
                <TextFileViewer fileData={fileData} mimeType={mimeType} />
              ) : (
                <div className="text-center text-gray-500 p-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">{fileName}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    File type: {mimeType}
                  </p>
                  <p className="mb-4">Preview not available for this file type</p>
                  <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Annotation Editor Sidebar */}
          {selectedAnnotation && (
            <div className="w-80 border-l bg-white p-4 flex-shrink-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Edit Annotation</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAnnotation(selectedAnnotation)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="annotation-text" className="text-xs">
                    Annotation Text
                  </Label>
                  <Textarea
                    id="annotation-text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    placeholder="Enter your note or comment..."
                    className="min-h-24 text-sm"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveAnnotation}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAnnotation(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}