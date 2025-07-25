import { MapPin, Fuel, Building2, Shield, X } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LocationServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const services = [
  {
    id: 'service-centers',
    name: 'Service Centers',
    description: 'Vehicle service and repair centers',
    icon: MapPin,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    count: '10 nearby',
    path: '/service-centers'
  },
  {
    id: 'petrol-bunks',
    name: 'Petrol Bunks',
    description: 'Fuel stations and petrol pumps',
    icon: Fuel,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverColor: 'hover:bg-red-100',
    count: '5 nearby',
    path: '/petrol-bunks'
  },
  {
    id: 'hospitals',
    name: 'Hospitals',
    description: 'Hospitals and medical clinics',
    icon: Building2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100',
    count: '10 nearby',
    path: '/hospitals'
  },
  {
    id: 'police-stations',
    name: 'Police Stations',
    description: 'Police stations and safety services',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100',
    count: '2 nearby',
    path: '/police-stations'
  }
];

export default function LocationServicesModal({ isOpen, onClose }: LocationServicesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-md p-0 bg-white/95 backdrop-blur-sm shadow-2xl shadow-orange-500/20 rounded-xl border-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Location Services</h2>
              <p className="text-xs text-gray-600 mt-1">Find nearby services around you</p>
            </div>
            <Button
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <Link key={service.id} href={service.path}>
                  <div 
                    className={`${service.bgColor} ${service.hoverColor} rounded-xl p-3 cursor-pointer transition-all duration-200 border border-gray-100`}
                    onClick={onClose}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${service.bgColor} rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`w-5 h-5 ${service.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-gray-900">{service.name}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">{service.description}</p>
                        <p className={`text-xs font-medium mt-1 ${service.color}`}>{service.count}</p>
                      </div>
                      <div className="text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-orange-800">
                <span className="font-medium">Location required</span> - Enable GPS for accurate nearby results
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}