import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Outs from "./pages/Outs";
import CreateOut from "./pages/CreateOut";
import EditOut from "./pages/EditOut";
import OutDetail from "./pages/OutDetail";
import OutChat from "./pages/OutChat";
import MyOuts from "./pages/MyOuts";
import Messages from "./pages/Messages";
import PublicProfile from "./pages/PublicProfile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/outs" element={<Outs />} />
            <Route path="/out/new" element={<CreateOut />} />
          <Route path="/out/:id" element={<OutDetail />} />
          <Route path="/out/:id/edit" element={<EditOut />} />
            <Route path="/out/:id/chat" element={<OutChat />} />
            <Route path="/my-outs" element={<MyOuts />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<PublicProfile />} />
            <Route path="/u/:handle" element={<PublicProfile />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
