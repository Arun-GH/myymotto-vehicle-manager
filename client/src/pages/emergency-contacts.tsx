import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Phone, Shield, Wrench, Settings, AlertTriangle, Users, Package, Share2, Send, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertEmergencyContactSchema, type InsertEmergencyContact, type EmergencyContact } from "@shared/schema";
import ColorfulLogo from "@/components/colorful-logo";
import BottomNav from "@/components/bottom-nav";
import NotificationBell from "@/components/notification-bell";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function EmergencyContacts() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user ID from localStorage
  const currentUserId = parseInt(localStorage.getItem("currentUserId") || "1");

  // Fetch emergency contacts
  const { data: contacts, isLoading } = useQuery<EmergencyContact>({
    queryKey: ["/api/emergency-contacts", currentUserId],
    queryFn: async () => {
      const response = await fetch(`/api/emergency-contacts/${currentUserId}`);
      if (!response.ok) throw new Error("Failed to fetch emergency contacts");
      return response.json();
    },
  });

  const form = useForm<InsertEmergencyContact>({
    resolver: zodResolver(insertEmergencyContactSchema),
    defaultValues: {
      emergencyName: "",
      emergencyPhone: "",
      insuranceName: "",
      insurancePhone: "",
      roadsidePhone: "",
      serviceCentreName: "",
      serviceCentrePhone: "",
      sparePartsName: "",
      sparePartsPhone: "",
    },
  });

  // Update form when contacts data loads
  useEffect(() => {
    if (contacts && Object.keys(contacts).length > 0) {
      form.reset({
        emergencyName: contacts.emergencyName || "",
        emergencyPhone: contacts.emergencyPhone || "",
        insuranceName: contacts.insuranceName || "",
        insurancePhone: contacts.insurancePhone || "",
        roadsidePhone: contacts.roadsidePhone || "",
        serviceCentreName: contacts.serviceCentreName || "",
        serviceCentrePhone: contacts.serviceCentrePhone || "",
        sparePartsName: contacts.sparePartsName || "",
        sparePartsPhone: contacts.sparePartsPhone || "",
      });
    }
  }, [contacts, form]);

  const createContactsMutation = useMutation({
    mutationFn: async (data: InsertEmergencyContact) => {
      const response = await apiRequest("POST", `/api/emergency-contacts/${currentUserId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts", currentUserId] });
      toast({
        title: "Emergency Contacts Saved",
        description: "Your emergency contacts have been successfully saved.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save emergency contacts",
        variant: "destructive",
      });
    },
  });

  const updateContactsMutation = useMutation({
    mutationFn: async (data: InsertEmergencyContact) => {
      const response = await apiRequest("PUT", `/api/emergency-contacts/${currentUserId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts", currentUserId] });
      toast({
        title: "Emergency Contacts Updated",
        description: "Your emergency contacts have been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update emergency contacts",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertEmergencyContact) => {
    if (contacts && Object.keys(contacts).length > 0) {
      updateContactsMutation.mutate(data);
    } else {
      createContactsMutation.mutate(data);
    }
  };

  const hasContacts = contacts && Object.keys(contacts).length > 0;

  // Generate emergency contact sharing message
  const generateShareMessage = () => {
    if (!contacts) return "";
    
    let message = "🚨 EMERGENCY CONTACTS - MyyMotto User\n\n";
    
    if (contacts.emergencyName || contacts.emergencyPhone) {
      message += `🆘 Emergency Contact:\n`;
      if (contacts.emergencyName) message += `Name: ${contacts.emergencyName}\n`;
      if (contacts.emergencyPhone) message += `Phone: ${contacts.emergencyPhone}\n\n`;
    }
    
    if (contacts.insuranceName || contacts.insurancePhone) {
      message += `🛡️ Insurance Company:\n`;
      if (contacts.insuranceName) message += `Company: ${contacts.insuranceName}\n`;
      if (contacts.insurancePhone) message += `Phone: ${contacts.insurancePhone}\n\n`;
    }
    
    if (contacts.roadsidePhone) {
      message += `🚗 Roadside Assistance:\n`;
      message += `Phone: ${contacts.roadsidePhone}\n\n`;
    }
    
    if (contacts.serviceCentreName || contacts.serviceCentrePhone) {
      message += `🔧 Service Centre:\n`;
      if (contacts.serviceCentreName) message += `Name: ${contacts.serviceCentreName}\n`;
      if (contacts.serviceCentrePhone) message += `Phone: ${contacts.serviceCentrePhone}\n\n`;
    }
    
    if (contacts.sparePartsName || contacts.sparePartsPhone) {
      message += `🔩 Spare Parts:\n`;
      if (contacts.sparePartsName) message += `Name: ${contacts.sparePartsName}\n`;
      if (contacts.sparePartsPhone) message += `Phone: ${contacts.sparePartsPhone}\n\n`;
    }
    
    message += "---\nShared via MyyMotto - Vehicle Management App";
    return message;
  };

  // Share emergency contacts using Web Share API or fallback
  const handleShareContacts = async () => {
    const shareMessage = generateShareMessage();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Emergency Contacts - MyyMotto",
          text: shareMessage,
        });
        toast({
          title: "Shared Successfully",
          description: "Emergency contacts shared successfully",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback to copy to clipboard
          handleCopyToClipboard(shareMessage);
        }
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyToClipboard(shareMessage);
    }
  };

  // Copy emergency contacts to clipboard
  const handleCopyToClipboard = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "Copied to Clipboard",
        description: "Emergency contacts copied. You can now paste and share via any app.",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Share via SMS
  const handleShareViaSMS = () => {
    const shareMessage = generateShareMessage();
    const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
    window.open(smsUrl, '_blank');
    toast({
      title: "SMS Ready",
      description: "SMS app opened with emergency contacts ready to send",
    });
  };

  // Share via WhatsApp
  const handleShareViaWhatsApp = () => {
    const shareMessage = generateShareMessage();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
    toast({
      title: "WhatsApp Ready", 
      description: "WhatsApp opened with emergency contacts ready to send",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="header-gradient-border shadow-lg relative z-10">
          <div className="px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-red-50 p-1"
                  onClick={() => setLocation("/")}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <img 
                  src={logoImage} 
                  alt="Myymotto Logo" 
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
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:bg-red-50 p-1"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
                <NotificationBell />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 pb-20 bg-warm-pattern">
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading emergency contacts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient-border shadow-lg relative z-10">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-red-50 p-1"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
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
              {hasContacts && !isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:bg-green-50 p-1 font-medium"
                    onClick={handleShareContacts}
                    title="One-tap emergency contact sharing"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:bg-red-50 p-1"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                </>
              )}
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-red-50 p-1"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 pb-20 bg-warm-pattern">
        {!isEditing && hasContacts ? (
          // Display Mode - Compact Tiles
          <div className="grid grid-cols-1 gap-3">
            {/* One-Tap Emergency Share Card */}
            <Card className="shadow-orange border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Share2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-green-800 text-sm mb-2">Emergency Contact Sharing</h3>
                  <p className="text-xs text-green-700 mb-4 leading-relaxed">
                    Share all your emergency contacts instantly in case of accidents or emergencies
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleShareContacts}
                      className="h-9 text-xs bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Quick Share
                    </Button>
                    <Button
                      onClick={() => setIsSharing(true)}
                      variant="outline"
                      className="h-9 text-xs border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      More Options
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Emergency Contact */}
            {(contacts.emergencyName || contacts.emergencyPhone) && (
              <Card className="shadow-orange border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">Emergency Contact</h3>
                        {contacts.emergencyName && (
                          <p className="text-xs text-gray-600">{contacts.emergencyName}</p>
                        )}
                      </div>
                    </div>
                    {contacts.emergencyPhone && (
                      <a href={`tel:${contacts.emergencyPhone}`} 
                         className="flex items-center space-x-1 bg-red-50 px-3 py-1 rounded-full text-red-600 hover:bg-red-100 transition-colors">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs font-medium">{contacts.emergencyPhone}</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insurance Company */}
            {(contacts.insuranceName || contacts.insurancePhone) && (
              <Card className="shadow-orange border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">Insurance Company</h3>
                        {contacts.insuranceName && (
                          <p className="text-xs text-gray-600">{contacts.insuranceName}</p>
                        )}
                      </div>
                    </div>
                    {contacts.insurancePhone && (
                      <a href={`tel:${contacts.insurancePhone}`} 
                         className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs font-medium">{contacts.insurancePhone}</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Roadside Assistance */}
            {contacts.roadsidePhone && (
              <Card className="shadow-orange border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Settings className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">Roadside Assistance</h3>
                        <p className="text-xs text-gray-600">24/7 Emergency Help</p>
                      </div>
                    </div>
                    <a href={`tel:${contacts.roadsidePhone}`} 
                       className="flex items-center space-x-1 bg-orange-50 px-3 py-1 rounded-full text-orange-600 hover:bg-orange-100 transition-colors">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs font-medium">{contacts.roadsidePhone}</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Centre */}
            {(contacts.serviceCentreName || contacts.serviceCentrePhone) && (
              <Card className="shadow-orange border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">Service Centre</h3>
                        {contacts.serviceCentreName && (
                          <p className="text-xs text-gray-600">{contacts.serviceCentreName}</p>
                        )}
                      </div>
                    </div>
                    {contacts.serviceCentrePhone && (
                      <a href={`tel:${contacts.serviceCentrePhone}`} 
                         className="flex items-center space-x-1 bg-green-50 px-3 py-1 rounded-full text-green-600 hover:bg-green-100 transition-colors">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs font-medium">{contacts.serviceCentrePhone}</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Spare Parts Provider */}
            {(contacts.sparePartsName || contacts.sparePartsPhone) && (
              <Card className="shadow-orange border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">Spare Parts Provider</h3>
                        {contacts.sparePartsName && (
                          <p className="text-xs text-gray-600">{contacts.sparePartsName}</p>
                        )}
                      </div>
                    </div>
                    {contacts.sparePartsPhone && (
                      <a href={`tel:${contacts.sparePartsPhone}`} 
                         className="flex items-center space-x-1 bg-purple-50 px-3 py-1 rounded-full text-purple-600 hover:bg-purple-100 transition-colors">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs font-medium">{contacts.sparePartsPhone}</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Edit/Create Mode
          <Card className="shadow-orange">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Users className="w-5 h-5" />
                <span>{hasContacts ? "Edit Emergency Contacts" : "Add Emergency Contacts"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  
                  {/* Emergency Contact Section */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-red-600 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Emergency Contact</span>
                    </h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="emergencyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Emergency contact name" 
                                {...field}
                                className="h-10"
                                onChange={(e) => {
                                  // Remove numbers and special characters, allow only letters and spaces
                                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                  field.onChange(value.toUpperCase());
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., +91 9876543210" 
                                {...field}
                                className="h-10"
                                type="tel"
                                onChange={(e) => {
                                  // Allow only numbers, +, -, spaces, and parentheses
                                  const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Insurance Company Section */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-blue-600 flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Insurance Company</span>
                    </h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="insuranceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Company Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Insurance company name" 
                                {...field}
                                className="h-10"
                                onChange={(e) => {
                                  // Remove numbers and special characters, allow only letters and spaces
                                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                  field.onChange(value.toUpperCase());
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="insurancePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., 1800-XXX-XXXX" 
                                {...field}
                                className="h-10"
                                type="tel"
                                onChange={(e) => {
                                  // Allow only numbers, +, -, spaces, and parentheses
                                  const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Roadside Assistance Section */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-orange-600 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Roadside Assistance</span>
                    </h3>
                    <FormField
                      control={form.control}
                      name="roadsidePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 1800-XXX-XXXX" 
                              {...field}
                              className="h-10"
                              type="tel"
                              onChange={(e) => {
                                // Allow only numbers, +, -, spaces, and parentheses
                                const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Service Centre Section */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-green-600 flex items-center space-x-2">
                      <Wrench className="w-4 h-4" />
                      <span>Service Centre</span>
                    </h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="serviceCentreName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Centre Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Service centre name" 
                                {...field}
                                className="h-10"
                                onChange={(e) => {
                                  // Remove numbers and special characters, allow only letters and spaces
                                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                  field.onChange(value.toUpperCase());
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="serviceCentrePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., +91 9876543210" 
                                {...field}
                                className="h-10"
                                type="tel"
                                onChange={(e) => {
                                  // Allow only numbers, +, -, spaces, and parentheses
                                  const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Spare Parts Provider Section */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-purple-600 flex items-center space-x-2">
                      <Package className="w-4 h-4" />
                      <span>Spare Parts Provider</span>
                    </h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="sparePartsName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Provider Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Spare parts provider name" 
                                {...field}
                                className="h-10"
                                onChange={(e) => {
                                  // Remove numbers and special characters, allow only letters and spaces
                                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                  field.onChange(value.toUpperCase());
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sparePartsPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., +91 9876543210" 
                                {...field}
                                className="h-10"
                                type="tel"
                                onChange={(e) => {
                                  // Allow only numbers, +, -, spaces, and parentheses
                                  const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col space-y-2 pt-3">
                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={createContactsMutation.isPending || updateContactsMutation.isPending}
                    >
                      {createContactsMutation.isPending || updateContactsMutation.isPending
                        ? "Saving..."
                        : hasContacts ? "Update Contacts" : "Save Contacts"}
                    </Button>
                    {hasContacts && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10"
                        onClick={() => setIsEditing(false)}
                        disabled={createContactsMutation.isPending || updateContactsMutation.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Add Emergency Contacts for first time */}
        {!hasContacts && !isEditing && (
          <Card className="shadow-orange">
            <CardContent className="p-6 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Emergency Contacts</h3>
              <p className="text-gray-600 mb-6">
                Keep your important contacts handy for emergencies and vehicle-related services.
              </p>
              <Button onClick={() => setIsEditing(true)} className="w-full">
                Add Emergency Contacts
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Share Options Dialog */}
      <Dialog open={isSharing} onOpenChange={setIsSharing}>
        <DialogContent className="w-[90%] max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-gray-800">
              Share Emergency Contacts
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 p-4">
            <Button
              onClick={handleShareContacts}
              className="h-12 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2"
            >
              <Share2 className="w-5 h-5" />
              <span>Share via System (Recommended)</span>
            </Button>
            
            <Button
              onClick={handleShareViaWhatsApp}
              className="h-12 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Share via WhatsApp</span>
            </Button>
            
            <Button
              onClick={handleShareViaSMS}
              className="h-12 bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Share via SMS</span>
            </Button>
            
            <Button
              onClick={() => handleCopyToClipboard(generateShareMessage())}
              variant="outline"
              className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2"
            >
              <Copy className="w-5 h-5" />
              <span>Copy to Clipboard</span>
            </Button>
            
            <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800 text-center leading-relaxed">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Share your emergency contacts with trusted friends, family, or colleagues for quick access during emergencies.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav currentPath="/emergency-contacts" />
    </div>
  );
}