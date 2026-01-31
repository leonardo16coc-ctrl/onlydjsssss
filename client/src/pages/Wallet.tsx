import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Wallet as WalletIcon, DollarSign, TrendingUp, ExternalLink, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Wallet() {
  const { t } = useTranslation();
  const [payoutAmount, setPayoutAmount] = useState("");

  // Queries
  const { data: accountStatus, isLoading: statusLoading } = trpc.wallet.getAccountStatus.useQuery();
  const { data: balance, isLoading: balanceLoading } = trpc.wallet.getBalance.useQuery();
  const { data: payoutHistory, isLoading: historyLoading } = trpc.wallet.getPayoutHistory.useQuery();
  const { data: transactions, isLoading: transactionsLoading } = trpc.wallet.getTransactions.useQuery();

  // Mutations
  const createAccount = trpc.wallet.createConnectAccount.useMutation({
    onSuccess: () => {
      toast.success(t("wallet.accountCreated"));
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const getOnboardingLink = trpc.wallet.getOnboardingLink.useQuery(undefined, {
    enabled: false,
  });

  const requestPayout = trpc.wallet.requestPayout.useMutation({
    onSuccess: () => {
      toast.success(t("wallet.payoutRequested"));
      setPayoutAmount("");
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const getDashboardLink = trpc.wallet.getDashboardLink.useQuery(undefined, {
    enabled: false,
  });

  const handleCreateAccount = () => {
    createAccount.mutate({ country: "US" });
  };

  const handleStartOnboarding = async () => {
    const result = await getOnboardingLink.refetch();
    if (result.data?.url) {
      window.open(result.data.url, "_blank");
    }
  };

  const handleRequestPayout = () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 10) {
      toast.error(t("wallet.minPayoutError"));
      return;
    }

    requestPayout.mutate({ amount });
  };

  const handleOpenDashboard = async () => {
    const result = await getDashboardLink.refetch();
    if (result.data?.url) {
      window.open(result.data.url, "_blank");
    }
  };

  // Loading state
  if (statusLoading || balanceLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  // No Connect account
  if (!accountStatus?.hasAccount) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="h-6 w-6" />
              {t("wallet.title")}
            </CardTitle>
            <CardDescription>{t("wallet.setupRequired")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {t("wallet.setupDescription")}
              </p>
            </div>
            <Button
              onClick={handleCreateAccount}
              disabled={createAccount.isPending}
              className="w-full"
            >
              {createAccount.isPending ? t("common.loading") : t("wallet.createAccount")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Account not verified
  if (accountStatus.hasAccount && 'detailsSubmitted' in accountStatus && !accountStatus.detailsSubmitted) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              {t("wallet.verificationRequired")}
            </CardTitle>
            <CardDescription>{t("wallet.verificationDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                {t("wallet.kycRequired")}
              </p>
            </div>
            <Button
              onClick={handleStartOnboarding}
              disabled={getOnboardingLink.isFetching}
              className="w-full"
            >
              {getOnboardingLink.isFetching ? t("common.loading") : t("wallet.completeVerification")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main wallet interface
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <WalletIcon className="h-8 w-8" />
            {t("wallet.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("wallet.subtitle")}</p>
        </div>
        <Button variant="outline" onClick={handleOpenDashboard} disabled={getDashboardLink.isFetching}>
          <ExternalLink className="h-4 w-4 mr-2" />
          {t("wallet.stripeDashboard")}
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("wallet.availableBalance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${balance?.available.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("wallet.pendingBalance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              ${balance?.pending.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("wallet.totalEarnings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${balance?.total.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Payout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("wallet.requestPayout")}
          </CardTitle>
          <CardDescription>{t("wallet.minPayout")}: $10.00</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="10.00"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              min="10"
              step="0.01"
              className="max-w-xs"
            />
            <Button
              onClick={handleRequestPayout}
              disabled={requestPayout.isPending || !payoutAmount}
            >
              {requestPayout.isPending ? t("common.loading") : t("wallet.requestButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("wallet.payoutHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <p className="text-center text-muted-foreground py-4">{t("common.loading")}</p>
          ) : payoutHistory && payoutHistory.length > 0 ? (
            <div className="space-y-2">
              {payoutHistory.map((payout: any) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      ${payout.amount.toFixed(2)} {payout.currency.toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">{payout.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">{payout.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payout.created).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">{t("wallet.noPayouts")}</p>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("wallet.transactionHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <p className="text-center text-muted-foreground py-4">{t("common.loading")}</p>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((txn: any) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium capitalize">{txn.type.replace("_", " ")}</p>
                    <p className="text-sm text-muted-foreground">{txn.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${txn.net.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(txn.created).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">{t("wallet.noTransactions")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
