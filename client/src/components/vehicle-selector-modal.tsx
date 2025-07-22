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
        description: "Choose a vehicle to manage its service records", 
        icon: Wrench,
        route: (vehicleId: number) => `/vehicle/${vehicleId}/service`,
        color: "teal"
      };
    }
  };

  const config = getActionConfig();
  const ActionIcon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 sm:mx-auto p-4">
        <DialogHeader className="pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-center text-base font-semibold flex items-center gap-2">
              <ActionIcon className={`w-4 h-4 ${config.color === 'purple' ? 'text-purple-600' : 'text-teal-600'}`} />
              {config.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 p-1 h-auto"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-600 text-center mt-1">
            {config.description}
          </p>
        </DialogHeader>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {vehicles.map((vehicle) => (
            <Link key={vehicle.id} href={config.route(vehicle.id)}>
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Car className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-gray-800">
                        {vehicle.make?.toUpperCase()}{vehicle.model ? ` ${vehicle.model}` : ''} {vehicle.year && `(${vehicle.year})`}
                      </h3>
                      <p className="text-xs text-gray-600">{vehicle.licensePlate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {vehicles.length === 0 && (
          <div className="text-center py-6">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No vehicles added yet</p>
            <Link href="/add-vehicle">
              <Button className="mt-3 text-sm h-8" onClick={onClose}>
                Add Your First Vehicle
              </Button>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}