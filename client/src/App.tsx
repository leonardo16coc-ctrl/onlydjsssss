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
      <Route path={"/dj/:username"} component={DJProfile} />
      <Route path={"/profile/edit"} component={ProfileEdit} />
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
