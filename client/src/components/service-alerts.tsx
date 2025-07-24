import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Bell, Clock, CheckCircle, Trash2, Edit3, AlertCircle } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatForDatabase } from '@/lib/date-format';
import { type ServiceAlert } from '@shared/schema';

const serviceAlertSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  notes: z.string().optional(),
});

type ServiceAlertForm = z.infer<typeof serviceAlertSchema>;

interface ServiceAlertsProps {
  vehicleId: number;
}

export default function ServiceAlerts({ vehicleId }: ServiceAlertsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<ServiceAlert | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery<ServiceAlert[]>({
    queryKey: [`/api/service-alerts/${vehicleId}`],
  });

  const form = useForm<ServiceAlertForm>({
    resolver: zodResolver(serviceAlertSchema),
    defaultValues: {
      eventName: "",
      scheduledDate: "",
      notes: "",
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: ServiceAlertForm) => {
      return apiRequest("POST", "/api/service-alerts", {
        ...data,
        vehicleId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-alerts/${vehicleId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Service alert created successfully. You'll receive a notification one day prior.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service alert",
        variant: "destructive",
      });
    },
  });

  const updateAlertMutation = useMutation({
    mutationFn: async (data: ServiceAlertForm & { id: number }) => {
      return apiRequest("PUT", `/api/service-alerts/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-alerts/${vehicleId}`] });
      setEditingAlert(null);
      form.reset();
      toast({
        title: "Success",
        description: "Service alert updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service alert",
        variant: "destructive",
      });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/service-alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-alerts/${vehicleId}`] });
      toast({
        title: "Success",
        description: "Service alert deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service alert",
        variant: "destructive",
      });
    },
  });

  const markCompletedMutation = useMutation({
    mutationFn: async (alert: ServiceAlert) => {
      return apiRequest("PUT", `/api/service-alerts/${alert.id}`, {
        ...alert,
        isCompleted: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-alerts/${vehicleId}`] });
      toast({
        title: "Success",
        description: "Service alert marked as completed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark alert as completed",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceAlertForm) => {
    const formattedData = {
      ...data,
      scheduledDate: formatForDatabase(data.scheduledDate) || data.scheduledDate,
    };
    if (editingAlert) {
      updateAlertMutation.mutate({ ...formattedData, id: editingAlert.id });
    } else {
      createAlertMutation.mutate(formattedData);
    }
  };

  const handleEdit = (alert: ServiceAlert) => {
    setEditingAlert(alert);
    form.setValue("eventName", alert.eventName);
    form.setValue("scheduledDate", alert.scheduledDate);
    form.setValue("notes", alert.notes || "");
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: number, eventName: string) => {
    if (confirm(`Are you sure you want to delete the alert "${eventName}"?`)) {
      deleteAlertMutation.mutate(id);
    }
  };

  const getStatusBadge = (alert: ServiceAlert) => {
    const scheduledDate = new Date(alert.scheduledDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (alert.isCompleted) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Completed</Badge>;
    }
    
    if (scheduledDate < today) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Overdue</Badge>;
    }
    
    if (scheduledDate.toDateString() === today.toDateString()) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">Today</Badge>;
    }
    
    if (scheduledDate.toDateString() === tomorrow.toDateString()) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Tomorrow</Badge>;
    }
    
    return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Upcoming</Badge>;
  };

  const getStatusIcon = (alert: ServiceAlert) => {
    const scheduledDate = new Date(alert.scheduledDate);
    const today = new Date();

    if (alert.isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    
    if (scheduledDate < today) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    
    return <Clock className="w-4 h-4 text-blue-600" />;
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingAlert(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <Card className="shadow-orange-dark border border-orange-300">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-orange-dark border border-orange-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Bell className="w-5 h-5 text-orange-600" />
              <span>Service Alerts</span>
            </CardTitle>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="sm"
              className="h-8 text-xs bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Set Alert
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No service alerts set</p>
              <p className="text-xs mt-1">Create alerts to get reminders for scheduled services</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getStatusIcon(alert)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {alert.eventName}
                          </h4>
                          {getStatusBadge(alert)}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          Scheduled: {new Date(alert.scheduledDate).toLocaleDateString()}
                        </p>
                        {alert.notes && (
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {alert.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {!alert.isCompleted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markCompletedMutation.mutate(alert)}
                          disabled={markCompletedMutation.isPending}
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                          title="Mark as completed"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(alert)}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                        title="Edit alert"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(alert.id, alert.eventName)}
                        disabled={deleteAlertMutation.isPending}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        title="Delete alert"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingAlert ? "Edit Service Alert" : "Set Service Alert"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="eventName" className="text-xs font-medium text-gray-700">
                Event Name
              </Label>
              <Input
                id="eventName"
                {...form.register("eventName")}
                placeholder="e.g., Oil Change, Tire Rotation"
                className="h-8 text-sm mt-1"
              />
              {form.formState.errors.eventName && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.eventName.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="scheduledDate" className="text-xs font-medium text-gray-700">
                Scheduled Date
              </Label>
              <Input
                id="scheduledDate"
                type="text"
                placeholder="dd/mm/yyyy"
                {...form.register("scheduledDate")}
                className="h-8 text-sm mt-1"
                maxLength={10}
              />
              {form.formState.errors.scheduledDate && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.scheduledDate.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-xs font-medium text-gray-700">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Additional notes about this service..."
                className="text-sm mt-1 min-h-[60px]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAlertMutation.isPending || updateAlertMutation.isPending}
                className="h-8 text-xs bg-orange-600 hover:bg-orange-700"
              >
                {createAlertMutation.isPending || updateAlertMutation.isPending ? "Saving..." : "Save Alert"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}