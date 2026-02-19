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
import { Loader2, Play, Users, TrendingUp, Target, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentsDashboard() {
  const [selectedGenre, setSelectedGenre] = useState('Tech House');
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'soundcloud' | 'both'>('both');
  
  // Queries
  const { data: config, isLoading: configLoading } = trpc.agents.getScoutConfig.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.agents.getScoutStats.useQuery();
  const { data: djsData, isLoading: djsLoading } = trpc.agents.getDiscoveredDJs.useQuery({
    page: 1,
    limit: 20,
    minScore: 60
  });
  
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
      <div>
        <h1 className="text-4xl font-bold mb-2">🤖 Agents Dashboard</h1>
        <p className="text-muted-foreground">
          Control and monitor autonomous agents for DJ discovery and growth automation
        </p>
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
            <div className="text-2xl font-bold">{stats?.avgScore?.toFixed(1) || 0}</div>
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
                          {dj.talentScore?.toFixed(1) || 'N/A'}
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
    </div>
  );
}
