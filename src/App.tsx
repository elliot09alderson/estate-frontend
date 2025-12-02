import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import AddProperty from "./pages/AddProperty";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Portfolio from "./pages/Portfolio";
import PublicPortfolio from "./pages/PublicPortfolio";
import Favorites from "./pages/Favorites";
import MyTours from "./pages/MyTours";
import AgentTours from "./pages/AgentTours";
import AdminDashboard from "./pages/AdminDashboard";
import AdminActivities from "./pages/AdminActivities";
import AdminFeedbacks from "./pages/AdminFeedbacks";
import AdminPropertyRequirements from "./pages/AdminPropertyRequirements";
import MyMessages from "./pages/MyMessages";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import ReturnPolicy from "./pages/ReturnPolicy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

const AppWithScroll = () => {
  useSmoothScroll();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <AppWithScroll />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public routes */}
                <Route index element={<Index />} />
                <Route path="properties" element={<Properties />} />
                <Route path="properties/:id" element={<PropertyDetails />} />
                <Route path="agent/:agentId" element={<PublicPortfolio />} />
                <Route path="return-policy" element={<ReturnPolicy />} />
                <Route path="terms" element={<Terms />} />
                <Route path="contact" element={<Contact />} />
                <Route path="privacy" element={<Privacy />} />
                
                {/* Protected routes - require authentication */}
                <Route
                  path="add-property"
                  element={
                    <ProtectedRoute roles={['agent', 'admin']}>
                      <AddProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="add-property/:category"
                  element={
                    <ProtectedRoute roles={['agent', 'admin']}>
                      <AddProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="favorites"
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-tours"
                  element={
                    <ProtectedRoute roles={['user']}>
                      <MyTours />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="agent-tours"
                  element={
                    <ProtectedRoute roles={['agent', 'admin']}>
                      <AgentTours />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-messages"
                  element={
                    <ProtectedRoute roles={['agent', 'admin']}>
                      <MyMessages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="portfolio"
                  element={
                    <ProtectedRoute roles={['agent', 'admin']}>
                      <Portfolio />
                    </ProtectedRoute>
                  }
                />

                {/* Admin only routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/activities"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminActivities />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/feedbacks"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminFeedbacks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/property-requirements"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminPropertyRequirements />
                    </ProtectedRoute>
                  }
                />
              </Route>
              
              {/* Auth routes - redirect to home if already logged in */}
              <Route 
                path="login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="register" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Register />
                  </ProtectedRoute>
                } 
              />
              
              {/* Error routes */}
              <Route path="unauthorized" element={<Unauthorized />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
