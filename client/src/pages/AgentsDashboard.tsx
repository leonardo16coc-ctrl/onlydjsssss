/**
 * Agents Dashboard - Admin Panel for Autonomous Agents
 * Only accessible to admin users
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Users, TrendingUp, Target, CheckCircle, XCircle, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentsDashboard() {
  const [selectedGenre, setSelectedGenre] = useState('Tech House');
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'soundcloud' | 'both'>('both');
  const [showCloser, setShowCloser] = useState(false);
  
  // Queries
  const { data: config, isLoading: configLoading } = trpc.agents.getScoutConfig.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.agents.getScoutStats.useQuery();
  const { data: djsData, isLoading: djsLoading } = trpc.agents.getDiscoveredDJs.useQuery({
    page: 1,
    limit: 20,
    minScore: 60
  });
  const { data: campaigns, refetch: refetchCampaigns } = trpc.agents.getCampaigns.useQuery();
  
  // Mutations
  const runScout = trpc.agents.runScout.useMutation({
    onSuccess: (data) => {
      toast.success(`Agent Scout completed! Found ${data.result.profilesQualified} qualified DJs.`);
    },
    onError: (error) => {
      toast.error(`Agent Scout failed: ${error.message}`);
    }
  });
  
  const runFullDiscovery = trpc.agents.runFullDiscovery.useMutation({
    onSuccess: () => {
      toast.success('Full discovery completed successfully!');
    },
    onError: (error) => {
      toast.error(`Full discovery failed: ${error.message}`);
    }
  });
  
  const runCloserCycle = trpc.agents.runCloserCycle.useMutation({
    onSuccess: () => {
      toast.success('Agent Closer cycle completed!');
      refetchCampaigns();
    },
    onError: (error) => {
      toast.error(`Agent Closer failed: ${error.message}`);
    }
  });
  
  const handleRunScout = () => {
    runScout.mutate({
      genre: selectedGenre,
      platform: selectedPlatform,
      limit: 50
    });
  };
  
  const handleRunFullDiscovery = () => {
    if (confirm('This will run Agent Scout across all genres. This may take 30+ minutes. Continue?')) {
      runFullDiscovery.mutate();
    }
  };
  
  const genres = [
    'Tech House',
    'Bass House',
    'Afro House',
    'Techno',
    'Melodic Techno',
    'Big Room',
    'EDM',
    'Hard Techno'
  ];
  
  if (configLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">🤖 Agents Dashboard</h1>
          <p className="text-muted-foreground">
            Control and monitor autonomous agents for DJ discovery and growth automation
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/scraper-monitoring'}
        >
          📊 Scraper Monitoring
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discovered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDiscovered || 0}</div>
            <p className="text-xs text-muted-foreground">DJs found by Agent Scout</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.qualified || 0}</div>
            <p className="text-xs text-muted-foreground">Score ≥ 60</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.highPriority || 0}</div>
            <p className="text-xs text-muted-foreground">Score ≥ 80</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgScore ? Number(stats.avgScore).toFixed(1) : '0.0'}</div>
            <p className="text-xs text-muted-foreground">Average talent score</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Agent Scout Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Agent Scout Control Panel</CardTitle>
          <CardDescription>
            Discover and evaluate DJ talent from Instagram and SoundCloud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {config?.lastRunStatus === 'running' && (
              <Badge variant="default" className="gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Running
              </Badge>
            )}
            {config?.lastRunStatus === 'success' && (
              <Badge variant="default" className="gap-1 bg-green-500">
                <CheckCircle className="w-3 h-3" />
                Success
              </Badge>
            )}
            {config?.lastRunStatus === 'failed' && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="w-3 h-3" />
                Failed
              </Badge>
            )}
            {!config?.lastRunStatus && (
              <Badge variant="secondary">Never Run</Badge>
            )}
          </div>
          
          {/* Last Run */}
          {config?.lastRunAt && (
            <div className="text-sm text-muted-foreground">
              Last run: {new Date(config.lastRunAt).toLocaleString()}
            </div>
          )}
          
          {/* Run Stats */}
          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-medium">Total Runs:</span> {config?.totalRuns || 0}
            </div>
            <div>
              <span className="font-medium">Successful:</span> {config?.successfulRuns || 0}
            </div>
            <div>
              <span className="font-medium">Failed:</span> {config?.failedRuns || 0}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Genre</label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Platform</label>
              <Select value={selectedPlatform} onValueChange={(v: any) => setSelectedPlatform(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="instagram">Instagram Only</SelectItem>
                  <SelectItem value="soundcloud">SoundCloud Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRunScout}
              disabled={runScout.isPending || config?.lastRunStatus === 'running'}
            >
              {runScout.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Scout
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleRunFullDiscovery}
              disabled={runFullDiscovery.isPending || config?.lastRunStatus === 'running'}
            >
              {runFullDiscovery.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Full Discovery...
                </>
              ) : (
                'Run Full Discovery (All Genres)'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Discovered DJs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discovered DJs (Top 20)</CardTitle>
          <CardDescription>
            Recently discovered DJs sorted by talent score
          </CardDescription>
        </CardHeader>
        <CardContent>
          {djsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : djsData && djsData.djs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Genre</th>
                    <th className="text-center py-2 px-4">Talent Score</th>
                    <th className="text-center py-2 px-4">IG Followers</th>
                    <th className="text-center py-2 px-4">SC Followers</th>
                    <th className="text-center py-2 px-4">Status</th>
                    <th className="text-center py-2 px-4">Discovered</th>
                  </tr>
                </thead>
                <tbody>
                  {djsData.djs.map((dj: any) => (
                    <tr key={dj.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 font-medium">{dj.fullName || 'Unknown'}</td>
                      <td className="py-2 px-4">{dj.primaryGenre}</td>
                      <td className="py-2 px-4 text-center">
                        <Badge variant={
                          dj.talentScore >= 80 ? 'default' :
                          dj.talentScore >= 70 ? 'secondary' :
                          'outline'
                        }>
                          {dj.talentScore ? Number(dj.talentScore).toFixed(1) : 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-center">
                        {dj.instagramFollowers?.toLocaleString() || '-'}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {dj.soundcloudFollowers?.toLocaleString() || '-'}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <Badge variant="outline">{dj.discoveryStatus}</Badge>
                      </td>
                      <td className="py-2 px-4 text-center text-sm text-muted-foreground">
                        {new Date(dj.discoveryDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No DJs discovered yet. Run Agent Scout to start discovering talent!
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Agent Closer Section */}
      <Card className="border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                Agent Closer - Outreach Automation
              </CardTitle>
              <CardDescription>
                Automate personalized DM campaigns to discovered DJs
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCloser(!showCloser)}
            >
              {showCloser ? 'Hide' : 'Show'} Closer
            </Button>
          </div>
        </CardHeader>
        
        {showCloser && (
          <CardContent className="space-y-4">
            {/* Campaigns List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Active Campaigns</h3>
              
              {campaigns && campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign: any) => (
                    <Card key={campaign.id} className="border-purple-500/10">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">{campaign.name}</h4>
                            <p className="text-sm text-muted-foreground">{campaign.description}</p>
                          </div>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Targets</p>
                            <p className="font-semibold">{campaign.totalTargets}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Contacted</p>
                            <p className="font-semibold">{campaign.contacted}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Responded</p>
                            <p className="font-semibold">{campaign.responded}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Converted</p>
                            <p className="font-semibold">{campaign.converted}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns yet. Create your first outreach campaign.</p>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => runCloserCycle.mutate()}
                disabled={runCloserCycle.isPending}
                variant="outline"
              >
                {runCloserCycle.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Run Follow-up Cycle
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => toast.info('Campaign creation UI coming soon')}
              >
                Create New Campaign
              </Button>
            </div>
            
            {/* Info */}
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Agent Closer uses AI to generate personalized messages and automatically sends follow-ups. 
                The system respects rate limits (50 messages/day, 10/hour) to avoid platform restrictions.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
