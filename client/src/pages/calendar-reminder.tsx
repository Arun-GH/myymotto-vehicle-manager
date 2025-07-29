import { useState } from "react";
import { ArrowLeft, Calendar, Clock, Bell, CheckCircle, Plus, Edit, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCalendarReminderSchema, type InsertCalendarReminder, type CalendarReminder } from "@shared/schema";

import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function CalendarReminder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<CalendarReminder | null>(null);

  const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";

  // Fetch existing reminders
  const { data: reminders = [], isLoading } = useQuery<CalendarReminder[]>({
    queryKey: ["/api/calendar-reminders", currentUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/calendar-reminders?userId=${currentUserId}`);
      return response.json();
    },
  });

  const form = useForm<InsertCalendarReminder>({
    resolver: zodResolver(insertCalendarReminderSchema),
    defaultValues: {
      title: "",
      details: "",
      reminderDate: "",
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: InsertCalendarReminder) => {
      return apiRequest("POST", "/api/calendar-reminders", {
        ...data,
        userId: parseInt(currentUserId),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Calendar reminder created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-reminders", currentUserId] });
      setShowCreateForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create reminder",
        variant: "destructive",
      });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      return apiRequest("DELETE", `/api/calendar-reminders/${reminderId}?userId=${currentUserId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Calendar reminder deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-reminders", currentUserId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete reminder",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCalendarReminder) => {
    createReminderMutation.mutate(data);
  };

  const handleDeleteReminder = (reminderId: number) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      deleteReminderMutation.mutate(reminderId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="header-gradient-border shadow-lg">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-1 hover:bg-white/20">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <img 
                src={logoImage} 
                alt="MyyMotto Logo" 
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Timely Care for your carrier</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-md p-3 space-y-4">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            Alert & Reminders
          </h1>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-sm h-8 px-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>

        {/* Existing Reminders List */}
        {isLoading ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 animate-spin mx-auto text-orange-600 mb-2" />
            <p className="text-gray-600">Loading reminders...</p>
          </div>
        ) : reminders.length === 0 && !showCreateForm ? (
          <Card className="shadow-orange">
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reminders Yet</h3>
              <p className="text-gray-600 mb-4">Create your first calendar reminder to stay organized</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Reminder
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className="border-l-4 border-l-orange-500 shadow-orange">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{reminder.title}</h3>
                      {reminder.details && (
                        <p className="text-sm text-gray-600 mb-2">{reminder.details}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <Clock className="w-4 h-4" />
                        {formatDate(reminder.reminderDate)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Form Modal/Card */}
        {showCreateForm && (
          <Card className="border-orange-200 shadow-lg shadow-orange">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  Create New Reminder
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowCreateForm(false);
                    form.reset();
                  }}
                  className="p-1 hover:bg-red-50 text-gray-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter reminder title (e.g., Insurance Renewal)"
                            className="h-8" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Details (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter reminder details (e.g., Renew Honda City insurance with HDFC ERGO)"
                            className="min-h-[80px] text-xs resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reminderDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Reminder Date & Time *</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local"
                            className="h-8"
                            min={new Date().toISOString().slice(0, 16)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 h-8 text-xs"
                      onClick={() => {
                        setShowCreateForm(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-orange-600 hover:bg-orange-700 h-8 text-xs"
                      disabled={createReminderMutation.isPending}
                    >
                      {createReminderMutation.isPending ? (
                        "Creating..."
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Set Reminder
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        {(reminders.length > 0 || showCreateForm) && (
          <Card className="shadow-orange bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-3">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-700 space-y-1">
                  <p className="font-medium">Automatic Notification</p>
                  <p>You'll receive a notification one day before your scheduled reminder date to help you stay on track.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}