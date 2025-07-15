import { Link } from "wouter";
import { Home, Car, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  currentPath: string;
}

export default function BottomNav({ currentPath }: BottomNavProps) {
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/vehicles", icon: Car, label: "Vehicles" },
    { path: "/documents", icon: FileText, label: "Documents" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white/95 backdrop-blur-sm border-t border-red-100 z-20 shadow-lg">
      <div className="grid grid-cols-4 py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          const colors = [
            { active: "text-red-600 bg-red-50", inactive: "text-gray-600 hover:text-red-600 hover:bg-red-50" },
            { active: "text-orange-600 bg-orange-50", inactive: "text-gray-600 hover:text-orange-600 hover:bg-orange-50" },
            { active: "text-yellow-600 bg-yellow-50", inactive: "text-gray-600 hover:text-yellow-600 hover:bg-yellow-50" },
            { active: "text-red-600 bg-red-50", inactive: "text-gray-600 hover:text-red-600 hover:bg-red-50" }
          ];
          
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center py-2 h-auto space-y-1 mx-1 rounded-xl ${
                  isActive ? colors[index].active : colors[index].inactive
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
