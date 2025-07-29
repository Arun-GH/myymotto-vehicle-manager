import { Link } from "wouter";
import { Plus, Car, Megaphone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function FloatingActionButton() {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-30">
      {/* Action Options - shown when main button is clicked */}
      {showOptions && (
        <div className="absolute bottom-16 right-0 space-y-2 mb-2">
          {/* Calendar Reminder Option */}
          <div className="relative group">
            <Link href="/calendar-reminder">
              <Button
                size="sm"
                className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => setShowOptions(false)}
              >
                <Calendar className="w-5 h-5" />
              </Button>
            </Link>
            <div className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Calendar Reminder
            </div>
          </div>
          
          {/* Add Vehicle Option */}
          <div className="relative group">
            <Link href="/add-vehicle">
              <Button
                size="sm"
                className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => setShowOptions(false)}
              >
                <Car className="w-5 h-5" />
              </Button>
            </Link>
            <div className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Add Vehicle
            </div>
          </div>
          
          {/* Create Broadcast Post Option */}
          <div className="relative group">
            <Link href="/broadcast">
              <Button
                size="sm"
                className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => setShowOptions(false)}
              >
                <Megaphone className="w-5 h-5" />
              </Button>
            </Link>
            <div className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Create Broadcast
            </div>
          </div>
        </div>
      )}

      {/* Main FAB */}
      <div className="relative group">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full gradient-warm text-white border-0 hover:opacity-90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          onClick={() => setShowOptions(!showOptions)}
        >
          <Plus className={`w-6 h-6 transition-transform duration-300 ${showOptions ? 'rotate-45' : ''}`} />
        </Button>
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          Quick Actions
        </div>
      </div>
    </div>
  );
}
