import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Settings, Bell, Calendar, Clock, IndianRupee, Wrench, AlertCircle, CheckCircle, Car, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ColorfulLogo from '@/components/colorful-logo';
import logoImage from '@assets/Mymotto_Logo_Green_Revised_1752603344750.png';
import { formatDate } from '@/lib/date-utils';

interface MaintenanceItem {
  mileage: number;
  kmage?: number;
  months?: number;
  services: string[];
  costLow?: number;
  costHigh?: number;
  estimatedCost?: number;
}

interface MaintenanceSchedule {
  id: number;
  make: string;
  model: string;
  year: number;
  scheduleData: {
    schedule: MaintenanceItem[];
    generalServices: {
      oilChange: { interval: string; description: string };
      tireRotation: { interval: string; description: string };
      brakeInspection: { interval: string; description: string };
      batteryCheck: { interval: string; description: string };
      airFilterReplace: { interval: string; description: string };
    };
    drivingCondition: string;
    lastUpdated: string;
  };
  source: string;
  drivingCondition: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  currentOdometerReading?: number;
  lastServiceDate?: string;
}

export default function MaintenanceChecklist() {
  const { id } = useParams<{ id: string }>();
  const [drivingCondition, setDrivingCondition] = useState<'normal' | 'severe'>('normal');
  const [activeTab, setActiveTab] = useState('schedule');

  // Fetch vehicle details
  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${id}`],
    enabled: !!id,
  });

  // Fetch maintenance schedule
  const { data: maintenanceSchedule, isLoading: scheduleLoading } = useQuery<MaintenanceSchedule>({
    queryKey: [`/api/maintenance/schedule`, vehicle?.make, vehicle?.model, vehicle?.year, drivingCondition],
    enabled: !!vehicle,
    retry: false,
  });

  const isLoading = vehicleLoading || scheduleLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getServiceStatus = (mileage: number, currentOdometer?: number) => {
    if (!currentOdometer) return 'unknown';
    
    const remaining = mileage - currentOdometer;
    if (remaining <= 0) return 'overdue';
    if (remaining <= 500) return 'due-soon';
    if (remaining <= 1000) return 'upcoming';
    return 'future';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'due-soon': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'future': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string, remaining: number) => {
    switch (status) {
      case 'overdue': return `Overdue by ${Math.abs(remaining)} km`;
      case 'due-soon': return `Due in ${remaining} km`;
      case 'upcoming': return `Upcoming in ${remaining} km`;
      case 'future': return `Future service in ${remaining} km`;
      default: return 'Status unknown';
    }
  };

  if (isLoading) {
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
                <img src={logoImage} alt="MyyMotto Logo" className="w-14 h-14 rounded-lg" />
                <div>
                  <ColorfulLogo />
                  <p className="text-sm text-red-600">Maintenance Schedule</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                  <Bell className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                  <SettingsIcon className="w-5 h-5" />
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
        <header className="header-gradient-border shadow-lg relative z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <img src={logoImage} alt="MyyMotto Logo" className="w-14 h-14 rounded-lg" />
                <div>
                  <ColorfulLogo />
                  <p className="text-sm text-red-600">Maintenance Schedule</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 pb-20 bg-warm-pattern">
          <Card className="shadow-orange">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Vehicle Not Found</h2>
              <p className="text-gray-600 mb-4">The vehicle you're looking for doesn't exist or may have been removed.</p>
              <Link href="/">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!maintenanceSchedule) {
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
                <img src={logoImage} alt="MyyMotto Logo" className="w-14 h-14 rounded-lg" />
                <div>
                  <ColorfulLogo />
                  <p className="text-sm text-red-600">Maintenance Schedule</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 pb-20 bg-warm-pattern">
          <Card className="shadow-orange">
            <CardContent className="p-6 text-center">
              <Wrench className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Schedule Not Available</h2>
              <p className="text-gray-600 mb-4">
                Maintenance schedule for {vehicle.make} {vehicle.model} ({vehicle.year}) is not available yet.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                We're working to add more vehicle maintenance schedules. Check back later!
              </p>
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
              <img src={logoImage} alt="MyyMotto Logo" className="w-14 h-14 rounded-lg" />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">Maintenance Schedule</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50">
                <SettingsIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        {/* Vehicle Info Card */}
        <Card className="mb-6 shadow-orange">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-blue-600" />
              <span>{vehicle.make} {vehicle.model}</span>
            </CardTitle>
            <CardDescription>
              {vehicle.year} • {vehicle.color} • {vehicle.licensePlate}
              {vehicle.currentOdometerReading && (
                <span className="block mt-1">
                  Current Odometer: {vehicle.currentOdometerReading.toLocaleString()} km
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Driving Condition Toggle */}
        <Card className="mb-6 shadow-orange">
          <CardHeader>
            <CardTitle className="text-lg">Driving Condition</CardTitle>
            <CardDescription>
              Choose your driving condition for customized maintenance schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button
                variant={drivingCondition === 'normal' ? 'default' : 'outline'}
                onClick={() => setDrivingCondition('normal')}
                className="flex-1"
              >
                Normal Driving
              </Button>
              <Button
                variant={drivingCondition === 'severe' ? 'default' : 'outline'}
                onClick={() => setDrivingCondition('severe')}
                className="flex-1"
              >
                Severe Driving
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {drivingCondition === 'severe' 
                ? 'Frequent stop-and-go traffic, dusty conditions, extreme weather'
                : 'Mostly highway driving, moderate city traffic, normal conditions'
              }
            </p>
          </CardContent>
        </Card>

        {/* Maintenance Schedule Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">Service Schedule</TabsTrigger>
            <TabsTrigger value="general">General Services</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            {maintenanceSchedule.scheduleData.schedule.map((item, index) => {
              const status = getServiceStatus(item.kmage || item.mileage, vehicle.currentOdometerReading);
              const remaining = (item.kmage || item.mileage) - (vehicle.currentOdometerReading || 0);
              
              return (
                <Card key={index} className="shadow-orange">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {item.kmage ? `${item.kmage.toLocaleString()} km` : `${item.mileage.toLocaleString()} miles`}
                        {item.months && (
                          <span className="text-sm text-gray-500 ml-2">or {item.months} months</span>
                        )}
                      </CardTitle>
                      <Badge className={getStatusColor(status)}>
                        {vehicle.currentOdometerReading 
                          ? getStatusText(status, remaining)
                          : 'Update odometer'
                        }
                      </Badge>
                    </div>
                    {item.estimatedCost && (
                      <CardDescription className="flex items-center space-x-1">
                        <IndianRupee className="w-4 h-4" />
                        <span>
                          Estimated Cost: {formatCurrency(item.estimatedCost)}
                          {item.costLow && item.costHigh && (
                            <span className="text-gray-500 ml-2">
                              ({formatCurrency(item.costLow)} - {formatCurrency(item.costHigh)})
                            </span>
                          )}
                        </span>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Services included:</h4>
                      <ul className="space-y-1">
                        {item.services.map((service, serviceIndex) => (
                          <li key={serviceIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{service}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            {Object.entries(maintenanceSchedule.scheduleData.generalServices).map(([key, service]) => (
              <Card key={key} className="shadow-orange">
                <CardHeader>
                  <CardTitle className="text-lg capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </CardTitle>
                  <CardDescription>
                    <Clock className="w-4 h-4 inline mr-1" />
                    {service.interval}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Schedule Info */}
        <Card className="mt-6 shadow-orange">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                Schedule updated: {formatDate(maintenanceSchedule.scheduleData.lastUpdated)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
              <AlertCircle className="w-4 h-4" />
              <span>
                Source: {maintenanceSchedule.source === 'manual' ? 'Official OEM Data' : maintenanceSchedule.source}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}