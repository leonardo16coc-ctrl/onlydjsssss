import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  Download, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getLoginUrl } from "@/const";

export default function Subscription() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  // Get subscription details
  const { data: details, isLoading, refetch } = trpc.subscriptions.getDetails.useQuery();
  const { data: paymentHistory } = trpc.subscriptions.getPaymentHistory.useQuery({ limit: 10 });

  // Mutations
  const cancelMutation = trpc.subscriptions.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success(t('subscription.cancelSuccess'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t('subscription.cancelError'));
    },
  });

  const reactivateMutation = trpc.subscriptions.reactivateSubscription.useMutation({
    onSuccess: () => {
      toast.success(t('subscription.reactivateSuccess'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t('subscription.reactivateError'));
    },
  });

  const portalMutation = trpc.subscriptions.createPortalSession.useMutation({
    onSuccess: (data) => {
      window.open(data.url, '_blank');
    },
    onError: (error) => {
      toast.error(error.message || t('subscription.portalError'));
    },
  });

  const handleCancel = () => {
    cancelMutation.mutate();
  };

  const handleReactivate = () => {
    reactivateMutation.mutate();
  };

  const handleUpdatePayment = () => {
    portalMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  // Free user - show upgrade CTA
  if (!details?.hasSubscription) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">{t('subscription.title')}</h1>
            <p className="text-muted-foreground mb-8">{t('subscription.subtitle')}</p>

            <Card className="p-8 text-center">
              <div className="mb-6">
                <Crown className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t('subscription.noSubscription')}</h2>
                <p className="text-muted-foreground">
                  {t('subscription.upgradeMessage')}
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => setLocation('/membership')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Crown className="h-5 w-5 mr-2" />
                {t('subscription.viewPlans')}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t('subscription.statusActive')}
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            {t('subscription.statusCanceled')}
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            {t('subscription.statusPastDue')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPaymentStatusBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            {t('subscription.paymentPaid')}
          </Badge>
        );
      case "open":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            {t('subscription.paymentPending')}
          </Badge>
        );
      case "void":
      case "uncollectible":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            {t('subscription.paymentFailed')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">{t('subscription.title')}</h1>
          <p className="text-muted-foreground mb-8">{t('subscription.subtitle')}</p>

          {/* Current Plan */}
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="h-6 w-6 text-purple-500" />
                  <h2 className="text-2xl font-bold">{details.plan}</h2>
                  {getStatusBadge(details.status)}
                </div>
                <p className="text-muted-foreground">
                  ${details.price} {details.currency} / {t('subscription.month')}
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={handleUpdatePayment}
                disabled={portalMutation.isPending}
              >
                {portalMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                {t('subscription.managePayment')}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Renewal Date */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {details.cancelAtPeriodEnd 
                      ? t('subscription.expiresOn')
                      : t('subscription.renewsOn')
                    }
                  </span>
                </div>
                <p className="font-semibold">{formatDate(details.currentPeriodEnd)}</p>
              </div>

              {/* Payment Method */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t('subscription.paymentMethod')}
                  </span>
                </div>
                {details.paymentMethod ? (
                  <p className="font-semibold">
                    {details.paymentMethod.brand.toUpperCase()} •••• {details.paymentMethod.last4}
                  </p>
                ) : (
                  <p className="text-muted-foreground">{t('subscription.noPaymentMethod')}</p>
                )}
              </div>
            </div>

            {/* Cancel Warning */}
            {details.cancelAtPeriodEnd && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-600 mb-1">
                      {t('subscription.canceledWarningTitle')}
                    </p>
                    <p className="text-sm text-yellow-600/80">
                      {t('subscription.canceledWarningDesc')} {formatDate(details.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              {details.cancelAtPeriodEnd ? (
                <Button
                  onClick={handleReactivate}
                  disabled={reactivateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {reactivateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  {t('subscription.reactivate')}
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      {t('subscription.cancel')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('subscription.cancelConfirmTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('subscription.cancelConfirmDesc')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('subscription.cancelNo')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                        {t('subscription.cancelYes')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </Card>

          {/* Payment History */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{t('subscription.paymentHistory')}</h2>
            
            {paymentHistory && paymentHistory.payments.length > 0 ? (
              <div className="space-y-3">
                {paymentHistory.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          ${payment.amount.toFixed(2)} {payment.currency}
                        </p>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                      
                      {payment.invoicePdf && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(payment.invoicePdf!, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t('subscription.downloadInvoice')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">{t('subscription.noPayments')}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
