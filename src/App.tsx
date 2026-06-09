import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Analytics from "./components/Analytics";
import PublicAgentWidget from "./components/agent/PublicAgentWidget";

// Public pages
import Index from "./pages/Index";
import Tech from "./pages/Tech";
import TechAbout from "./pages/TechAbout";
import Consulting from "./pages/Consulting";
import Travel from "./pages/Travel";
import Malok from "./pages/Malok";
import NotFound from "./pages/NotFound";
import ClientPortalLogin from "./pages/ClientPortalLogin";
import ClientPortalDashboard from "./pages/ClientPortalDashboard";
import SeoLandingPage from "./pages/SeoLandingPage";
import SeoArticlePage from "./pages/SeoArticlePage";
import SeoToolPage from "./pages/SeoToolPage";
import SeoDirectoryPage from "./pages/SeoDirectoryPage";
import PartnersPage from "./pages/PartnersPage";
import Threedmt from "./pages/Threedmt";

// Admin pages
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import AdminGuard from "./components/AdminGuard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminBudget from "./pages/admin/AdminBudget";
import AdminCompany from "./pages/admin/AdminCompany";
import AdminContracts from "./pages/admin/AdminContracts";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminDept from "./pages/admin/AdminDept";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminContractValue from "./pages/admin/AdminContractValue";
import AdminPermissions from "./pages/admin/AdminPermissions";
import AdminExpenses from "./pages/admin/AdminExpenses";
import AdminAnnouncement from "./pages/admin/AdminAnnouncement";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminClients from "./pages/admin/AdminClients";
import AdminPipeline from "./pages/admin/AdminPipeline";
import AdminBalance from "./pages/admin/AdminBalance";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminAgentChat from "./pages/admin/AdminAgentChat";
import AdminAgentWork from "./pages/admin/AdminAgentWork";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminAuthProvider>
        <BrowserRouter>
          <Analytics />
          <PublicAgentWidget />
          <Routes>
            {/* ── Public routes ───────────────────────────────────────── */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<Index />} />
            <Route path="/contact" element={<Index />} />
            <Route path="/tech" element={<Tech />} />
            <Route path="/tech/about" element={<TechAbout />} />
            <Route path="/consulting" element={<Consulting />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/malok" element={<Malok />} />
            <Route path="/insights" element={<SeoDirectoryPage />} />
            <Route path="/insights/:slug" element={<SeoArticlePage />} />
            <Route path="/tools" element={<SeoDirectoryPage />} />
            <Route path="/tools/:slug" element={<SeoToolPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/3dmt" element={<Threedmt />} />
            <Route path="/:category/:slug" element={<SeoLandingPage />} />
            <Route path="/client/login" element={<ClientPortalLogin />} />
            <Route path="/client/dashboard" element={<ClientPortalDashboard />} />

            {/* ── Admin auth ──────────────────────────────────────────── */}
            <Route path="/memo/login" element={<AdminLogin />} />

            {/* Redirect bare /memo to /memo/login */}
            <Route path="/memo" element={<Navigate to="/memo/login" replace />} />

            {/* ── Protected admin routes ──────────────────────────────── */}
            <Route
              path="/memo/*"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="budget" element={<AdminBudget />} />
              <Route path="company" element={<AdminCompany />} />
              <Route path="contracts" element={<AdminContracts />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="dept/:dept" element={<AdminDept />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="contract-value" element={<AdminContractValue />} />
              <Route path="permissions" element={<AdminPermissions />} />
              <Route path="expenses" element={<AdminExpenses />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="announcements" element={<AdminAnnouncement />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="pipeline" element={<AdminPipeline />} />
              <Route path="balance" element={<AdminBalance />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="agent" element={<AdminAgentChat />} />
              <Route path="agent/work" element={<AdminAgentWork />} />
              {/* Default admin child */}
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* ── Catch-all ───────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
