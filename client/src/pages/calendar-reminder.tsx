import { useState } from "react";
import { ArrowLeft, Calendar, Clock, Bell, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCalendarReminderSchema, type InsertCalendarReminder } from "@shared/schema";

import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function CalendarReminder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId") || "1";
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
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create reminder",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCalendarReminder) => {
    createReminderMutation.mutate(data);
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
                alt="Myymotto Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <div>
                <div className="text-base font-bold">
                  <ColorfulLogo />
                </div>
                <p className="text-xs text-red-600">Timely Care For Your Carrier</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-md p-3 space-y-4">
        {/* Page Title */}
        <Card className="shadow-orange">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-gray-800 text-sm">
              <Bell className="w-4 h-4 text-orange-600" />
              <span>Set Calendar Reminder</span>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Reminder Form */}
        <Card className="shadow-orange">
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
                      <FormLabel className="text-xs font-medium">Details *</FormLabel>
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
                          min={new Date().toISOString().slice(0, 16)} // Prevent past dates
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2 pt-2">
                  <Link href="/" className="flex-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </Link>
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

        {/* Information Card */}
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
      </main>
    </div>
  );
}