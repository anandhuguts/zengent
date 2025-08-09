import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import UsageStatistics from "@/pages/usage-statistics";
import AdminDashboard from "@/pages/admin-dashboard";
import Layout from "@/components/layout";

function Router() {
  return (
    <Switch>
      <Route path="/usage-statistics">
        {() => (
          <Layout>
            <UsageStatistics />
          </Layout>
        )}
      </Route>
      <Route path="/admin-dashboard">
        {() => (
          <Layout>
            <AdminDashboard />
          </Layout>
        )}
      </Route>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
