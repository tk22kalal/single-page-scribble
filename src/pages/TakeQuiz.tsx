
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Loader2 } from "lucide-react";

interface CustomQuiz {
  id: string;
  title: string;
  description: string | null;
  question_count: number;
  time_per_question: string | null;
  access_code: string | null;
  creator_id: string;
  created_at: string;
  updated_at: string;
  creator_name?: string; // Added this optional property
}

interface Question {
  id: string;
  question_text: string;
  image_url?: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

const TakeQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<CustomQuiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [userName, setUserName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Take Quiz | MedquizAI";
    
    const fetchQuizData = async () => {
      try {
        const { data: quizData, error: quizError } = await supabase
          .from('custom_quizzes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (quizError) throw quizError;
        
        // Create a modified quiz object with the creator_name property
        const quizWithCreator = { ...quizData, creator_name: undefined };
        
        const { data: creatorData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', quizData.creator_id)
          .single();
        
        if (creatorData) {
          quizWithCreator.creator_name = creatorData.name;
        }
        
        setQuiz(quizWithCreator);
      } catch (error: any) {
        console.error("Error fetching quiz:", error);
        toast.error("Failed to load quiz: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizData();
  }, [id]);

  useEffect(() => {
    if (!isVerified || !quiz || quiz.time_per_question === 'No Limit' || !timeLeft) return;
    
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev <= 1) {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            return parseInt(quiz.time_per_question);
          } else {
            handleSubmitQuiz();
            return 0;
          }
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [isVerified, quiz, timeLeft, currentQuestionIndex, questions.length]);

  const verifyAccessCode = async () => {
    if (!quiz) return;
    
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (accessCode !== quiz.access_code) {
      toast.error("Invalid access code");
      return;
    }
    
    try {
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions')
        .select('id, question_text, image_url, option_a, option_b, option_c, option_d, correct_answer')
        .eq('quiz_id', id);
      
      if (questionError) throw questionError;
      
      if (!questionData || questionData.length === 0) {
        toast.error("This quiz doesn't have any questions yet");
        return;
      }
      
      setQuestions(questionData);
      setIsVerified(true);
      
      if (quiz.time_per_question !== 'No Limit') {
        setTimeLeft(parseInt(quiz.time_per_question));
      }
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions: " + error.message);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      
      if (quiz && quiz.time_per_question !== 'No Limit') {
        setTimeLeft(parseInt(quiz.time_per_question));
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      
      if (quiz && quiz.time_per_question !== 'No Limit') {
        setTimeLeft(parseInt(quiz.time_per_question));
      }
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !questions.length) return;
    
    setIsSubmitting(true);
    
    try {
      let score = 0;
      questions.forEach(question => {
        if (selectedAnswers[question.id] === question.correct_answer) {
          score++;
        }
      });
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      const { data: resultData, error: resultError } = await supabase
        .from('quiz_results')
        .insert({
          quiz_id: quiz.id,
          user_id: userId || null,
          user_name: userName,
          score,
          total_questions: questions.length,
          time_taken: null
        })
        .select()
        .single();
      
      if (resultError) throw resultError;
      
      toast.success("Quiz submitted successfully!");
      navigate(`/quiz/results/${resultData.id}`);
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-medblue" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-500">Quiz not found.</p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-medbg dark:bg-gray-900">
        <Navbar />
        
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-medblue">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quiz.description && (
                  <p className="text-gray-600 dark:text-gray-300">{quiz.description}</p>
                )}
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    Created by: <span className="font-medium">{quiz.creator_name || "Anonymous"}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Questions: <span className="font-medium">{quiz.question_count}</span>
                  </p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Your Name</Label>
                    <Input
                      id="user-name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="access-code">Access Code</Label>
                    <Input
                      id="access-code"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      placeholder="Enter access code"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-medblue hover:bg-medblue/90 text-white"
                  onClick={verifyAccessCode}
                >
                  Start Quiz
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-medbg dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-medblue">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                
                {timeLeft !== null && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span className={`font-mono ${timeLeft < 10 ? 'text-red-500' : ''}`}>
                      {timeLeft}s
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{currentQuestion.question_text}</h3>
                
                {currentQuestion.image_url && (
                  <div className="my-4">
                    <img 
                      src={currentQuestion.image_url} 
                      alt="Question" 
                      className="rounded-md border border-gray-200 max-h-[300px] object-contain mx-auto"
                    />
                  </div>
                )}
              </div>
              
              <RadioGroup
                value={selectedAnswers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="A" id={`option-a-${currentQuestion.id}`} />
                  <Label htmlFor={`option-a-${currentQuestion.id}`} className="flex-1">
                    {currentQuestion.option_a}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="B" id={`option-b-${currentQuestion.id}`} />
                  <Label htmlFor={`option-b-${currentQuestion.id}`} className="flex-1">
                    {currentQuestion.option_b}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="C" id={`option-c-${currentQuestion.id}`} />
                  <Label htmlFor={`option-c-${currentQuestion.id}`} className="flex-1">
                    {currentQuestion.option_c}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="D" id={`option-d-${currentQuestion.id}`} />
                  <Label htmlFor={`option-d-${currentQuestion.id}`} className="flex-1">
                    {currentQuestion.option_d}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Quiz"
                    )}
                  </Button>
                ) : (
                  <Button
                    className="bg-medblue hover:bg-medblue/90 text-white"
                    onClick={handleNextQuestion}
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
          
          <div className="mt-6 flex justify-center">
            <div className="flex flex-wrap gap-2 max-w-xl">
              {questions.map((_, index) => (
                <button
                  key={index}
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                    index === currentQuestionIndex
                      ? 'bg-medblue text-white'
                      : selectedAnswers[questions[index].id]
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'bg-white dark:bg-gray-800 border'
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TakeQuiz;
