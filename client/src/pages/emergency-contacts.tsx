import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Phone, Shield, Wrench, Settings, AlertTriangle, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="header-gradient-border border-4 border-red-500 shadow-lg relative z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-red-50"
                  onClick={() => setLocation("/")}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <img 
                  src={logoImage} 
                  alt="Myymotto Logo" 
                  className="w-14 h-14 rounded-lg"
                />
                <div>
                  <ColorfulLogo />
                  <p className="text-sm text-red-600">Emergency Contacts</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-red-50"
                >
                  <Settings className="w-6 h-6" />
                </Button>
              </Link>
              <NotificationBell />
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
      <header className="header-gradient-border border-4 border-red-500 shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-red-50"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-14 h-14 rounded-lg"
              />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">Emergency Contacts</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasContacts && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-red-50"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-red-50"
                >
                  <Settings className="w-6 h-6" />
                </Button>
              </Link>
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        {!isEditing && hasContacts ? (
          // Display Mode - Compact Tiles
          <div className="grid grid-cols-1 gap-3">
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
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{hasContacts ? "Edit Emergency Contacts" : "Add Emergency Contacts"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Emergency Contact Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600 flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Emergency Contact</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Emergency contact name" {...field} />
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Emergency contact phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Insurance Company Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-600 flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Insurance Company</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="insuranceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Insurance company name" {...field} />
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Insurance company phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Roadside Assistance Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-600 flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Roadside Assistance</span>
                    </h3>
                    <FormField
                      control={form.control}
                      name="roadsidePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Roadside assistance phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Service Centre Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600 flex items-center space-x-2">
                      <Wrench className="w-5 h-5" />
                      <span>Service Centre</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="serviceCentreName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Centre Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Service centre name" {...field} />
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Service centre phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Spare Parts Provider Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-600 flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Spare Parts Provider</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sparePartsName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Spare parts provider name" {...field} />
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Spare parts provider phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
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

      <BottomNav currentPath="/emergency-contacts" />
    </div>
  );
}