
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { getCustomQuiz, saveQuizResult, CustomQuiz as CustomQuizType } from "@/services/mongoService";
import { supabase } from "@/integrations/supabase/client";
import { HorizontalAd } from "@/components/ads/HorizontalAd";
import { InArticleAd } from "@/components/ads/InArticleAd";
import { Trophy, Clock } from "lucide-react";

interface Question {
  questionText: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Participant {
  userId: string;
  userName: string;
  score: number;
  completedAt: Date;
}

const CustomQuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [quiz, setQuiz] = useState<CustomQuizType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth", { state: { redirectTo: `/custom-quiz/${quizId}` } });
          return;
        }
        
        setUserId(session.user.id);
        
        // Get user's name
        const { data: userData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single();
        
        setUserName(userData?.name || 'Anonymous User');
        
        // Fetch quiz data
        if (!quizId) {
          toast.error("Quiz ID is missing");
          navigate("/");
          return;
        }
        
        const quizData = await getCustomQuiz(quizId);
        
        if (!quizData) {
          toast.error("Quiz not found");
          navigate("/");
          return;
        }
        
        setQuiz(quizData);
        
        // Set time limit if specified
        if (quizData.timePerQuestion > 0) {
          setTimeRemaining(quizData.timePerQuestion);
        }
        
        // Set leaderboard
        if (quizData.participants && quizData.participants.length > 0) {
          // Sort by score (descending)
          const sortedParticipants = [...quizData.participants].sort((a, b) => b.score - a.score);
          setLeaderboard(sortedParticipants);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error("Failed to load quiz");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [quizId, navigate]);
  
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !showExplanation && !isQuizComplete) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, showExplanation, isQuizComplete]);
  
  useEffect(() => {
    if (timeRemaining === 0 && !selectedAnswer) {
      toast.error("Time's up!");
      // Auto-select an answer or move to next
      handleNextQuestion();
    }
  }, [timeRemaining, selectedAnswer]);
  
  const getOptionStyle = (option: string) => {
    if (!selectedAnswer) {
      return "bg-white text-black hover:bg-gray-100 font-normal";
    }
    
    const isCorrect = option[0] === quiz?.questions[currentQuestionIndex]?.correctAnswer;
    
    if (isCorrect) {
      return "bg-[#E7F8E9] text-black border-[#86D492] font-normal";
    }
    
    if (selectedAnswer === option[0] && !isCorrect) {
      return "bg-[#FFE9E9] text-black border-[#FF8989] font-normal";
    }
    
    return "bg-white text-black font-normal";
  };
  
  const handleAnswerSelect = (answer: string) => {
    if (!selectedAnswer && (timeRemaining === null || timeRemaining > 0)) {
      setSelectedAnswer(answer);
      if (answer === quiz?.questions[currentQuestionIndex]?.correctAnswer) {
        setScore(prev => prev + 1);
      }
    }
  };
  
  const handleNextQuestion = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      
      // Reset timer for next question
      if (quiz.timePerQuestion > 0) {
        setTimeRemaining(quiz.timePerQuestion);
      }
    } else {
      // Quiz complete
      finishQuiz();
    }
  };
  
  const finishQuiz = async () => {
    if (!quiz || !userId || !quizId) return;
    
    try {
      setIsLoading(true);
      
      // Save results to database
      await saveQuizResult(quizId, userId, userName, score);
      
      // Update leaderboard
      const updatedQuiz = await getCustomQuiz(quizId);
      
      if (updatedQuiz?.participants) {
        const sortedParticipants = [...updatedQuiz.participants].sort((a, b) => b.score - a.score);
        setLeaderboard(sortedParticipants);
      }
      
      setIsQuizComplete(true);
      toast.success("Quiz completed!");
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast.error("Failed to save results");
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!quiz) {
    return <div className="flex items-center justify-center min-h-screen">Quiz not found</div>;
  }
  
  if (isQuizComplete) {
    return (
      <div className="min-h-screen bg-medbg dark:bg-gray-900">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-medblue dark:text-white mb-2">
                Quiz Completed!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                {quiz.title}
              </p>
              
              <div className="text-4xl font-bold text-medblue dark:text-white mb-8">
                Your Score: {score} / {quiz.questions.length}
                <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                  ({Math.round((score / quiz.questions.length) * 100)}%)
                </p>
              </div>
              
              <HorizontalAd />
              
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-medblue dark:text-white mb-4">
                  Leaderboard
                </h2>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-600">
                      <tr>
                        <th className="py-3 px-4 text-left">Rank</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Score</th>
                        <th className="py-3 px-4 text-left">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((participant, index) => {
                        const isCurrentUser = participant.userId === userId;
                        return (
                          <tr 
                            key={`${participant.userId}-${index}`}
                            className={`
                              border-b border-gray-200 dark:border-gray-600
                              ${isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                            `}
                          >
                            <td className="py-3 px-4">{index + 1}</td>
                            <td className="py-3 px-4 font-medium">
                              {participant.userName}
                              {isCurrentUser && " (You)"}
                            </td>
                            <td className="py-3 px-4">{participant.score} / {quiz.questions.length}</td>
                            <td className="py-3 px-4">
                              {Math.round((participant.score / quiz.questions.length) * 100)}%
                            </td>
                          </tr>
                        );
                      })}
                      
                      {leaderboard.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500">
                            Be the first to complete this quiz!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-medblue hover:bg-medblue/90"
                >
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-medbg dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-medblue dark:text-white">
              {quiz.title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-lg">Score: {score}</div>
              {timeRemaining !== null && (
                <div className="flex items-center gap-1 text-lg">
                  <Clock size={20} />
                  {formatTime(timeRemaining)}
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-medblue h-2.5 rounded-full" 
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.questionText}</h2>
            
            {currentQuestion.imageUrl && (
              <div className="mb-4">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question" 
                  className="max-h-64 rounded-md mx-auto"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(option[0])}
                className={`w-full text-left justify-start border ${getOptionStyle(option)} overflow-x-auto whitespace-normal min-h-[48px] h-auto px-4 py-3 hover:bg-gray-100 active:bg-gray-100 transition-colors`}
                disabled={!!selectedAnswer || timeRemaining === 0}
                variant="outline"
              >
                <span className="break-words text-base">{option}</span>
              </Button>
            ))}
          </div>
          
          {selectedAnswer && (
            <div className="mt-6">
              <Button
                onClick={() => setShowExplanation(!showExplanation)}
                variant="outline"
                className="mb-4"
              >
                {showExplanation ? "Hide" : "Show"} Explanation
              </Button>
              
              {showExplanation && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
                  <p className="text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
                </div>
              )}
              
              <Button 
                onClick={handleNextQuestion} 
                className="bg-medblue hover:bg-medblue/90"
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            </div>
          )}
        </div>
        
        <InArticleAd />
      </div>
      
      <Footer />
    </div>
  );
};

export default CustomQuizPage;
