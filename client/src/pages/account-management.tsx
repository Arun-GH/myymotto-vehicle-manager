import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Calendar, Download, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
// ColorfulLogo component inline since import is not working
const ColorfulLogo = () => (
  <span className="font-bold">
    <span className="text-red-600">My</span>
    <span className="text-blue-600">y</span>
    <span className="text-green-600">mo</span>
    <span className="text-orange-600">t</span>
    <span className="text-purple-600">to</span>
  </span>
);
import logoImage from "@assets/Mymotto_Logo_Green_Revised_1752603344750.png";
import type { Subscription, PaymentHistory } from "@shared/schema";

interface AccountInfo {
  accountCreatedDate: string;
  subscription: Subscription | null;
  paymentHistory: PaymentHistory[];
  isSubscriptionExpired: boolean;
  daysUntilExpiry: number;
}

export default function AccountManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: accountInfo, isLoading } = useQuery<AccountInfo>({
    queryKey: ["/api/account-info"],
    retry: false,
  });

  const renewSubscription = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/subscription/renew");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/account-info"] });
      toast({
        title: "Subscription Renewed",
        description: "Your subscription has been successfully renewed for another year.",
      });
    },
    onError: (error) => {
      toast({
        title: "Renewal Failed",
        description: error.message || "Failed to renew subscription",
        variant: "destructive",
      });
    },
  });

  const downloadInvoice = async (paymentId: string, invoicePath: string) => {
    try {
      const response = await fetch(`/api/invoice/download/${paymentId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${paymentId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to download invoice');
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${(amount / 100).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getSubscriptionStatus = () => {
    if (!accountInfo?.subscription) {
      return {
        status: "No Subscription",
        color: "bg-gray-500",
        textColor: "text-gray-600",
        icon: XCircle
      };
    }

    if (accountInfo.isSubscriptionExpired) {
      return {
        status: "Expired",
        color: "bg-red-500",
        textColor: "text-red-600",
        icon: XCircle
      };
    }

    if (accountInfo.daysUntilExpiry <= 7) {
      return {
        status: "Expiring Soon",
        color: "bg-orange-500",
        textColor: "text-orange-600",
        icon: AlertTriangle
      };
    }

    return {
      status: "Active",
      color: "bg-green-500",
      textColor: "text-green-600",
      icon: CheckCircle
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading account information...</p>
        </div>
      </div>
    );
  }

  const subscriptionStatus = getSubscriptionStatus();
  const StatusIcon = subscriptionStatus.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="header-gradient-border sticky top-0 z-10 bg-white px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/")}
              className="text-gray-600 hover:bg-red-50 h-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img 
              src={logoImage} 
              alt="Myymotto Logo" 
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <div className="text-sm font-bold">
                <ColorfulLogo />
              </div>
              <p className="text-xs text-red-600">Account Management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 pb-20 bg-warm-pattern space-y-3">
        {/* Account Overview */}
        <Card className="shadow-orange border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Account Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Account Created</span>
              <span className="text-sm font-medium">
                {accountInfo?.accountCreatedDate ? formatDate(accountInfo.accountCreatedDate) : 'N/A'}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subscription Status</span>
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${subscriptionStatus.textColor}`} />
                <Badge className={`${subscriptionStatus.color} text-white text-xs`}>
                  {subscriptionStatus.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Details */}
        {accountInfo?.subscription && (
          <Card className="shadow-orange border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Started</span>
                  <p className="font-medium">{formatDate(accountInfo.subscription.subscriptionDate)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Expires</span>
                  <p className="font-medium">{formatDate(accountInfo.subscription.expiryDate)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Type</span>
                  <p className="font-medium capitalize">{accountInfo.subscription.subscriptionType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Amount</span>
                  <p className="font-medium">{formatAmount(accountInfo.subscription.amount)}/year</p>
                </div>
              </div>

              {(accountInfo.isSubscriptionExpired || accountInfo.daysUntilExpiry <= 30) && (
                <>
                  <Separator />
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">
                        {accountInfo.isSubscriptionExpired ? 'Subscription Expired' : 'Expiring Soon'}
                      </span>
                    </div>
                    <p className="text-xs text-orange-700 mb-3">
                      {accountInfo.isSubscriptionExpired 
                        ? 'Your subscription has expired. Renew now to continue using premium features.'
                        : `Your subscription expires in ${accountInfo.daysUntilExpiry} days. Renew now to avoid service interruption.`
                      }
                    </p>
                    <Button 
                      onClick={() => renewSubscription.mutate()}
                      disabled={renewSubscription.isPending}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-8 text-sm"
                    >
                      {renewSubscription.isPending ? (
                        <>
                          <Clock className="w-3 h-3 mr-2 animate-spin" />
                          Renewing...
                        </>
                      ) : (
                        'Renew Subscription'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card className="shadow-orange border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                Payment History
              </div>
              <Badge variant="secondary" className="text-xs">
                {accountInfo?.paymentHistory?.length || 0} transactions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountInfo?.paymentHistory && accountInfo.paymentHistory.length > 0 ? (
              <div className="space-y-2">
                {accountInfo.paymentHistory.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{formatAmount(payment.amount)}</span>
                          <Badge 
                            className={`text-xs ${
                              payment.paymentStatus === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : payment.paymentStatus === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {payment.paymentStatus}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Date: {formatDate(payment.paymentDate)}</p>
                          <p>Transaction ID: {payment.transactionId || payment.razorpayPaymentId}</p>
                          {payment.paymentMethod && (
                            <p>Method: {payment.paymentMethod.toUpperCase()}</p>
                          )}
                        </div>
                      </div>
                      {payment.invoiceGenerated && payment.invoicePath && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadInvoice(payment.id.toString(), payment.invoicePath!)}
                          className="h-8 text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No payment history found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* No Subscription Call to Action */}
        {!accountInfo?.subscription && (
          <Card className="shadow-orange border-l-4 border-l-orange-500">
            <CardContent className="text-center py-6">
              <Calendar className="w-12 h-12 text-orange-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold mb-2">Start Your Premium Journey</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get unlimited vehicle management with premium features for just ₹100/year
              </p>
              <Button 
                onClick={() => renewSubscription.mutate()}
                disabled={renewSubscription.isPending}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-8 text-sm"
              >
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}