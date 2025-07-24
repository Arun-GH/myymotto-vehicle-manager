import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Calendar, Clock, MapPin, Wrench, AlertTriangle, CheckCircle, Circle } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { formatToDDMMMYYYY } from "@/lib/date-format";
import logoImage from "@assets/Mymotto_Logo_Green_Revised_1752603344750.png";

interface ServiceRecord {
  id: number;
  serviceType: string;
  serviceDate: string;
  serviceCentre: string;
  notes: string;
  invoiceUrl?: string;
  createdAt: string;
  isEssentialReplace?: boolean;
}

interface MaintenanceRecord {
  id: number;
  maintenanceType: string;
  completedDate: string;
  warrantyCardUrl?: string;
  invoiceUrl?: string;
  notes?: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  lastServiceDate?: string;
  currentOdometerReading?: number;
  serviceIntervalKm?: number;
}

interface TimelineEvent {
  id: string;
  type: 'service' | 'maintenance' | 'upcoming';
  title: string;
  date: string;
  location?: string;
  notes?: string;
  status: 'completed' | 'upcoming' | 'overdue';
  documents?: string[];
}

export default function ServiceTimeline() {
  const [match, params] = useRoute("/vehicle/:id/timeline");
  const vehicleId = params?.id;

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", vehicleId],
    queryFn: async () => {
      const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";
      const response = await apiRequest("GET", `/api/vehicles/${vehicleId}?userId=${currentUserId}`);
      return response.json();
    },
    enabled: !!vehicleId,
  });

  const { data: serviceRecords = [], isLoading: servicesLoading } = useQuery<ServiceRecord[]>({
    queryKey: ["/api/service-logs", vehicleId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/service-logs/${vehicleId}`);
      return response.json();
    },
    enabled: !!vehicleId,
  });

  const { data: maintenanceRecords = [], isLoading: maintenanceLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance-records", vehicleId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/maintenance-records?vehicleId=${vehicleId}`);
      return response.json();
    },
    enabled: !!vehicleId,
  });

  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Add service records
    serviceRecords.forEach(record => {
      events.push({
        id: `service-${record.id}`,
        type: 'service',
        title: record.isEssentialReplace ? `Essential Replace: ${record.serviceType}` : `Service: ${record.serviceType}`,
        date: record.serviceDate,
        location: record.serviceCentre,
        notes: record.notes,
        status: 'completed',
        documents: record.invoiceUrl ? [record.invoiceUrl] : [],
      });
    });

    // Add maintenance records
    maintenanceRecords.forEach(record => {
      events.push({
        id: `maintenance-${record.id}`,
        type: 'maintenance',
        title: `Maintenance: ${record.maintenanceType}`,
        date: record.completedDate,
        notes: record.notes,
        status: 'completed',
        documents: [record.warrantyCardUrl, record.invoiceUrl].filter(Boolean) as string[],
      });
    });

    // Add upcoming service if applicable
    if (vehicle?.lastServiceDate && vehicle?.serviceIntervalKm && vehicle?.currentOdometerReading) {
      const lastServiceDate = new Date(vehicle.lastServiceDate);
      const nextServiceDate = new Date(lastServiceDate);
      nextServiceDate.setMonth(nextServiceDate.getMonth() + 3); // Approximate 3 months for next service

      const today = new Date();
      const isOverdue = nextServiceDate < today;

      events.push({
        id: 'upcoming-service',
        type: 'upcoming',
        title: 'Next Scheduled Service',
        date: nextServiceDate.toISOString().split('T')[0],
        notes: `Recommended based on ${vehicle.serviceIntervalKm}km interval`,
        status: isOverdue ? 'overdue' : 'upcoming',
      });
    }

    // Sort events by date (newest first)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineEvents = generateTimelineEvents();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'upcoming':
        return <Circle className="w-4 h-4 text-orange-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (vehicleLoading || servicesLoading || maintenanceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service timeline...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vehicle not found</p>
          <Link href="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="header-gradient-border px-3 py-3 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="Myymotto" className="w-8 h-8 rounded-full" />
          <div className="text-center">
            <h1 className="text-base font-bold text-red-600">Myymotto</h1>
            <p className="text-[10px] text-red-600 font-medium">Timely Care For Your Carrier</p>
          </div>
        </div>
        
        <div className="w-8 h-8"></div>
      </div>

      <div className="p-3 space-y-4">
        {/* Vehicle Info */}
        <Card className="shadow-orange">
          <CardHeader className="p-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              Service Timeline
            </CardTitle>
            <div className="text-sm text-gray-600">
              {vehicle.make} {vehicle.model} {vehicle.year} • {vehicle.licensePlate}
            </div>
          </CardHeader>
        </Card>

        {/* Timeline Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-2 text-center">
            <div className="text-lg font-bold text-green-600">
              {timelineEvents.filter(e => e.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </Card>
          <Card className="p-2 text-center">
            <div className="text-lg font-bold text-orange-600">
              {timelineEvents.filter(e => e.status === 'upcoming').length}
            </div>
            <div className="text-xs text-gray-600">Upcoming</div>
          </Card>
          <Card className="p-2 text-center">
            <div className="text-lg font-bold text-red-600">
              {timelineEvents.filter(e => e.status === 'overdue').length}
            </div>
            <div className="text-xs text-gray-600">Overdue</div>
          </Card>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {timelineEvents.length === 0 ? (
            <Card className="p-6 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">No service history found</p>
              <p className="text-sm text-gray-500">Start by adding your first service record</p>
              <Link href={`/vehicle/${vehicleId}/add-service-log`}>
                <Button className="mt-3 bg-orange-500 hover:bg-orange-600">
                  Add Service Record
                </Button>
              </Link>
            </Card>
          ) : (
            timelineEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline connector */}
                {index < timelineEvents.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                )}
                
                <Card className={`ml-4 ${getStatusColor(event.status)} border-l-4`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(event.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {event.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatToDDMMMYYYY(event.date)}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {event.notes && (
                          <p className="text-xs text-gray-700 mb-2">{event.notes}</p>
                        )}
                        
                        {event.documents && event.documents.length > 0 && (
                          <div className="flex gap-1">
                            {event.documents.map((doc, docIndex) => (
                              <Button
                                key={docIndex}
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs px-2"
                                onClick={() => window.open(doc, '_blank')}
                              >
                                View Document
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        {timelineEvents.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-4">
            <Link href={`/vehicle/${vehicleId}/add-service-log`}>
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Add Service
              </Button>
            </Link>
            <Link href={`/vehicle/${vehicleId}/service`}>
              <Button variant="outline" className="w-full">
                Maintenance
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}