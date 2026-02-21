import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { Copy, Mail, MessageCircle, TrendingUp, Users, CheckCircle2, XCircle, Send } from "lucide-react";

export function Recruitment() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [generatedMessage, setGeneratedMessage] = useState("");

  // Queries
  const { data: leads, refetch: refetchLeads } = trpc.recruitment.getLeads.useQuery({});
  const { data: stats } = trpc.recruitment.getStats.useQuery();

  // Mutations
  const addLead = trpc.recruitment.addLead.useMutation({
    onSuccess: () => {
      toast.success("DJ lead added successfully!");
      setShowAddForm(false);
      refetchLeads();
    },
    onError: (error) => {
      toast.error(`Failed to add lead: ${error.message}`);
    },
  });

  const generateMessage = trpc.recruitment.generateMessage.useMutation({
    onSuccess: (data) => {
      setGeneratedMessage(data.message);
      toast.success("Message generated!");
    },
    onError: (error) => {
      toast.error(`Failed to generate message: ${error.message}`);
    },
  });

  const updateStatus = trpc.recruitment.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated!");
      refetchLeads();
    },
  });

  const sendBulkEmails = trpc.emailCampaigns.sendBulk.useMutation({
    onSuccess: (data) => {
      toast.success(`Emails sent successfully to ${data.sentCount} DJs!`);
      refetchLeads();
    },
    onError: (error) => {
      toast.error(`Failed to send emails: ${error.message}`);
    },
  });

  const handleSendBulkEmails = () => {
    const djsWithEmail = (leads || []).filter((lead: any) => lead.email && lead.discoveryStatus === "discovered");
    
    if (djsWithEmail.length === 0) {
      toast.error("No DJs with email found");
      return;
    }
    
    if (confirm(`Send emails to ${djsWithEmail.length} DJs?`)) {
      sendBulkEmails.mutate({
        djIds: djsWithEmail.map((dj: any) => dj.id),
        platform: "email",
      });
    }
  };

  const markSent = trpc.recruitment.markMessageSent.useMutation({
    onSuccess: () => {
      toast.success("Marked as contacted!");
      refetchLeads();
      setSelectedLead(null);
      setGeneratedMessage("");
    },
  });

  const handleAddLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addLead.mutate({
      name: formData.get("name") as string,
      instagramUsername: formData.get("instagram") as string || undefined,
      soundcloudUsername: formData.get("soundcloud") as string || undefined,
      email: formData.get("email") as string || undefined,
      primaryGenre: formData.get("genre") as string || undefined,
      instagramUrl: formData.get("instagramUrl") as string || undefined,
      soundcloudUrl: formData.get("soundcloudUrl") as string || undefined,
      instagramFollowers: formData.get("instagramFollowers") ? parseInt(formData.get("instagramFollowers") as string) : undefined,
      soundcloudFollowers: formData.get("soundcloudFollowers") ? parseInt(formData.get("soundcloudFollowers") as string) : undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleGenerateMessage = (lead: any, platform: "instagram" | "email") => {
    setSelectedLead(lead);
    generateMessage.mutate({
      djId: lead.id,
      djName: lead.fullName || lead.instagramUsername || lead.soundcloudUsername || "DJ",
      genre: lead.primaryGenre,
      platform,
      tone: "professional",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      discovered: { variant: "secondary", icon: Users },
      contacted: { variant: "default", icon: MessageCircle },
      responded: { variant: "default", icon: Mail },
      converted: { variant: "default", icon: CheckCircle2 },
      rejected: { variant: "destructive", icon: XCircle },
    };

    const config = variants[status] || variants.discovered;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">DJ Recruitment Dashboard</h1>
          <p className="text-muted-foreground">
            Manage DJ leads, generate personalized outreach messages, and track conversions
          </p>
        </div>
        <Button
          onClick={handleSendBulkEmails}
          disabled={sendBulkEmails.isPending}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {sendBulkEmails.isPending ? (
            <>
              <Mail className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Bulk Emails
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Discovered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.discovered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contacted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contacted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Responded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responded}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Converted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Lead Button */}
      <div className="mb-6">
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add DJ Lead"}
        </Button>
      </div>

      {/* Add Lead Form */}
      {showAddForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New DJ Lead</CardTitle>
            <CardDescription>Enter DJ information manually</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram Username</Label>
                  <Input id="instagram" name="instagram" placeholder="@johndoe" />
                </div>
                <div>
                  <Label htmlFor="soundcloud">SoundCloud Username</Label>
                  <Input id="soundcloud" name="soundcloud" placeholder="johndoe" />
                </div>
                <div>
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input id="instagramUrl" name="instagramUrl" type="url" placeholder="https://instagram.com/johndoe" />
                </div>
                <div>
                  <Label htmlFor="soundcloudUrl">SoundCloud URL</Label>
                  <Input id="soundcloudUrl" name="soundcloudUrl" type="url" placeholder="https://soundcloud.com/johndoe" />
                </div>
                <div>
                  <Label htmlFor="instagramFollowers">Instagram Followers</Label>
                  <Input id="instagramFollowers" name="instagramFollowers" type="number" placeholder="10000" />
                </div>
                <div>
                  <Label htmlFor="soundcloudFollowers">SoundCloud Followers</Label>
                  <Input id="soundcloudFollowers" name="soundcloudFollowers" type="number" placeholder="5000" />
                </div>
                <div>
                  <Label htmlFor="genre">Primary Genre</Label>
                  <Input id="genre" name="genre" placeholder="Tech House" />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Any additional information..." rows={3} />
              </div>
              <Button type="submit" disabled={addLead.isPending}>
                {addLead.isPending ? "Adding..." : "Add Lead"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>DJ Leads</CardTitle>
          <CardDescription>All discovered DJs and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads && leads.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No leads yet. Add your first DJ lead to get started!
              </p>
            )}
            {leads?.map((lead) => (
              <Card key={lead.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {lead.fullName || lead.instagramUsername || lead.soundcloudUsername || "Unknown DJ"}
                        </h3>
                        {getStatusBadge(lead.discoveryStatus)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {lead.primaryGenre && <p>Genre: {lead.primaryGenre}</p>}
                        {lead.instagramUsername && (
                          <p>Instagram: @{lead.instagramUsername} ({lead.instagramFollowers?.toLocaleString() || 0} followers)</p>
                        )}
                        {lead.soundcloudUsername && (
                          <p>SoundCloud: {lead.soundcloudUsername} ({lead.soundcloudFollowers?.toLocaleString() || 0} followers)</p>
                        )}
                        {lead.email && <p>Email: {lead.email}</p>}
                        {lead.talentScore && <p>Talent Score: {lead.talentScore}/100</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateMessage(lead, "instagram")}
                        disabled={generateMessage.isPending}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Instagram DM
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateMessage(lead, "email")}
                        disabled={generateMessage.isPending}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>

                  {/* Generated Message */}
                  {selectedLead?.id === lead.id && generatedMessage && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Generated Message:</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(generatedMessage)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap mb-4">{generatedMessage}</p>
                      <Button
                        size="sm"
                        onClick={() => markSent.mutate({ djId: lead.id })}
                        disabled={markSent.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark as Sent
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
