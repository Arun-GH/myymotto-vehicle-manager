import { Link } from "wouter";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FloatingActionButton() {
  return (
    <div className="fixed bottom-20 right-4 z-30">
      {/* Add Vehicle Button */}
      <Link href="/add-vehicle">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full gradient-warm text-white border-0 hover:opacity-90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}
