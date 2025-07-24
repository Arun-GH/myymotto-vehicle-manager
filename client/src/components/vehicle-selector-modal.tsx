import { useState } from "react";
import { Car, Files, Wrench, X } from "lucide-react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Vehicle } from "@shared/schema";

interface VehicleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  actionType: 'documents' | 'service-logs';
}

export default function VehicleSelectorModal({ 
  isOpen, 
  onClose, 
  vehicles, 
  actionType 
}: VehicleSelectorModalProps) {
  const getActionConfig = () => {
    if (actionType === 'documents') {
      return {
        title: "Select Vehicle for Documents",
        description: "Choose a vehicle to view its documents",
        icon: Files,
        route: (vehicleId: number) => `/vehicle/${vehicleId}/local-documents`,
        color: "purple"
      };
    } else {
      return {
        title: "Select Vehicle for Service Log",
        description: "Choose a vehicle to view its service history", 
        icon: Wrench,
        route: (vehicleId: number) => `/vehicle/${vehicleId}/service-logs`,
        color: "teal"
      };
    }
  };

  const config = getActionConfig();
  const ActionIcon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-md mx-auto p-0 bg-white/95 backdrop-blur-sm shadow-2xl shadow-orange-500/20 rounded-xl border-0">
        <div className="relative">
          {/* Header with Gradient Background */}
          <div className={`${config.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gradient-to-r from-teal-500 to-cyan-600'} text-white p-4 rounded-t-xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <ActionIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold text-white">
                    {config.title}
                  </DialogTitle>
                  <p className="text-xs text-white/80 mt-0.5">
                    {config.description}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 h-auto rounded-lg transition-all duration-200"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {vehicles.map((vehicle) => (
              <Link key={vehicle.id} href={config.route(vehicle.id)}>
                <Card className="cursor-pointer hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200 border border-gray-100 hover:border-orange-200">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      {vehicle.thumbnailPath ? (
                        <img 
                          src={vehicle.thumbnailPath} 
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-10 h-10 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className={`w-10 h-10 ${config.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-teal-500 to-cyan-600'} rounded-lg flex items-center justify-center shadow-sm`}>
                          <Car className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-800">
                          {vehicle.make?.toUpperCase()}{vehicle.model ? ` ${vehicle.model}` : ''} {vehicle.year && `(${vehicle.year})`}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{vehicle.licensePlate}</p>
                      </div>
                      <div className={`w-6 h-6 ${config.color === 'purple' ? 'bg-purple-50' : 'bg-teal-50'} rounded-full flex items-center justify-center`}>
                        <ActionIcon className={`w-3 h-3 ${config.color === 'purple' ? 'text-purple-600' : 'text-teal-600'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {vehicles.length === 0 && (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">No Vehicles Yet</h3>
              <p className="text-sm text-gray-500 mb-4">Add your first vehicle to get started</p>
              <Link href="/add-vehicle">
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm h-8 px-4 rounded-lg shadow-md transition-all duration-200" 
                  onClick={onClose}
                >
                  Add Vehicle
                </Button>
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}