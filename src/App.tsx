
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
import CreateQuiz from "./pages/CreateQuiz";
import CustomQuiz from "./pages/CustomQuiz";

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
      case '/create-quiz':
        title = "Make Your Own Questions | MedquizAI";
        description = "Create custom quizzes, share with friends, and track results with our quiz creator.";
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
  // Wrap the Index component in an error boundary to prevent white screen on error
  const SafeComponent = (Component: any) => {
    return (props: any) => {
      try {
        return <Component {...props} />;
      } catch (error) {
        console.error("Error rendering component:", error);
        return <div className="p-10">
          <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
          <p className="mt-4">There was an error loading this page. Please try again later.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => window.location.href = "/"}
          >
            Return to Home
          </button>
        </div>;
      }
    };
  };

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
            <Route path="/" element={<SafeComponent(Index)/>} />
            <Route path="/blog" element={<SafeComponent(Blog)/>} />
            <Route path="/auth" element={<SafeComponent(Auth)/>} />
            <Route path="/apikey" element={<SafeComponent(ApiKeyInput)} onSave={() => {}} />
            <Route path="/quiz/setup" element={<SafeComponent(QuizSetup)/>} />
            <Route path="/quiz" element={<SafeComponent(Quiz)/>} />
            <Route path="/create-quiz" element={<SafeComponent(CreateQuiz)/>} />
            <Route path="/custom-quiz/:quizId" element={<SafeComponent(CustomQuiz)/>} />
            <Route path="/privacy-policy" element={<SafeComponent(Privacy)/>} />
            <Route path="/disclaimer" element={<SafeComponent(Disclaimer)/>} />
            <Route path="/404" element={<SafeComponent(NotFound)/>} />
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
