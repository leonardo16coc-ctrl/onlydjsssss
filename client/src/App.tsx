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
      <Route path={"/membership"} component={Membership} />
      <Route path={"/subscription"} component={Subscription} />
      <Route path={"/wallet"} component={Wallet} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/community"} component={Community} />
      <Route path={"/about"} component={About} />
      <Route path={"/help"} component={Help} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/careers"} component={Careers} />
      <Route path={"/discover"} component={Explore} />
      <Route path={"/network"} component={Rankings} />
      <Route path={"/agents"} component={AgentsDashboard} />
      <Route path={"/scraper-monitoring"} component={ScraperMonitoring} />
      <Route path={"/dj/:username"} component={DJProfile} />
      <Route path={"/profile/edit"} component={ProfileEdit} />
      <Route path={"/track/edit/:id"} component={EditTrack} />
      <Route path={"/legal"} component={Legal} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/copyright"} component={Copyright} />
      <Route path={"/404"} component={NotFound} />
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
