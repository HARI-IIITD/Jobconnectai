import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainSelection from "./pages/MainSelection";
import HRLogin from "./pages/hr/HRLogin";
import HRDashboard from "./pages/hr/HRDashboard";
import HRProfile from "./pages/hr/HRProfile";
import HRCVReview from "./pages/hr/HRCVReview";
import HRChatbot from "./pages/hr/HRChatbot";
import JobFinderSignup from "./pages/job-finder/JobFinderSignup";
import JobFinderLogin from "./pages/job-finder/JobFinderLogin";
import JobFinderDashboard from "./pages/job-finder/JobFinderDashboard";
import JobFinderProfile from "./pages/job-finder/JobFinderProfile";
import JobFinderChatbot from "./pages/job-finder/JobFinderChatbot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainSelection />} />
          <Route path="/hr/login" element={<HRLogin />} />
          <Route path="/hr/dashboard" element={<HRDashboard />} />
          <Route path="/hr/profile" element={<HRProfile />} />
          <Route path="/hr/cv-review" element={<HRCVReview />} />
          <Route path="/hr/chatbot" element={<HRChatbot />} />
          <Route path="/job-finder/signup" element={<JobFinderSignup />} />
          <Route path="/job-finder/login" element={<JobFinderLogin />} />
          <Route path="/job-finder/dashboard" element={<JobFinderDashboard />} />
          <Route path="/job-finder/profile" element={<JobFinderProfile />} />
          <Route path="/job-finder/chatbot" element={<JobFinderChatbot />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
