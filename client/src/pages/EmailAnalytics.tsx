import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Mail, MousePointerClick, Reply, TrendingUp, Users, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmailAnalytics() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  // Fetch all analytics data
  const { data: overallStats, isLoading: loadingOverall } = trpc.emailAnalytics.getOverallStats.useQuery();
  const { data: dateRangeStats, isLoading: loadingDateRange } = trpc.emailAnalytics.getStatsByDateRange.useQuery(dateRange);
  const { data: platformStats, isLoading: loadingPlatform } = trpc.emailAnalytics.getStatsByPlatform.useQuery();
  const { data: genreStats, isLoading: loadingGenre } = trpc.emailAnalytics.getStatsByGenre.useQuery();
  const { data: funnelStats, isLoading: loadingFunnel } = trpc.emailAnalytics.getConversionFunnel.useQuery();
  const { data: recentCampaigns, isLoading: loadingRecent } = trpc.emailAnalytics.getRecentCampaigns.useQuery({ limit: 20 });

  const COLORS = ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              📊 Email Analytics
            </h1>
            <p className="text-slate-400 mt-2">
              Track open rates, click rates, and conversion metrics
            </p>
          </div>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sent */}
          <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Sent</p>
                {loadingOverall ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-cyan-400 mt-2">
                    {overallStats?.total_sent || 0}
                  </p>
                )}
              </div>
              <Mail className="w-12 h-12 text-cyan-400/30" />
            </div>
          </Card>

          {/* Open Rate */}
          <Card className="bg-slate-900/50 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Open Rate</p>
                {loadingOverall ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-purple-400 mt-2">
                    {overallStats?.open_rate || 0}%
                  </p>
                )}
                <p className="text-slate-500 text-xs mt-1">
                  {overallStats?.total_opened || 0} opened
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-purple-400/30" />
            </div>
          </Card>

          {/* Click Rate */}
          <Card className="bg-slate-900/50 border-pink-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Click Rate</p>
                {loadingOverall ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-pink-400 mt-2">
                    {overallStats?.click_rate || 0}%
                  </p>
                )}
                <p className="text-slate-500 text-xs mt-1">
                  {overallStats?.total_clicked || 0} clicked
                </p>
              </div>
              <MousePointerClick className="w-12 h-12 text-pink-400/30" />
            </div>
          </Card>

          {/* Reply Rate */}
          <Card className="bg-slate-900/50 border-green-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Reply Rate</p>
                {loadingOverall ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-green-400 mt-2">
                    {overallStats?.reply_rate || 0}%
                  </p>
                )}
                <p className="text-slate-500 text-xs mt-1">
                  {overallStats?.total_replied || 0} replied
                </p>
              </div>
              <Reply className="w-12 h-12 text-green-400/30" />
            </div>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="genres">Genres</TabsTrigger>
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="recent">Recent Campaigns</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                📈 Email Performance Over Time (Last 30 Days)
              </h3>
              {loadingDateRange ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dateRangeStats || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="sent" stroke="#06b6d4" name="Sent" strokeWidth={2} />
                    <Line type="monotone" dataKey="opened" stroke="#8b5cf6" name="Opened" strokeWidth={2} />
                    <Line type="monotone" dataKey="clicked" stroke="#ec4899" name="Clicked" strokeWidth={2} />
                    <Line type="monotone" dataKey="replied" stroke="#10b981" name="Replied" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                📊 Open & Click Rates by Date
              </h3>
              {loadingDateRange ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dateRangeStats || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="open_rate" fill="#8b5cf6" name="Open Rate %" />
                    <Bar dataKey="click_rate" fill="#ec4899" name="Click Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  📧 Performance by Platform
                </h3>
                {loadingPlatform ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformStats || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ platform, total_sent }) => `${platform}: ${total_sent}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total_sent"
                      >
                        {(platformStats || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  📊 Platform Stats
                </h3>
                <div className="space-y-4">
                  {loadingPlatform ? (
                    <>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </>
                  ) : (
                    (platformStats || []).map((platform: any, index) => (
                      <div
                        key={platform.platform}
                        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold capitalize">
                            {platform.platform}
                          </span>
                          <span className="text-slate-400 text-sm">
                            {platform.total_sent} sent
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-slate-500">Open Rate</p>
                            <p className="text-purple-400 font-semibold">
                              {platform.open_rate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Click Rate</p>
                            <p className="text-pink-400 font-semibold">
                              {platform.click_rate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Replied</p>
                            <p className="text-green-400 font-semibold">
                              {platform.replied}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Genres Tab */}
          <TabsContent value="genres" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                🎵 Performance by DJ Genre
              </h3>
              {loadingGenre ? (
                <Skeleton className="h-96 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={genreStats || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="genre" type="category" stroke="#94a3b8" width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="open_rate" fill="#8b5cf6" name="Open Rate %" />
                    <Bar dataKey="click_rate" fill="#ec4899" name="Click Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </TabsContent>

          {/* Conversion Funnel Tab */}
          <TabsContent value="funnel" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                🎯 Conversion Funnel
              </h3>
              {loadingFunnel ? (
                <Skeleton className="h-96 w-full" />
              ) : (
                <div className="space-y-4">
                  {/* Funnel Visualization */}
                  <div className="space-y-3">
                    <FunnelStep
                      label="Discovered"
                      count={funnelStats?.discovered || 0}
                      percentage={100}
                      color="cyan"
                    />
                    <FunnelStep
                      label="Contacted"
                      count={funnelStats?.contacted || 0}
                      percentage={parseFloat(funnelStats?.contact_rate || "0")}
                      color="purple"
                    />
                    <FunnelStep
                      label="Opened Email"
                      count={funnelStats?.opened || 0}
                      percentage={parseFloat(funnelStats?.open_rate || "0")}
                      color="pink"
                    />
                    <FunnelStep
                      label="Clicked Link"
                      count={funnelStats?.clicked || 0}
                      percentage={parseFloat(funnelStats?.click_rate || "0")}
                      color="orange"
                    />
                    <FunnelStep
                      label="Replied"
                      count={funnelStats?.replied || 0}
                      percentage={parseFloat(funnelStats?.reply_rate || "0")}
                      color="green"
                    />
                    <FunnelStep
                      label="Converted"
                      count={funnelStats?.converted || 0}
                      percentage={parseFloat(funnelStats?.conversion_rate || "0")}
                      color="emerald"
                    />
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Recent Campaigns Tab */}
          <TabsContent value="recent" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                📬 Recent Email Campaigns
              </h3>
              {loadingRecent ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3 text-slate-400 font-semibold">DJ</th>
                        <th className="text-left p-3 text-slate-400 font-semibold">Email</th>
                        <th className="text-left p-3 text-slate-400 font-semibold">Genre</th>
                        <th className="text-left p-3 text-slate-400 font-semibold">Sent</th>
                        <th className="text-center p-3 text-slate-400 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(recentCampaigns || []).map((campaign: any) => (
                        <tr key={campaign.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                          <td className="p-3 text-white">{campaign.dj_name || "Unknown"}</td>
                          <td className="p-3 text-slate-400 text-sm">{campaign.email_to}</td>
                          <td className="p-3 text-slate-400 text-sm">{campaign.genre || "N/A"}</td>
                          <td className="p-3 text-slate-400 text-sm">
                            {new Date(campaign.sent_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              {campaign.opened_at && (
                                <div title="Opened">
                                  <CheckCircle className="w-4 h-4 text-purple-400" />
                                </div>
                              )}
                              {campaign.clicked_at && (
                                <div title="Clicked">
                                  <MousePointerClick className="w-4 h-4 text-pink-400" />
                                </div>
                              )}
                              {campaign.replied_at && (
                                <div title="Replied">
                                  <Reply className="w-4 h-4 text-green-400" />
                                </div>
                              )}
                              {!campaign.opened_at && !campaign.clicked_at && !campaign.replied_at && (
                                <span className="text-slate-500 text-xs">Sent</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Funnel Step Component
function FunnelStep({
  label,
  count,
  percentage,
  color,
}: {
  label: string;
  count: number;
  percentage: number;
  color: string;
}) {
  const colorClasses = {
    cyan: "bg-cyan-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
    emerald: "bg-emerald-500",
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-semibold">{label}</span>
        <div className="text-right">
          <span className="text-white font-bold">{count}</span>
          <span className="text-slate-400 text-sm ml-2">({percentage.toFixed(1)}%)</span>
        </div>
      </div>
      <div className="h-12 bg-slate-800 rounded-lg overflow-hidden">
        <div
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
