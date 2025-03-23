
import { AuthForm } from "@/components/AuthForm";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = location.state?.redirectTo || "/";

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(redirectTo);
      }
    };
    
    checkAuth();
  }, [navigate, redirectTo]);

  const handleAuthSuccess = () => {
    navigate(redirectTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <AuthForm onAuthSuccess={handleAuthSuccess} />
    </div>
  );
};

export default Auth;
