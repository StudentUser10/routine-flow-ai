import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import Index from "./pages/Index";

const Login = lazy(() => import("./pages/Login"));
const Cadastro = lazy(() => import("./pages/Cadastro"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Rotina = lazy(() => import("./pages/Rotina"));
const Planos = lazy(() => import("./pages/Planos"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const MetaPixelInit = () => {
  useEffect(() => {
    const w = window as any;
    // Re-fire PageView via React as a safety net
    // The inline script in index.html handles initial load
    if (w.fbq) {
      w.fbq("track", "PageView");
    }
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MetaPixelInit />
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/cadastro" element={<Cadastro />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/rotina" element={<Rotina />} />
                  <Route path="/planos" element={<Planos />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
