import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import ChatBot from "./pages/ChatBot";
import AdminDashboard from "./pages/AdminDashboard";
import LoanSimulator from "./pages/LoanSimulator";
import Login from "./pages/Login";
import KYC from "./pages/KYC";
import FraudMonitoring from "./pages/FraudMonitoring";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<ChatBot />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/loan-simulator" element={<LoanSimulator />} />
            <Route path="/kyc" element={<KYC />} />
            <Route path="/fraud-monitoring" element={<FraudMonitoring />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
