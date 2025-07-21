import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Settings, Bell, Eye, EyeOff, GripVertical, Plus, Trash2, BarChart3, Zap, Car, Newspaper, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import ColorfulLogo from "@/components/colorful-logo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type DashboardWidget = {
  id: number;
  userId: number;
  widgetType: string;
  position: number;
  isVisible: boolean;
  size: string;
  createdAt: string;
  updatedAt: string;
};

const WIDGET_TYPES = {
  stats: { name: "Statistics Overview", icon: BarChart3, description: "Vehicle count and renewal status" },
  quick_actions: { name: "Quick Actions", icon: Zap, description: "Add vehicle, documents, and services" },
  recent_vehicles: { name: "Your Vehicles", icon: Car, description: "List of all your vehicles" },
  news: { name: "News Bits", icon: Newspaper, description: "Latest automotive news and updates" },
  reminders: { name: "Reminders", icon: Clock, description: "Important renewal notifications" },
};

export default function DashboardCustomize() {
  const queryClient = useQueryClient();

  // Get widgets for user (hardcoded to user ID 1 for demo)
  const { data: widgets = [], isLoading } = useQuery<DashboardWidget[]>({
    queryKey: ["/api/dashboard/widgets/1"],
  });

  const updateWidgetMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<DashboardWidget> }) => {
      return apiRequest("PATCH", `/api/dashboard/widgets/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/widgets/1"] });
      toast({
        title: "Widget Updated",
        description: "Dashboard widget settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update widget settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleVisibility = (widgetId: number, isVisible: boolean) => {
    updateWidgetMutation.mutate({
      id: widgetId,
      updates: { isVisible: !isVisible }
    });
  };

  const updateSize = (widgetId: number, size: string) => {
    updateWidgetMutation.mutate({
      id: widgetId,
      updates: { size }
    });
  };

  const updatePosition = (widgetId: number, newPosition: number) => {
    updateWidgetMutation.mutate({
      id: widgetId,
      updates: { position: newPosition }
    });
  };

  const sortedWidgets = [...widgets].sort((a, b) => a.position - b.position);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white header-gradient-border shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-red-50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 flex-1">
            <ColorfulLogo />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Customize Dashboard</h1>
              <p className="text-sm text-red-600">Personalize your experience</p>
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

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Instructions Card */}
        <Card className="shadow-orange">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-orange-600" />
              <span>Dashboard Layout</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Customize your dashboard by showing/hiding widgets, changing their size, and reordering them to match your preferences.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Show/Hide</Badge>
              <Badge variant="outline">Resize</Badge>
              <Badge variant="outline">Reorder</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Widget Configuration */}
        <div className="space-y-4">
          {sortedWidgets.map((widget, index) => {
            const WidgetIcon = WIDGET_TYPES[widget.widgetType as keyof typeof WIDGET_TYPES]?.icon || Settings;
            const widgetInfo = WIDGET_TYPES[widget.widgetType as keyof typeof WIDGET_TYPES];
            
            return (
              <Card key={widget.id} className={`shadow-orange transition-all duration-200 ${widget.isVisible ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300 opacity-70'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 flex-1">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <WidgetIcon className={`w-5 h-5 ${widget.isVisible ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{widgetInfo?.name || widget.widgetType}</h3>
                        <p className="text-xs text-gray-500">{widgetInfo?.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Size Selector */}
                      <Select
                        value={widget.size}
                        onValueChange={(value) => updateSize(widget.id, value)}
                        disabled={!widget.isVisible}
                      >
                        <SelectTrigger className="w-20 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Visibility Toggle */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={widget.isVisible}
                          onCheckedChange={() => toggleVisibility(widget.id, widget.isVisible)}
                        />
                        {widget.isVisible ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Position Controls */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Position:</span>
                      <Badge variant="secondary" className="text-xs">
                        #{widget.position + 1}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => updatePosition(widget.id, Math.max(0, widget.position - 1))}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => updatePosition(widget.id, widget.position + 1)}
                        disabled={index === sortedWidgets.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Preview Button */}
        <Card className="shadow-orange">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <h3 className="font-medium text-gray-800">Preview Your Changes</h3>
              <p className="text-sm text-gray-600">
                Return to dashboard to see your customized layout in action.
              </p>
              <Link href="/dashboard">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}