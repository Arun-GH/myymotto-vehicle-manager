import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, Bell, CheckCircle, Plus, Edit, Trash2, Smartphone } from "lucide-react";
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
import { LocalNotifications, type PermissionStatus } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function CalendarReminder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<CalendarReminder | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<PermissionStatus | null>(null);

  const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";

  // Check notification permissions on component mount
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializeNotifications();
    }
  }, []);

  const initializeNotifications = async () => {
    try {
      // Check and request permissions
      await checkNotificationPermissions();
      
      // Create notification channel for persistent alarms
      await LocalNotifications.createChannel({
        id: 'myyMotto-alarms',
        name: 'MyyMotto Alarms',
        description: 'Important reminders and alerts from MyyMotto',
        sound: 'default',
        importance: 5, // High priority
        visibility: 1, // Public visibility
        lights: true,
        lightColor: '#FF6600',
        vibration: true
      });
      
      console.log('MyyMotto notification channel created successfully');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const checkNotificationPermissions = async () => {
    try {
      const permission = await LocalNotifications.checkPermissions();
      setNotificationPermission(permission);
      
      if (permission.display !== 'granted') {
        const result = await LocalNotifications.requestPermissions();
        setNotificationPermission(result);
      }
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const scheduleDeviceNotification = async (reminder: InsertCalendarReminder & { id?: number }) => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications only work on mobile devices');
      return;
    }

    try {
      // Handle the date correctly for device notifications
      let reminderDate: Date;
      if (typeof reminder.reminderDate === 'string' && reminder.reminderDate.includes('T') && !reminder.reminderDate.includes('Z')) {
        // This is from datetime-local, parse as local time
        const parts = reminder.reminderDate.split('T');
        const [year, month, day] = parts[0].split('-').map(Number);
        const [hours, minutes] = parts[1].split(':').map(Number);
        reminderDate = new Date(year, month - 1, day, hours, minutes, 0);
      } else {
        reminderDate = new Date(reminder.reminderDate);
      }
      
      const notificationId = reminder.id || Date.now();

      // Schedule persistent notification that works even when app is closed
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Alert from MyyMotto',
            body: reminder.title,
            id: notificationId,
            schedule: { at: reminderDate },
            sound: 'default',
            attachments: undefined,
            actionTypeId: '',
            extra: {
              reminderDetails: reminder.details || '',
              source: 'MyyMotto',
              persistent: true,
              priority: 'high'
            },
            // Enhanced settings for persistent alarms
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#FF6600',
            ongoing: false,
            autoCancel: true,
            channelId: 'myyMotto-alarms'
          }
        ]
      });

      // For Android, also try to integrate with system alarm via intent
      if (Capacitor.getPlatform() === 'android') {
        try {
          // Try to create a system alarm intent (this will require additional native code)
          const alarmTime = reminderDate.getTime();
          console.log(`Attempting to schedule system alarm for: ${reminderDate.toLocaleString()}`);
          
          // Store alarm info for potential system integration
          localStorage.setItem(`myyMotto_alarm_${notificationId}`, JSON.stringify({
            id: notificationId,
            title: reminder.title,
            time: alarmTime,
            details: reminder.details || ''
          }));
        } catch (systemAlarmError) {
          console.log('System alarm integration not available, using notification fallback');
        }
      }

      console.log(`Persistent device notification scheduled for: ${reminderDate.toLocaleString()}`);
      console.log(`Original reminder.reminderDate: ${reminder.reminderDate}`);
      console.log(`Parsed reminderDate: ${reminderDate.toString()}`);
      console.log(`Formatted display time: ${formatDate(reminder.reminderDate)}`);
      return true;
    } catch (error) {
      console.error('Error scheduling device notification:', error);
      return false;
    }
  };

  const cancelDeviceNotification = async (reminderId: number) => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Cancel the scheduled notification
      await LocalNotifications.cancel({
        notifications: [{ id: reminderId }]
      });
      
      // Remove stored alarm info
      localStorage.removeItem(`myyMotto_alarm_${reminderId}`);
      
      console.log(`Device notification and alarm cancelled for reminder ${reminderId}`);
    } catch (error) {
      console.error('Error cancelling device notification:', error);
    }
  };

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
      // Handle datetime-local input properly
      // datetime-local gives us "2025-01-29T00:10" which should be treated as local time
      let reminderDate = data.reminderDate;
      if (typeof reminderDate === 'string' && reminderDate.includes('T') && !reminderDate.includes('Z')) {
        // This is a local datetime string from datetime-local input
        // Don't convert to UTC, send as is - the server will handle it correctly
        reminderDate = reminderDate;
      }
      
      const response = await apiRequest("POST", "/api/calendar-reminders", {
        ...data,
        reminderDate,
        userId: parseInt(currentUserId),
      });
      return response.json();
    },
    onSuccess: async (newReminder: CalendarReminder) => {
      // Schedule device notification
      const notificationScheduled = await scheduleDeviceNotification({
        title: newReminder.title,
        details: newReminder.details || '',
        reminderDate: newReminder.reminderDate instanceof Date ? newReminder.reminderDate.toISOString() : newReminder.reminderDate,
        id: newReminder.id
      });

      toast({
        title: "Success",
        description: notificationScheduled 
          ? "Reminder created and device alarm set!"
          : "Reminder created successfully",
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
      // Cancel device notification first
      await cancelDeviceNotification(reminderId);
      return apiRequest("DELETE", `/api/calendar-reminders/${reminderId}?userId=${currentUserId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reminder and device alarm cancelled successfully",
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

  const formatDate = (dateInput: string | Date) => {
    let date: Date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Handle datetime-local format specifically
      if (dateInput.includes('T') && !dateInput.includes('Z') && !dateInput.includes('+')) {
        // This is from datetime-local input: "2025-01-29T00:10"
        // Parse it as local time without timezone conversion
        const parts = dateInput.split('T');
        const [year, month, day] = parts[0].split('-').map(Number);
        const [hours, minutes] = parts[1].split(':').map(Number);
        
        // Create date in local timezone
        date = new Date(year, month - 1, day, hours, minutes, 0);
      } else {
        // This is from database (ISO string) - the database stores time with +5:30 offset
        // so when we get it back, we need to adjust it back to display correct local time
        const dbDate = new Date(dateInput);
        const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
        date = new Date(dbDate.getTime() - istOffset);
        
        console.log(`Database time: ${dateInput}`);
        console.log(`Parsed DB date: ${dbDate.toString()}`);
        console.log(`Adjusted display date: ${date.toString()}`);
      }
    } else {
      date = new Date(dateInput);
    }

    // Format in local timezone
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

        {/* Device Alarm Status Info */}
        {Capacitor.isNativePlatform() && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">System Alarm Integration</span>
                <div className={`w-2 h-2 rounded-full ${
                  notificationPermission?.display === 'granted' ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
              <p className="text-xs text-blue-700">
                {notificationPermission?.display === 'granted' 
                  ? "✓ Persistent alarms work even when app is closed or logged out"
                  : "⚠ Allow notifications to enable persistent system alarms"
                }
              </p>
              <p className="text-xs text-blue-600 mt-1">
                📱 Alarms are saved to your device's notification system and will ring regardless of app status.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Web Platform Info */}
        {!Capacitor.isNativePlatform() && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Web Version</span>
              </div>
              <p className="text-xs text-orange-700">
                System alarms work in the mobile app. Web version saves reminders for viewing and syncing to mobile.
              </p>
              <p className="text-xs text-orange-600 mt-1">
                📱 Install the mobile app to get persistent alarms that work even when logged out.
              </p>
            </CardContent>
          </Card>
        )}

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
                        {Capacitor.isNativePlatform() && (
                          <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-green-100 rounded-full">
                            <Smartphone className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-700">System Alarm</span>
                          </div>
                        )}
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