import { Link } from "wouter";
import { Plus, Car, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FloatingActionButtonProps {
  onCreatePost?: () => void;
}

export default function FloatingActionButton({ onCreatePost }: FloatingActionButtonProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-30">
      {/* Action Options - shown when main button is clicked */}
      {showOptions && (
        <div className="absolute bottom-16 right-0 space-y-2 mb-2">
          {/* Add Vehicle Option */}
          <Link href="/add-vehicle">
            <Button
              size="sm"
              className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => setShowOptions(false)}
            >
              <Car className="w-5 h-5" />
            </Button>
          </Link>
          
          {/* Create Broadcast Post Option */}
          <Button
            size="sm"
            className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            onClick={() => {
              setShowOptions(false);
              onCreatePost?.();
            }}
          >
            <Radio className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className="w-14 h-14 rounded-full gradient-warm text-white border-0 hover:opacity-90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        onClick={() => setShowOptions(!showOptions)}
      >
        <Plus className={`w-6 h-6 transition-transform duration-300 ${showOptions ? 'rotate-45' : ''}`} />
      </Button>
    </div>
  );
}
