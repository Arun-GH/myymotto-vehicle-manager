import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Phone, Shield, Wrench, Settings, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertEmergencyContactSchema, type InsertEmergencyContact, type EmergencyContact } from "@shared/schema";
import ColorfulLogo from "@/components/colorful-logo";
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
        <header className="gradient-warm text-white shadow-lg sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="bg-white/20 p-1 rounded-xl">
                <img 
                  src={logoImage} 
                  alt="Myymotto Logo" 
                  className="w-8 h-8 rounded-lg"
                />
              </div>
              <div>
                <ColorfulLogo className="text-xl font-semibold" />
                <p className="text-xs text-white/80">Emergency Contacts</p>
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
      <header className="gradient-warm text-white shadow-lg sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="bg-white/20 p-1 rounded-xl">
                <img 
                  src={logoImage} 
                  alt="Myymotto Logo" 
                  className="w-8 h-8 rounded-lg"
                />
              </div>
              <div>
                <ColorfulLogo className="text-xl font-semibold" />
                <p className="text-xs text-white/80">Emergency Contacts</p>
              </div>
            </div>
            {hasContacts && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        {!isEditing && hasContacts ? (
          // Display Mode
          <div className="space-y-4">
            {/* Emergency Contact */}
            {(contacts.emergencyName || contacts.emergencyPhone) && (
              <Card className="shadow-orange">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Emergency Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contacts.emergencyName && (
                    <div className="mb-2">
                      <label className="text-sm text-muted-foreground">Name</label>
                      <p className="font-medium">{contacts.emergencyName}</p>
                    </div>
                  )}
                  {contacts.emergencyPhone && (
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="font-medium flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${contacts.emergencyPhone}`} className="text-blue-600">
                          {contacts.emergencyPhone}
                        </a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Insurance Company */}
            {(contacts.insuranceName || contacts.insurancePhone) && (
              <Card className="shadow-orange">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-blue-600">
                    <Shield className="w-5 h-5" />
                    <span>Insurance Company</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contacts.insuranceName && (
                    <div className="mb-2">
                      <label className="text-sm text-muted-foreground">Company Name</label>
                      <p className="font-medium">{contacts.insuranceName}</p>
                    </div>
                  )}
                  {contacts.insurancePhone && (
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="font-medium flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${contacts.insurancePhone}`} className="text-blue-600">
                          {contacts.insurancePhone}
                        </a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Roadside Assistance */}
            {contacts.roadsidePhone && (
              <Card className="shadow-orange">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-yellow-600">
                    <Settings className="w-5 h-5" />
                    <span>Roadside Assistance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${contacts.roadsidePhone}`} className="text-blue-600">
                        {contacts.roadsidePhone}
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Centre */}
            {(contacts.serviceCentreName || contacts.serviceCentrePhone) && (
              <Card className="shadow-orange">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-green-600">
                    <Wrench className="w-5 h-5" />
                    <span>Service Centre</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contacts.serviceCentreName && (
                    <div className="mb-2">
                      <label className="text-sm text-muted-foreground">Centre Name</label>
                      <p className="font-medium">{contacts.serviceCentreName}</p>
                    </div>
                  )}
                  {contacts.serviceCentrePhone && (
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="font-medium flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${contacts.serviceCentrePhone}`} className="text-blue-600">
                          {contacts.serviceCentrePhone}
                        </a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Spare Parts Provider */}
            {(contacts.sparePartsName || contacts.sparePartsPhone) && (
              <Card className="shadow-orange">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-purple-600">
                    <Settings className="w-5 h-5" />
                    <span>Spare Parts Provider</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contacts.sparePartsName && (
                    <div className="mb-2">
                      <label className="text-sm text-muted-foreground">Provider Name</label>
                      <p className="font-medium">{contacts.sparePartsName}</p>
                    </div>
                  )}
                  {contacts.sparePartsPhone && (
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="font-medium flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${contacts.sparePartsPhone}`} className="text-blue-600">
                          {contacts.sparePartsPhone}
                        </a>
                      </p>
                    </div>
                  )}
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
    </div>
  );
}