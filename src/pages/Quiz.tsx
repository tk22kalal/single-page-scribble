
import { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Quiz as QuizComponent } from "@/components/Quiz";
import { UserProfile } from "@/components/UserProfile";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if the state has been passed from the setup page
  const { subject, chapter, topic, difficulty, questionCount, timeLimit, simultaneousResults } = location.state || {};

  useEffect(() => {
    // Check if we have all required parameters
    if (!subject || !chapter || !difficulty || !questionCount || !timeLimit) {
      navigate("/quiz/setup");
    }

    // Update document title
    document.title = `${subject} Quiz | MedquizAI`;
  }, [subject, chapter, difficulty, questionCount, timeLimit, navigate]);

  // Check if ApiKey exists
  const apiKey = localStorage.getItem("groq_api_key");
  if (!apiKey) {
    return <ApiKeyInput onSave={() => window.location.reload()} />;
  }

  // If we don't have required parameters, redirect to setup
  if (!subject || !chapter || !difficulty || !questionCount || !timeLimit) {
    return <Navigate to="/quiz/setup" replace />;
  }

  return (
    <div className="min-h-screen bg-medbg dark:bg-gray-900">
      <div className="fixed top-4 right-4 z-50">
        <UserProfile />
      </div>
      <QuizComponent 
        subject={subject}
        chapter={chapter}
        topic={topic || ""}
        difficulty={difficulty}
        questionCount={questionCount}
        timeLimit={timeLimit}
        simultaneousResults={simultaneousResults !== undefined ? simultaneousResults : true}
      />
    </div>
  );
};

export default Quiz;
