/**
 * Scraper Monitoring Dashboard
 * Real-time monitoring of scraping accounts, ban rates, and system health
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Users,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function ScraperMonitoring() {
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'soundcloud' | undefined>();
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    platform: 'instagram' as 'instagram' | 'soundcloud',
    username: '',
    password: ''
  });
  
  // Queries
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = trpc.agents.getScraperHealth.useQuery(undefined, {
    refetchInterval: 10000 // Refresh every 10 seconds
  });
  
  const { data: accounts, isLoading: accountsLoading, refetch: refetchAccounts } = trpc.agents.getScraperAccounts.useQuery(
    { platform: selectedPlatform },
    { refetchInterval: 10000 }
  );
  
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = trpc.agents.getScraperLogs.useQuery(
    { platform: selectedPlatform, limit: 50 },
    { refetchInterval: 5000 }
  );
  
  // Mutations
  const addAccountMutation = trpc.agents.addScraperAccount.useMutation({
    onSuccess: () => {
      toast.success('Account added successfully');
      setIsAddAccountOpen(false);
      setNewAccount({ platform: 'instagram', username: '', password: '' });
      refetchAccounts();
      refetchHealth();
    },
    onError: (error) => {
      toast.error(`Failed to add account: ${error.message}`);
    }
  });
  
  const updateStatusMutation = trpc.agents.updateScraperAccountStatus.useMutation({
    onSuccess: () => {
      toast.success('Account status updated');
      refetchAccounts();
      refetchHealth();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });
  
  const deleteAccountMutation = trpc.agents.deleteScraperAccount.useMutation({
    onSuccess: () => {
      toast.success('Account deleted');
      refetchAccounts();
      refetchHealth();
    },
    onError: (error) => {
      toast.error(`Failed to delete account: ${error.message}`);
    }
  });
  
  const cleanupLogsMutation = trpc.agents.cleanupScraperLogs.useMutation({
    onSuccess: (data) => {
      toast.success(`Cleaned up ${data.deleted} old log entries`);
      refetchLogs();
    }
  });
  
  // Calculate metrics from health data
  const metrics = health ? {
    totalAccounts: health.accountStats.reduce((sum: number, stat: any) => sum + stat.count, 0),
    activeAccounts: health.accountStats.find((s: any) => s.status === 'active')?.count || 0,
    bannedAccounts: health.accountStats.find((s: any) => s.status === 'banned')?.count || 0,
    rateLimitedAccounts: health.accountStats.find((s: any) => s.status === 'rate_limited')?.count || 0,
    successRate: health.successRate[0]?.successRate || 0,
    recentErrors: health.recentLogs.filter((l: any) => l.status === 'error').reduce((sum: number, l: any) => sum + l.count, 0),
    recentBans: health.banStats.reduce((sum: number, s: any) => sum + (s.recentBans || 0), 0)
  } : null;
  
  const handleAddAccount = () => {
    if (!newAccount.username) {
      toast.error('Username is required');
      return;
    }
    
    addAccountMutation.mutate(newAccount);
  };
  
  const handleUpdateStatus = (accountId: number, status: 'active' | 'banned' | 'suspended' | 'rate_limited') => {
    updateStatusMutation.mutate({ accountId, status });
  };
  
  const handleDeleteAccount = (accountId: number) => {
    if (confirm('Are you sure you want to delete this account?')) {
      deleteAccountMutation.mutate({ accountId });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case 'banned':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Banned</Badge>;
      case 'rate_limited':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Rate Limited</Badge>;
      case 'suspended':
        return <Badge className="bg-gray-500"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getLogStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'banned':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'rate_limited':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  if (healthLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scraper Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of scraping accounts and system health
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchHealth();
              refetchAccounts();
              refetchLogs();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Scraper Account</DialogTitle>
                <DialogDescription>
                  Add a new account for scraping. Use disposable accounts only.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={newAccount.platform}
                    onValueChange={(value: 'instagram' | 'soundcloud') => 
                      setNewAccount({ ...newAccount, platform: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="soundcloud">SoundCloud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newAccount.username}
                    onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password (optional for SoundCloud)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                    placeholder="password"
                  />
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Only use disposable accounts. Never use your main account.
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddAccountOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAccount}
                  disabled={addAccountMutation.isPending}
                >
                  {addAccountMutation.isPending ? 'Adding...' : 'Add Account'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Health Alert */}
      {metrics && metrics.recentBans > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ban Alert</AlertTitle>
          <AlertDescription>
            {metrics.recentBans} account(s) banned in the last 7 days. Consider reducing scraping activity.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalAccounts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.activeAccounts || 0} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.successRate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Accounts</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics?.bannedAccounts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.recentBans || 0} in last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limited</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{metrics?.rateLimitedAccounts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Will auto-recover in 24h
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scraper Accounts</CardTitle>
              <CardDescription>Manage and monitor scraping accounts</CardDescription>
            </div>
            <Select
              value={selectedPlatform || 'all'}
              onValueChange={(value) => setSelectedPlatform(value === 'all' ? undefined : value as 'instagram' | 'soundcloud')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="soundcloud">SoundCloud</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {accountsLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : accounts && accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account: any) => (
                  <TableRow key={account.id}>
                    <TableCell className="capitalize">{account.platform}</TableCell>
                    <TableCell className="font-mono">@{account.username}</TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{account.totalActions} total</div>
                        <div className="text-muted-foreground text-xs">
                          {account.successfulActions} success / {account.failedActions} failed
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {account.totalActions > 0
                        ? `${((account.successfulActions / account.totalActions) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {account.lastUsedAt
                        ? new Date(account.lastUsedAt).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {account.status !== 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(account.id, 'active')}
                          >
                            Reactivate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No accounts found. Add an account to start scraping.
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 50 scraping actions</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => cleanupLogsMutation.mutate()}
              disabled={cleanupLogsMutation.isPending}
            >
              Cleanup Old Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getLogStatusIcon(log.status)}
                    <div>
                      <div className="font-medium capitalize">
                        {log.platform} - {log.action.replace(/_/g, ' ')}
                      </div>
                      {log.targetUsername && (
                        <div className="text-sm text-muted-foreground">
                          @{log.targetUsername}
                        </div>
                      )}
                      {log.error && (
                        <div className="text-sm text-red-500 mt-1">
                          {log.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
