import { useState, useRef } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Settings, Bell, Calendar, Camera, Upload, FileText, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ColorfulLogo from '@/components/colorful-logo';
import EnhancedFileUpload from '@/components/enhanced-file-upload';
import logoImage from '@assets/Mymotto_Logo_Green_Revised_1752603344750.png';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatForDatabase } from '@/lib/date-format';
import type { Vehicle, MaintenanceRecord } from '@shared/schema';

interface MaintenanceItem {
  type: string;
  service: string;
  recommendedTimeline: string;
}

const twoWheelerMaintenanceSchedule: MaintenanceItem[] = [
  {
    type: 'engine_oil_replacement',
    service: 'Engine oil Replacement',
    recommendedTimeline: 'Every 3000 - 5000 Kms'
  },
  {
    type: 'oil_air_filters_change',
    service: 'Oil and air filters change',
    recommendedTimeline: 'Every 4000 - 6000 Kms'
  },
  {
    type: 'tyres_front_change',
    service: 'Tyres Front change',
    recommendedTimeline: '20000Km or 2 to 3 years'
  },
  {
    type: 'tyres_back_change',
    service: 'Tyres Back changed',
    recommendedTimeline: '40,000 kms or 2 to 3 years'
  },
  {
    type: 'spark_plug_replaced',
    service: 'Spark plug replaced',
    recommendedTimeline: '150000 kms or 5 years'
  },
  {
    type: 'battery_replacement',
    service: 'Battery replacement',
    recommendedTimeline: '4 to 5 years'
  },
  {
    type: 'engine_overhauling',
    service: 'Engine overhauling/Rebore',
    recommendedTimeline: 'Depends on condition'
  }
];

// Four-wheeler essential maintenance schedule from user's table
const fourWheelerMaintenanceSchedule: MaintenanceItem[] = [
  {
    type: 'engine_oil_replacement',
    service: 'Engine oil Replacement',
    recommendedTimeline: '10,000 - 15,000 kms'
  },
  {
    type: 'oil_air_filters_change',
    service: 'Oil and air filters change',
    recommendedTimeline: '40,000 to 50,000 kms'
  },
  {
    type: 'tyres_front_change',
    service: 'Tyres Front change',
    recommendedTimeline: '40,000 to 50,000 kms'
  },
  {
    type: 'tyres_back_change',
    service: 'Tyres Back changed',
    recommendedTimeline: '40,000 kms or 2 to 3 years'
  },
  {
    type: 'battery_replacement',
    service: 'Battery replacement',
    recommendedTimeline: '4 to 5 years'
  },
  {
    type: 'timing_belts',
    service: 'Timing Belts',
    recommendedTimeline: '60,000 to 100000 Kms'
  },
  {
    type: 'ac_regassing',
    service: 'AC regassing',
    recommendedTimeline: '1.5 to 2 years'
  },
  {
    type: 'brake_fluid',
    service: 'Brake Fluid',
    recommendedTimeline: '2 years'
  },
  {
    type: 'clutch_oil',
    service: 'Clutch Oil',
    recommendedTimeline: '2 - 3 years'
  },
  {
    type: 'wheel_balancing',
    service: 'Wheel Balancing',
    recommendedTimeline: '5000 - 8000 kms'
  }
];

