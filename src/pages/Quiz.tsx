
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Quiz as QuizComponent } from "@/components/Quiz";

const Quiz = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const location = useLocation();
  const quizParams = location.state;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      // Check if API key exists
      const apiKey = localStorage.getItem("GROQ_API_KEY");
      setHasApiKey(!!apiKey);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (!hasApiKey) {
    return <Navigate to="/quiz/setup" />;
  }

  if (!quizParams) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizComponent {...quizParams} />
    </div>
  );
};

export default Quiz;
