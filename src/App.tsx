
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import QuizSetup from "./pages/QuizSetup";
import Quiz from "./pages/Quiz";
import Privacy from "./pages/Privacy";
import Disclaimer from "./pages/Disclaimer";
import { ApiKeyInput } from "./components/ApiKeyInput";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// SEO component to update meta tags
const SEO = () => {
  const location = useLocation();

  useEffect(() => {
    // Update meta tags based on current route
    const path = location.pathname;
    let title = "Medquiz: AI-Powered Medical Exam Question Bank";
    let description = "Free medical question bank for NEET PG, INI-CET, FMGE, USMLE, and MBBS preparation.";

    switch (path) {
      case '/blog':
        title = "Medical Education Blog - Latest Updates & Study Guides | MedquizAI";
        description = "Access comprehensive medical education resources, study guides, and exam preparation tips.";
        break;
      case '/quiz/setup':
        title = "Customize Your Medical Quiz | MedquizAI";
        description = "Create personalized medical practice tests with our AI-powered quiz system.";
        break;
      case '/privacy-policy':
        title = "Privacy Policy | MedquizAI";
        break;
      case '/disclaimer':
        title = "Disclaimer | MedquizAI";
        break;
    }

    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
  }, [location]);

  return null;
};

const App = () => {
  // Check if we're on a direct HTML page
  const path = window.location.pathname;
  if (path === '/privacy-policy.html') {
    window.location.href = '/privacy-policy';
    return null;
  }
  if (path === '/disclaimer.html') {
    window.location.href = '/disclaimer';
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SEO />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/apikey" element={<ApiKeyInput onSave={() => {}} />} />
            <Route path="/quiz/setup" element={<QuizSetup />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/privacy-policy" element={<Privacy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
