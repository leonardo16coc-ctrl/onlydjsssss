import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Mainstage from "./pages/Mainstage";
import Rankings from "./pages/Rankings";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Membership from "./pages/Membership";
import DJProfile from "./pages/DJProfile";
import ProfileEdit from "./pages/ProfileEdit";
import DJMode from "./pages/DJMode";
import MainstageMode from "./pages/MainstageMode";
import Subscription from "./pages/Subscription";
import Wallet from "./pages/Wallet";
import FAQ from "./pages/FAQ";
import EditTrack from "./pages/EditTrack";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Copyright from "./pages/Copyright";
import Legal from "./pages/Legal";
import Community from "./pages/Community";
import AgentsDashboard from "./pages/AgentsDashboard";
import ScraperMonitoring from "./pages/ScraperMonitoring";
import About from "./pages/About";
import Help from "./pages/Help";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import CookiePolicy from "./pages/CookiePolicy";
import APIDocs from "./pages/APIDocs";
import Pricing from "./pages/Pricing";
import Refund from "./pages/Refund";
import { Recruitment } from "./pages/Recruitment";
import ScoutDashboard from "./pages/ScoutDashboard";
import Welcome from "./pages/Welcome";
import EmailAnalytics from "./pages/EmailAnalytics";
import ABTesting from "./pages/ABTesting";
import TrackDetail from "./pages/TrackDetail";
import PrivateTrack from "./pages/PrivateTrack";
import MyPlaylists from "./pages/MyPlaylists";
import PlaylistDetail from "./pages/PlaylistDetail";
import Charts from "./pages/Charts";
import Social from "./pages/Social";
import SocialDrops from "./pages/SocialDrops";
import SocialBattles from "./pages/SocialBattles";
import SocialRanking from "./pages/SocialRanking";
import SocialMap from "./pages/SocialMap";
import ConnectSocialMedia from "./pages/ConnectSocialMedia";
import Messages from "./pages/Messages";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "./_core/hooks/useAuth";

// Pings the server every 5 minutes to keep lastSeenAt fresh
function PresencePing() {
  const { isAuthenticated } = useAuth();
  const ping = trpc.presence.ping.useMutation();

  useEffect(() => {
    if (!isAuthenticated) return;
    // Ping immediately on mount
    ping.mutate();
    // Then every 5 minutes
    const interval = setInterval(() => ping.mutate(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/explore"} component={Explore} />
      <Route path={"/dj-mode"} component={DJMode} />
      <Route path={"/mainstage"} component={Mainstage} />
      <Route path={"/mainstage-mode"} component={MainstageMode} />
      <Route path={"/rankings"} component={Rankings} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/upload"} component={Upload} />
      <Route path={"/welcome"} component={Welcome} />
      <Route path={"/membership"} component={Membership} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/subscription"} component={Subscription} />
      <Route path={"/wallet"} component={Wallet} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/community"} component={Community} />
      <Route path={"/about"} component={About} />
      <Route path={"/help"} component={Help} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/careers"} component={Careers} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/cookies"} component={CookiePolicy} />
      <Route path={"/api-docs"} component={APIDocs} />
      <Route path={"/discover"} component={Explore} />
      <Route path={"/network"} component={Rankings} />
      <Route path={"/agents"} component={AgentsDashboard} />
      <Route path={"/scraper-monitoring"} component={ScraperMonitoring} />
      <Route path={"/recruitment"} component={Recruitment} />
      <Route path={"/scout-dashboard"} component={ScoutDashboard} />
      <Route path={"/email-analytics"} component={EmailAnalytics} />
      <Route path={"/ab-testing"} component={ABTesting} />
      <Route path={"/dj/:username"} component={DJProfile} />
      <Route path={"/@:username"} component={DJProfile} />
      <Route path={"/:username/tracks"} component={DJProfile} />
      <Route path={"/:username/edits"} component={DJProfile} />
      <Route path={"/:username/remixes"} component={DJProfile} />
      <Route path={"/:username/mashups"} component={DJProfile} />
      <Route path={"/charts"} component={Charts} />
      <Route path={"/social"} component={Social} />
      <Route path={"/social/drops"} component={SocialDrops} />
      <Route path={"/social/battles"} component={SocialBattles} />
      <Route path={"/social/ranking"} component={SocialRanking} />
      <Route path={"/social/map"} component={SocialMap} />
      <Route path={"/profile/edit"} component={ProfileEdit} />
      <Route path={"/connect-social"} component={ConnectSocialMedia} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/dj/:username/track/:id"} component={TrackDetail} />
      <Route path={"/track/private/:token"} component={PrivateTrack} />
      <Route path={"/track/:id"} component={TrackDetail} />
      <Route path={"/my-playlists"} component={MyPlaylists} />
      <Route path={"/playlist/:id"} component={PlaylistDetail} />
      <Route path={"/track/edit/:id"} component={EditTrack} />
      <Route path={"/legal"} component={Legal} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/refund"} component={Refund} />
      <Route path={"/copyright"} component={Copyright} />
      <Route path={"/404"} component={NotFound} />
      <Route path={"/:username"} component={DJProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <PresencePing />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
