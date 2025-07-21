import { useParams, Link } from "wouter";
import { ArrowLeft, Plus, Eye, FileText, Calendar, MapPin, NotebookPen, Wrench, Settings, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import ColorfulLogo from "@/components/colorful-logo";
import { type ServiceLog, type Vehicle } from "@shared/schema";


export default function ServiceLogs() {
  const { vehicleId } = useParams() as { vehicleId: string };

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`],
  });

  const { data: serviceLogs, isLoading: logsLoading } = useQuery<ServiceLog[]>({
    queryKey: [`/api/service-logs/${vehicleId}`],
  });

  if (vehicleLoading || logsLoading) {
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
      <header className="header-gradient-border shadow-lg relative px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-red-50 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 flex-1">
            <ColorfulLogo />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Service Logs</h1>
              <p className="text-sm text-red-600">Timely Care for your carrier</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-red-50">
              <Bell className="w-5 h-5" />
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-red-50">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-md p-4 space-y-4">
        {/* Vehicle Info */}
        {vehicle && (
          <Card className="shadow-orange">
            <CardContent className="p-4">
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800">
                  {vehicle.make?.toUpperCase()} {vehicle.model?.toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Service Logs List */}
        <Card className="shadow-orange">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Wrench className="w-5 h-5 text-blue-600" />
              <span>Service History</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!serviceLogs || serviceLogs.length === 0 ? (
              <div className="text-center py-8 px-4">
                <NotebookPen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No service logs yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Start tracking your vehicle's service history
                </p>
                <Link href={`/vehicle/${vehicleId}/add-service-log`}>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Service Log
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {serviceLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Wrench className="w-4 h-4 text-blue-600" />
                        <h3 className="font-medium text-gray-800">
                          {log.serviceType} - {new Date(log.serviceDate).toLocaleDateString()}
                        </h3>
                      </div>
                      
                      <div className="space-y-1 ml-6">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(log.serviceDate).toLocaleDateString('en-GB')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{log.serviceCentre}</span>
                        </div>
                        
                        {log.notes && (
                          <div className="flex items-start space-x-2 text-sm text-gray-600">
                            <NotebookPen className="w-3 h-3 mt-0.5" />
                            <span className="text-xs">{log.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {log.invoicePath && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/${log.invoicePath}`, '_blank')}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="View Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}