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
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-background border-t border-border z-20">
      <div className="grid grid-cols-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center py-2 h-auto space-y-1 ${
                  isActive ? "text-primary" : "text-muted-foreground"
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
