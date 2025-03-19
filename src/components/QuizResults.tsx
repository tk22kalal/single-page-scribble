
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SquareAd } from "./ads/SquareAd";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
}

export const QuizResults = ({ 
  score, 
  totalQuestions,
  subject,
  chapter,
  topic,
  difficulty
}: QuizResultsProps) => {
  const [userName, setUserName] = useState<string>("");
  const percentage = Math.round((score / totalQuestions) * 100);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
          
          setUserName(userData?.name || 'User');
        }
      } catch (error: any) {
        console.error('Error fetching user name:', error);
      }
    };
    
    fetchUserName();
  }, []);
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="text-center mt-16">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {userName && (
            <div className="text-xl text-gray-600">
              Great job, {userName}!
            </div>
          )}
          <div className="text-4xl font-bold text-medical-blue">
            {score} / {totalQuestions}
          </div>
          <div className="text-2xl text-gray-600">
            {percentage}% Correct
          </div>
          
          {/* Ad within results */}
          <div className="my-4">
            <SquareAd />
          </div>
          
          <div className="mt-8">
            <button 
              onClick={() => navigate("/quiz/setup")}
              className="relative px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <span className="relative z-10">Let's Do Again</span>
              <div className="absolute inset-0 bg-white opacity-20 transform rotate-12 translate-y-12"></div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
