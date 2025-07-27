import { useParams, Link } from "wouter";
import { ArrowLeft, Plus, Eye, FileText, Calendar, MapPin, NotebookPen, Wrench, Settings, Bell, Trash2, IndianRupee } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";
import { type ServiceLog, type Vehicle, type MaintenanceRecord } from "@shared/schema";


export default function ServiceLogs() {
  const { id: vehicleId } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`],
    queryFn: async () => {
      const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";
      const response = await apiRequest("GET", `/api/vehicles/${vehicleId}?userId=${currentUserId}`);
      return response.json();
    },
  });

  const { data: serviceLogs, isLoading: logsLoading } = useQuery<ServiceLog[]>({
    queryKey: [`/api/service-logs/${vehicleId}`],
  });

  const { data: maintenanceRecords, isLoading: maintenanceLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: [`/api/maintenance/records/${vehicleId}`],
  });

  const deleteServiceLogMutation = useMutation({
    mutationFn: async (logId: number) => {
      return apiRequest("DELETE", `/api/service-logs/${logId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-logs/${vehicleId}`] });
      toast({
        title: "Success",
        description: "Service log deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete service log",
        variant: "destructive",
      });
    },
  });

  const deleteMaintenanceRecordMutation = useMutation({
    mutationFn: async (recordId: number) => {
      return apiRequest("DELETE", `/api/maintenance/records/${recordId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/maintenance/records/${vehicleId}`] });
      toast({
        title: "Success",
        description: "Maintenance record deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete maintenance record",
        variant: "destructive",
      });
    },
  });

  const handleDeleteServiceLog = (logId: number) => {
    if (confirm("Are you sure you want to delete this service log?")) {
      deleteServiceLogMutation.mutate(logId);
    }
  };

  const handleDeleteMaintenanceRecord = (recordId: number) => {
    if (confirm("Are you sure you want to delete this maintenance record?")) {
      deleteMaintenanceRecordMutation.mutate(recordId);
    }
  };

  // Calculate yearly total spending
  const currentYear = new Date().getFullYear();
  const yearlyTotal = serviceLogs?.reduce((total, log) => {
    const logYear = new Date(log.serviceDate).getFullYear();
    if (logYear === currentYear && log.billAmount) {
      return total + (log.billAmount / 100); // Convert paise to rupees
    }
    return total;
  }, 0) || 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Sort service logs by date (latest first)
  const sortedServiceLogs = serviceLogs ? [...serviceLogs].sort((a, b) => {
    const dateA = new Date(a.serviceDate).getTime();
    const dateB = new Date(b.serviceDate).getTime();
    return dateB - dateA; // Latest first
  }) : undefined;

  // Sort maintenance records by date (latest first)
  const sortedMaintenanceRecords = maintenanceRecords ? [...maintenanceRecords].sort((a, b) => {
    if (!a.completedDate && !b.completedDate) return 0;
    if (!a.completedDate) return 1; // Move records without date to end
    if (!b.completedDate) return -1; // Move records without date to end
    const dateA = new Date(a.completedDate).getTime();
    const dateB = new Date(b.completedDate).getTime();
    return dateB - dateA; // Latest first
  }) : undefined;

  if (vehicleLoading || logsLoading || maintenanceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50 h-8 w-8">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <img src={logoImage} alt="Myymotto Logo" className="w-12 h-12 rounded-lg" />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Service Logs</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50 h-8 w-8">
                <Bell className="w-4 h-4" />
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50 h-8 w-8">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-md p-2 space-y-2">
        {/* Vehicle Info */}
        {vehicle && (
          <Card className="shadow-orange">
            <CardContent className="p-2">
              <div className="text-center">
                <h2 className="text-sm font-bold text-gray-800">
                  {vehicle.make?.toUpperCase()} {vehicle.model?.toUpperCase()}
                </h2>
                <p className="text-xs text-gray-600">{vehicle.licensePlate}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Yearly Service Spending Summary */}
        {serviceLogs && serviceLogs.length > 0 && yearlyTotal > 0 && (
          <Card className="shadow-orange bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IndianRupee className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">
                    Total Service Spending {currentYear}
                  </span>
                </div>
                <div className="text-sm font-bold text-green-700">
                  {formatCurrency(yearlyTotal)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Logs List */}
        <Card className="shadow-orange">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-gray-800 text-sm">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Service History</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(!sortedServiceLogs || sortedServiceLogs.length === 0) && (!sortedMaintenanceRecords || sortedMaintenanceRecords.length === 0) ? (
              <div className="text-center py-4 px-2">
                <NotebookPen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">No service logs yet</p>
                <p className="text-xs text-gray-500 mb-3">
                  Start tracking your vehicle's service history
                </p>
                <Link href={`/vehicle/${vehicleId}/service`}>
                  <Button className="bg-green-600 hover:bg-green-700 h-8 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Add First Service Log
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Display maintenance records from Essential Replaces */}
                {sortedMaintenanceRecords?.map((record) => (
                  <div
                    key={`maintenance-${record.id}`}
                    className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-1 mb-1">
                        <Wrench className="w-3 h-3 text-green-600" />
                        <h3 className="font-medium text-xs text-gray-800">
                          {record.maintenanceType} (Essential Replace) - {record.completedDate ? new Date(record.completedDate).toLocaleDateString() : 'No date'}
                        </h3>
                      </div>
                      
                      <div className="space-y-1 ml-4">
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{record.completedDate ? new Date(record.completedDate).toLocaleDateString('en-GB') : 'No date'}</span>
                        </div>
                        
                        {record.notes && (
                          <div className="flex items-start space-x-1 text-xs text-gray-600">
                            <NotebookPen className="w-2.5 h-2.5 mt-0.5" />
                            <span className="text-[10px]">{record.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {record.warrantyCardPath && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = record.warrantyCardPath!;
                              link.target = '_blank';
                              link.rel = 'noopener noreferrer';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                            title="View Warranty Card"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMaintenanceRecord(record.id)}
                            className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      {record.invoicePath && !record.warrantyCardPath && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = record.invoicePath!;
                              link.target = '_blank';
                              link.rel = 'noopener noreferrer';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="text-green-600 hover:text-green-800 h-6 w-6 p-0"
                            title="View Invoice"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMaintenanceRecord(record.id)}
                            className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      {!record.warrantyCardPath && !record.invoicePath && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMaintenanceRecord(record.id)}
                          className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Display regular service logs */}
                {sortedServiceLogs?.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-1 mb-1">
                        <Wrench className="w-3 h-3 text-blue-600" />
                        <h3 className="font-medium text-xs text-gray-800">
                          {log.serviceType} - {new Date(log.serviceDate).toLocaleDateString()}
                        </h3>
                      </div>
                      
                      <div className="space-y-1 ml-4">
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{new Date(log.serviceDate).toLocaleDateString('en-GB')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{log.serviceCentre}</span>
                        </div>
                        
                        {log.billAmount && (
                          <div className="flex items-center space-x-1 text-xs text-green-600">
                            <IndianRupee className="w-2.5 h-2.5" />
                            <span className="font-medium">{formatCurrency(log.billAmount / 100)}</span>
                          </div>
                        )}
                        
                        {log.notes && (
                          <div className="flex items-start space-x-1 text-xs text-gray-600">
                            <NotebookPen className="w-2.5 h-2.5 mt-0.5" />
                            <span className="text-[10px]">{log.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {log.invoicePath && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = log.invoicePath!;
                            link.target = '_blank';
                            link.rel = 'noopener noreferrer';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="text-green-600 hover:text-green-800 h-6 w-6 p-0"
                          title="View Invoice"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteServiceLog(log.id)}
                        className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                        title="Delete Service Log"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Service Log Button - Always show when there are existing logs */}
        {((sortedServiceLogs && sortedServiceLogs.length > 0) || (sortedMaintenanceRecords && sortedMaintenanceRecords.length > 0)) && (
          <div className="mt-2">
            <Link href={`/vehicle/${vehicleId}/service`}>
              <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 h-8 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Add New Service Log
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Floating Action Button for Add Service Log */}
      <div className="fixed bottom-20 right-4 z-50">
        <Link href={`/vehicle/${vehicleId}/service`}>
          <Button
            className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white"
            size="icon"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </Link>
      </div>
    </div>
  );
}