export default function MaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceItem | null>(null);
  const [completedDate, setCompletedDate] = useState('');
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const warrantyFileRef = useRef<HTMLInputElement>(null);
  const invoiceFileRef = useRef<HTMLInputElement>(null);
  const warrantyCameraRef = useRef<HTMLInputElement>(null);
  const invoiceCameraRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vehicle details
  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${id}`],
    enabled: !!id,
  });

  // Fetch maintenance records
  const { data: maintenanceRecords = [], isLoading: recordsLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: [`/api/maintenance/records/${id}`],
    enabled: !!id,
  });

  // Create maintenance record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/maintenance/records', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) throw new Error('Failed to create maintenance record');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/maintenance/records/${id}`] });
      toast({
        title: "Success",
        description: "Maintenance record created successfully!",
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create maintenance record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedMaintenance(null);
    setCompletedDate('');
    setWarrantyFile(null);
    setInvoiceFile(null);
    setNotes('');
    if (warrantyFileRef.current) warrantyFileRef.current.value = '';
    if (invoiceFileRef.current) invoiceFileRef.current.value = '';
  };

  const handleFileSelect = (file: File | null, type: 'warranty' | 'invoice') => {
    if (type === 'warranty') {
      setWarrantyFile(file);
    } else {
      setInvoiceFile(file);
    }
  };

  const triggerCamera = (type: 'warranty' | 'invoice') => {
    const ref = type === 'warranty' ? warrantyCameraRef : invoiceCameraRef;
    ref.current?.click();
  };

  const triggerFileUpload = (type: 'warranty' | 'invoice') => {
    const ref = type === 'warranty' ? warrantyFileRef : invoiceFileRef;
    ref.current?.click();
  };

  const handleSubmit = () => {
    if (!selectedMaintenance) {
      toast({
        title: "Error",
        description: "Please select a maintenance type.",
        variant: "destructive",
      });
      return;
    }

    if (!completedDate) {
      toast({
        title: "Error",
        description: "Please enter the completion date.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('vehicleId', id!);
    formData.append('maintenanceType', selectedMaintenance.type);
    formData.append('completedDate', formatForDatabase(completedDate) || "");
    formData.append('notes', notes);
    
    if (warrantyFile) {
      formData.append('warrantyCard', warrantyFile);
    }
    
    if (invoiceFile) {
      formData.append('invoice', invoiceFile);
    }

    createRecordMutation.mutate(formData);
  };

  const getMaintenanceRecord = (type: string) => {
    return maintenanceRecords.find(record => record.maintenanceType === type);
  };

  const openDialog = (maintenance: MaintenanceItem) => {
    setSelectedMaintenance(maintenance);
    const existingRecord = getMaintenanceRecord(maintenance.type);
    if (existingRecord) {
      setCompletedDate(existingRecord.completedDate || '');
      setNotes(existingRecord.notes || '');
    }
    setIsDialogOpen(true);
  };

  if (vehicleLoading || recordsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="header-gradient-border shadow-lg relative z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <img src={logoImage} alt="Myymotto Logo" className="w-14 h-14 rounded-lg" />
                <div>
                  <ColorfulLogo />
                  <p className="text-sm text-red-600">2 Wheeler Essential Replaces</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                  <Bell className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 pb-20 bg-warm-pattern">
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 pb-20 bg-warm-pattern">
          <Card className="shadow-orange">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Vehicle Not Found</h2>
              <p className="text-gray-600 mb-4">The vehicle you're looking for doesn't exist.</p>
              <Link href="/">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <img src={logoImage} alt="Myymotto Logo" className="w-14 h-14 rounded-lg" />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">{vehicle?.vehicleType === '4-wheeler' ? '4 Wheeler' : '2 Wheeler'} Essential Replaces</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                <Bell className="w-5 h-5" />
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                  <Settings className="w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        {/* Vehicle Info Card */}
        <Card className="mb-6 shadow-orange">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{vehicle.make} {vehicle.model} ({vehicle.year})</span>
              <span className="text-sm text-gray-500">{vehicle.licensePlate}</span>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Maintenance Schedule Table */}
        <Card className="shadow-orange">
          <CardHeader>
            <CardTitle>{vehicle?.vehicleType === '4-wheeler' ? '4 Wheeler' : '2 Wheeler'} Essential Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium text-xs">Service</TableHead>
                    <TableHead className="font-medium text-xs">Recommended Timeline</TableHead>
                    <TableHead className="font-medium text-xs text-center">Date Done</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(vehicle?.vehicleType === '4-wheeler' ? fourWheelerMaintenanceSchedule : twoWheelerMaintenanceSchedule).map((item, index) => {
                    const record = getMaintenanceRecord(item.type);
                    const isCompleted = !!record?.completedDate;
                    
                    return (
                      <TableRow key={index} className={isCompleted ? 'bg-green-50' : ''}>
                        <TableCell className="font-medium text-xs py-2">{item.service}</TableCell>
                        <TableCell className="text-xs text-gray-600 py-2">{item.recommendedTimeline}</TableCell>
                        <TableCell className="text-center py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(item)}
                            className={`border-orange-300 text-orange-700 hover:bg-orange-50 text-xs px-2 py-1 h-7 ${
                              record?.completedDate ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' : ''
                            }`}
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            {record?.completedDate ? 'Add Again' : 'Add'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">Update Maintenance Record</DialogTitle>
            <DialogDescription className="text-sm">
              {selectedMaintenance?.service}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Completion Date */}
            <div className="space-y-1">
              <Label htmlFor="completedDate" className="text-sm">Date Completed</Label>
              <Input
                id="completedDate"
                type="text"
                placeholder="dd/mm/yyyy"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="h-8 text-sm"
                maxLength={10}
              />
            </div>

            {/* Warranty Card Upload */}
            <div className="space-y-1">
              <Label className="text-sm">📄 Warranty Card</Label>
              <EnhancedFileUpload
                onFileSelect={(files) => {
                  const file = files[0]; // Single file for warranty card
                  if (file) setWarrantyFile(file);
                }}
                onCameraCapture={() => triggerCamera('warranty')}
                accept="image/*,application/pdf"
                multiple={false}
                showLabels={false}
              />
              {warrantyFile && (
                <div className="text-xs text-green-600 flex items-center justify-between bg-green-50 p-1.5 rounded">
                  <span>📄 {warrantyFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWarrantyFile(null)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              )}
            </div>

            {/* Invoice Upload */}
            <div className="space-y-1">
              <Label className="text-sm">🧾 Invoice</Label>
              <EnhancedFileUpload
                onFileSelect={(files) => {
                  const file = files[0]; // Single file for invoice
                  if (file) setInvoiceFile(file);
                }}
                onCameraCapture={() => triggerCamera('invoice')}
                accept="image/*,application/pdf"
                multiple={false}
                showLabels={false}
              />
              {invoiceFile && (
                <div className="text-xs text-green-600 flex items-center justify-between bg-green-50 p-1.5 rounded">
                  <span>📄 {invoiceFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInvoiceFile(null)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                className="h-8 text-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-8 text-sm"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createRecordMutation.isPending}
                className="flex-1 gradient-warm text-white h-8 text-sm"
              >
                {createRecordMutation.isPending ? 'Saving...' : 'Save Record'}
              </Button>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={warrantyFileRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'warranty')}
            className="hidden"
          />
          <input
            ref={invoiceFileRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'invoice')}
            className="hidden"
          />
          <input
            ref={warrantyCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'warranty')}
            className="hidden"
          />
          <input
            ref={invoiceCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'invoice')}
            className="hidden"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}