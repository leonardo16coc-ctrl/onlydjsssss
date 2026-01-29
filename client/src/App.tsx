import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { 
  getLanguageFromPath, 
  getLocalizedPath, 
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  type Language 
} from "./lib/routes";

function LanguageRedirect() {
  const [location] = useLocation();
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const lang = getLanguageFromPath(location);
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [location, i18n]);

  // Redirect root to default language
  if (location === "/") {
    const browserLang = navigator.language.split("-")[0];
    const targetLang = SUPPORTED_LANGUAGES.includes(browserLang as Language) 
      ? browserLang as Language 
      : DEFAULT_LANGUAGE;
    return <Redirect to={getLocalizedPath("home", targetLang)} />;
  }

  return null;
}

function Router() {
  return (
    <Switch>
      {/* Root redirect */}
      <Route path="/" component={LanguageRedirect} />
      
      {/* Localized routes for each language */}
      {SUPPORTED_LANGUAGES.map((lang) => (
        <div key={lang}>
          <Route path={getLocalizedPath("home", lang)} component={Home} />
          <Route path={getLocalizedPath("explore", lang)} component={Explore} />
          <Route path={getLocalizedPath("dj-mode", lang)} component={DJMode} />
          <Route path={`/${lang}/mainstage`} component={Mainstage} />
          <Route path={getLocalizedPath("mainstage", lang)} component={MainstageMode} />
          <Route path={`/${lang}/rankings`} component={Rankings} />
          <Route path={getLocalizedPath("dashboard", lang)} component={Dashboard} />
          <Route path={getLocalizedPath("upload", lang)} component={Upload} />
          <Route path={getLocalizedPath("membership", lang)} component={Membership} />
          <Route path={`/${lang}/dj/:username`} component={DJProfile} />
          <Route path={getLocalizedPath("profile-edit", lang)} component={ProfileEdit} />
        </div>
      ))}
      
      {/* Fallback routes (redirect to localized version) */}
      <Route path="/explore">
        {() => <Redirect to={getLocalizedPath("explore", DEFAULT_LANGUAGE)} />}
      </Route>
      <Route path="/dj-mode">
        {() => <Redirect to={getLocalizedPath("dj-mode", DEFAULT_LANGUAGE)} />}
      </Route>
      <Route path="/upload">
        {() => <Redirect to={getLocalizedPath("upload", DEFAULT_LANGUAGE)} />}
      </Route>
      <Route path="/membership">
        {() => <Redirect to={getLocalizedPath("membership", DEFAULT_LANGUAGE)} />}
      </Route>
      <Route path="/dashboard">
        {() => <Redirect to={getLocalizedPath("dashboard", DEFAULT_LANGUAGE)} />}
      </Route>
      
      <Route path="/404" component={NotFound} />
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
