
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, BookOpenText, MessageCircleQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SquareAd } from "./ads/SquareAd";
import { Textarea } from "./ui/textarea";
import { handleDoubt } from "@/services/groqService";
import { toast } from "sonner";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
}

interface DoubtMessage {
  type: 'doubt' | 'answer';
  content: string;
}

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  questions?: Question[];
  answers?: Record<number, string>;
  onJumpToQuestion?: (index: number) => void;
  simultaneousResults?: boolean;
}

export const QuizResults = ({ 
  score, 
  totalQuestions,
  subject,
  chapter,
  topic,
  difficulty,
  questions = [],
  answers = {},
  onJumpToQuestion,
  simultaneousResults = true
}: QuizResultsProps) => {
  const [userName, setUserName] = useState<string>("");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [doubt, setDoubt] = useState("");
  const [doubtMessages, setDoubtMessages] = useState<Record<number, DoubtMessage[]>>({});
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
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

  const handleAskDoubt = async (questionIndex: number) => {
    if (!doubt.trim()) {
      toast.error("Please enter your doubt first");
      return;
    }

    if (!questions[questionIndex]) return;
    const question = questions[questionIndex];

    setIsLoadingAnswer(true);
    const newDoubtMessage = { type: 'doubt' as const, content: doubt };
    
    setDoubtMessages(prev => ({
      ...prev,
      [questionIndex]: [...(prev[questionIndex] || []), newDoubtMessage]
    }));

    const answer = await handleDoubt(
      doubt,
      question.question,
      question.options,
      question.correctAnswer,
      question.explanation
    );

    if (answer) {
      setDoubtMessages(prev => ({
        ...prev,
        [questionIndex]: [
          ...(prev[questionIndex] || []), 
          { type: 'answer' as const, content: answer }
        ]
      }));
    }

    setDoubt("");
    setIsLoadingAnswer(false);
  };

  const handleJumpToQuestion = (index: number) => {
    if (onJumpToQuestion && !simultaneousResults) {
      onJumpToQuestion(index);
      navigate(-1);
    } else {
      setSelectedQuestionIndex(index);
      setShowExplanation(false);
    }
  };
  
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
          
          {/* Question review section */}
          {questions.length > 0 && (
            <div className="mt-6 text-left">
              <h3 className="font-semibold text-lg mb-4">Review Questions</h3>
              
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm ${
                      index === selectedQuestionIndex
                        ? 'bg-medblue text-white'
                        : answers[index] === questions[index].correctAnswer
                        ? 'bg-green-100 border-green-500 border-2'
                        : answers[index]
                        ? 'bg-red-100 border-red-500 border-2'
                        : 'bg-gray-100 border'
                    }`}
                    onClick={() => handleJumpToQuestion(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              {selectedQuestionIndex !== null && (
                <Card className="p-4 mb-6">
                  <h4 className="font-medium text-lg">
                    Question {selectedQuestionIndex + 1}: {questions[selectedQuestionIndex].question}
                  </h4>
                  
                  <div className="mt-4 space-y-2">
                    {questions[selectedQuestionIndex].options.map((option, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded border ${
                          option[0] === questions[selectedQuestionIndex].correctAnswer
                            ? 'bg-green-50 border-green-300'
                            : answers[selectedQuestionIndex] === option[0]
                            ? 'bg-red-50 border-red-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      onClick={() => setShowExplanation(!showExplanation)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <BookOpenText className="h-4 w-4" />
                      {showExplanation ? "Hide" : "Show"} Explanation
                    </Button>
                  </div>
                  
                  {showExplanation && (
                    <div className="mt-4">
                      <h5 className="font-medium">Explanation:</h5>
                      <p className="mt-2 text-gray-700">{questions[selectedQuestionIndex].explanation}</p>
                    </div>
                  )}
                  
                  <div className="mt-6 border-t pt-4">
                    <h5 className="font-medium flex items-center gap-2 mb-3">
                      <MessageCircleQuestion className="h-5 w-5 text-medblue" />
                      Ask a Doubt
                    </h5>
                    
                    <div className="space-y-4">
                      {doubtMessages[selectedQuestionIndex]?.map((message, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            message.type === 'doubt'
                              ? 'bg-blue-50 ml-auto max-w-[80%]'
                              : 'bg-gray-50 mr-auto max-w-[80%]'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Ask any doubt about this question..."
                          value={doubt}
                          onChange={(e) => setDoubt(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => handleAskDoubt(selectedQuestionIndex)}
                          disabled={isLoadingAnswer}
                          className="self-end"
                        >
                          Ask Doubt
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
          
          <div className="mt-8">
            <button 
              onClick={() => navigate("/quiz/setup")}
              className="relative px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <span className="relative z-10">New Quiz</span>
              <div className="absolute inset-0 bg-white opacity-20 transform rotate-12 translate-y-12"></div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
