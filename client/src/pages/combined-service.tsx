import { useState, useRef } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Settings, Bell, Calendar, Camera, Upload, FileText, Trash2, Wrench, Plus, MapPin, NotebookPen } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ColorfulLogo from '@/components/colorful-logo';
import logoImage from '@assets/Mymotto_Logo_Green_Revised_1752603344750.png';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
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

const serviceLogSchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  serviceDate: z.string().min(1, "Service date is required"),
  serviceCentre: z.string().min(1, "Service centre is required"),
  notes: z.string().optional(),
});

type ServiceLogForm = z.infer<typeof serviceLogSchema>;

export default function CombinedServicePage() {
  const { id } = useParams<{ id: string }>();
  const [serviceDetailsOpen, setServiceDetailsOpen] = useState(false);
  const [essentialReplacesOpen, setEssentialReplacesOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceItem | null>(null);
  const [completedDate, setCompletedDate] = useState('');
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [selectedServiceFile, setSelectedServiceFile] = useState<File | null>(null);
  const warrantyFileRef = useRef<HTMLInputElement>(null);
  const invoiceFileRef = useRef<HTMLInputElement>(null);
  const warrantyCameraRef = useRef<HTMLInputElement>(null);
  const invoiceCameraRef = useRef<HTMLInputElement>(null);
  const serviceFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get service type from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedServiceType = urlParams.get('serviceType') || "";

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

  const serviceForm = useForm<ServiceLogForm>({
    resolver: zodResolver(serviceLogSchema),
    defaultValues: {
      serviceType: preSelectedServiceType,
      serviceDate: "",
      serviceCentre: "",
      notes: "",
    },
  });

  // Create maintenance record mutation
  const createMaintenanceRecordMutation = useMutation({
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
      resetMaintenanceForm();
      setIsMaintenanceDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create service log mutation
  const createServiceLogMutation = useMutation({
    mutationFn: async (data: ServiceLogForm & { invoice?: File }) => {
      const formData = new FormData();
      formData.append("vehicleId", id!);
      formData.append("serviceType", data.serviceType);
      formData.append("serviceDate", data.serviceDate);
      formData.append("serviceCentre", data.serviceCentre);
      if (data.notes) formData.append("notes", data.notes);
      if (data.invoice) formData.append("invoice", data.invoice);

      const response = await fetch("/api/service-logs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create service log");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-logs/${id}`] });
      toast({
        title: "Service Log Added",
        description: "Your service record has been saved successfully!",
      });
      serviceForm.reset();
      setSelectedServiceFile(null);
      setServiceDetailsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getMaintenanceRecord = (type: string) => {
    return maintenanceRecords.find(record => record.maintenanceType === type);
  };

  const resetMaintenanceForm = () => {
    setSelectedMaintenance(null);
    setCompletedDate('');
    setWarrantyFile(null);
    setInvoiceFile(null);
    setNotes('');
  };

  const openMaintenanceDialog = (item: MaintenanceItem) => {
    setSelectedMaintenance(item);
    setIsMaintenanceDialogOpen(true);
  };

  const handleMaintenanceSubmit = () => {
    if (!selectedMaintenance || !completedDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('vehicleId', id!);
    formData.append('maintenanceType', selectedMaintenance.type);
    formData.append('completedDate', completedDate);
    formData.append('notes', notes);

    if (warrantyFile) {
      formData.append('warrantyCard', warrantyFile);
    }
    if (invoiceFile) {
      formData.append('invoice', invoiceFile);
    }

    createMaintenanceRecordMutation.mutate(formData);
  };

  const handleServiceSubmit = (data: ServiceLogForm) => {
    createServiceLogMutation.mutate({
      ...data,
      invoice: selectedServiceFile || undefined,
    });
  };

  const triggerCamera = (type: 'warranty' | 'invoice' | 'service') => {
    if (type === 'warranty' && warrantyCameraRef.current) {
      warrantyCameraRef.current.click();
    } else if (type === 'invoice' && invoiceCameraRef.current) {
      invoiceCameraRef.current.click();
    } else if (type === 'service' && serviceFileInputRef.current) {
      serviceFileInputRef.current.click();
    }
  };

  const triggerFileUpload = (type: 'warranty' | 'invoice' | 'service') => {
    if (type === 'warranty' && warrantyFileRef.current) {
      warrantyFileRef.current.click();
    } else if (type === 'invoice' && invoiceFileRef.current) {
      invoiceFileRef.current.click();
    } else if (type === 'service' && serviceFileInputRef.current) {
      serviceFileInputRef.current.click();
    }
  };

  const handleFileSelect = (file: File | null, type: 'warranty' | 'invoice' | 'service') => {
    if (type === 'warranty') {
      setWarrantyFile(file);
    } else if (type === 'invoice') {
      setInvoiceFile(file);
    } else if (type === 'service') {
      setSelectedServiceFile(file);
    }
  };

  if (vehicleLoading || recordsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Card className="shadow-orange">
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">Vehicle not found</p>
              <Link href="/">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const maintenanceSchedule = vehicle?.vehicleType === '4-wheeler' ? fourWheelerMaintenanceSchedule : twoWheelerMaintenanceSchedule;

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
                <p className="text-sm text-red-600">{vehicle?.vehicleType === '4-wheeler' ? '4 Wheeler' : '2 Wheeler'} Service Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                <Bell className="w-5 h-5" />
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                  <Settings className="w-5 h-5" />
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

        {/* Service Details Tile */}
        <Card className="mb-4 shadow-orange">
          <Collapsible open={serviceDetailsOpen} onOpenChange={setServiceDetailsOpen}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-gray-50">
                <CardTitle className="flex items-center justify-between text-left">
                  <div className="flex items-center space-x-2">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    <span>Service Details</span>
                  </div>
                  <Plus className={`w-5 h-5 transition-transform ${serviceDetailsOpen ? 'rotate-45' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <form onSubmit={serviceForm.handleSubmit(handleServiceSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Input
                      id="serviceType"
                      {...serviceForm.register("serviceType")}
                      placeholder="e.g., Oil Change, Brake Service"
                      className="h-9"
                    />
                    {serviceForm.formState.errors.serviceType && (
                      <p className="text-sm text-red-600">{serviceForm.formState.errors.serviceType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceDate">Service Date</Label>
                    <Input
                      id="serviceDate"
                      type="date"
                      {...serviceForm.register("serviceDate")}
                      className="h-9"
                    />
                    {serviceForm.formState.errors.serviceDate && (
                      <p className="text-sm text-red-600">{serviceForm.formState.errors.serviceDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceCentre">Service Centre</Label>
                    <Input
                      id="serviceCentre"
                      {...serviceForm.register("serviceCentre")}
                      placeholder="Service center name"
                      className="h-9"
                    />
                    {serviceForm.formState.errors.serviceCentre && (
                      <p className="text-sm text-red-600">{serviceForm.formState.errors.serviceCentre.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      {...serviceForm.register("notes")}
                      placeholder="Additional service notes..."
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Invoice Upload */}
                  <div className="space-y-2">
                    <Label>Invoice (Optional)</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => triggerCamera('service')}
                        className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Camera
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => triggerFileUpload('service')}
                        className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    {selectedServiceFile && (
                      <div className="text-sm text-green-600 flex items-center justify-between bg-green-50 p-2 rounded">
                        <span>📄 {selectedServiceFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileSelect(null, 'service')}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      type="submit"
                      disabled={createServiceLogMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {createServiceLogMutation.isPending ? "Saving..." : "Save Service Log"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setServiceDetailsOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Essential Replacements Tile */}
        <Card className="shadow-orange">
          <Collapsible open={essentialReplacesOpen} onOpenChange={setEssentialReplacesOpen}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-gray-50">
                <CardTitle className="flex items-center justify-between text-left">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-orange-600" />
                    <span>Essential Replacements</span>
                  </div>
                  <Plus className={`w-5 h-5 transition-transform ${essentialReplacesOpen ? 'rotate-45' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-medium text-xs">Service</TableHead>
                        <TableHead className="font-medium text-xs">Recommended Timeline</TableHead>
                        <TableHead className="font-medium text-xs text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceSchedule.map((item, index) => {
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
                                onClick={() => openMaintenanceDialog(item)}
                                className={`border-orange-300 text-orange-700 hover:bg-orange-50 text-xs px-2 py-1 h-7 ${
                                  record?.completedDate ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' : ''
                                }`}
                              >
                                <Calendar className="w-3 h-3 mr-1" />
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
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={serviceFileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'service')}
        className="hidden"
        capture="environment"
      />
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
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'warranty')}
        className="hidden"
        capture="environment"
      />
      <input
        ref={invoiceCameraRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'invoice')}
        className="hidden"
        capture="environment"
      />

      {/* Maintenance Entry Dialog */}
      <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Update Maintenance Record</DialogTitle>
            <DialogDescription>
              {selectedMaintenance?.service}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Completion Date */}
            <div className="space-y-2">
              <Label htmlFor="completedDate">Date Completed</Label>
              <Input
                id="completedDate"
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Warranty Card Upload */}
            <div className="space-y-2">
              <Label>Warranty Card</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => triggerCamera('warranty')}
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => triggerFileUpload('warranty')}
                  className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              {warrantyFile && (
                <div className="text-sm text-green-600 flex items-center justify-between bg-green-50 p-2 rounded">
                  <span>📄 {warrantyFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileSelect(null, 'warranty')}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>

            {/* Invoice Upload */}
            <div className="space-y-2">
              <Label>Invoice</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => triggerCamera('invoice')}
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => triggerFileUpload('invoice')}
                  className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              {invoiceFile && (
                <div className="text-sm text-green-600 flex items-center justify-between bg-green-50 p-2 rounded">
                  <span>📄 {invoiceFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileSelect(null, 'invoice')}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this maintenance..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleMaintenanceSubmit}
                disabled={createMaintenanceRecordMutation.isPending}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {createMaintenanceRecordMutation.isPending ? "Saving..." : "Save Record"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsMaintenanceDialogOpen(false);
                  resetMaintenanceForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}