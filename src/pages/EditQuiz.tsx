
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UserProfile } from "@/components/UserProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Save, Share, Trash2 } from "lucide-react";
import { QuestionFormComponent } from "@/components/QuestionFormComponent";

interface CustomQuiz {
  id: string;
  title: string;
  description: string;
  question_count: number;
  time_per_question: string;
  access_code: string;
}

interface Question {
  id?: string;
  question_text: string;
  image_url?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

const EditQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<CustomQuiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Edit Quiz | MedquizAI";
    
    const fetchQuizData = async () => {
      try {
        // Verify user authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }
        
        // Fetch quiz details
        const { data: quizData, error: quizError } = await supabase
          .from('custom_quizzes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (quizError) throw quizError;
        
        // Check if user is the creator
        if (quizData.creator_id !== session.user.id) {
          toast.error("You don't have permission to edit this quiz");
          navigate("/");
          return;
        }
        
        setQuiz(quizData);
        
        // Fetch existing questions
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', id)
          .order('created_at', { ascending: true });
        
        if (questionError) throw questionError;
        
        setQuestions(questionData || []);
        
        // If no questions exist yet, initialize with empty ones
        if (!questionData || questionData.length === 0) {
          const initialQuestions = Array(quizData.question_count).fill(null).map(() => ({
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_answer: 'A'
          }));
          setQuestions(initialQuestions);
        }
      } catch (error: any) {
        console.error("Error fetching quiz:", error);
        toast.error("Failed to load quiz: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizData();
  }, [id, navigate]);

  const handleQuestionChange = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const handleSaveQuiz = async () => {
    if (!quiz) return;
    
    // Validate all questions are complete
    const incompleteIndex = questions.findIndex(
      q => !q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d
    );
    
    if (incompleteIndex !== -1) {
      toast.error(`Question ${incompleteIndex + 1} is incomplete. Please fill in all required fields.`);
      return;
    }
    
    setIsSaving(true);
    
    try {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        if (question.id) {
          // Update existing question
          const { error } = await supabase
            .from('quiz_questions')
            .update({
              question_text: question.question_text,
              image_url: question.image_url,
              option_a: question.option_a,
              option_b: question.option_b,
              option_c: question.option_c,
              option_d: question.option_d,
              correct_answer: question.correct_answer,
              explanation: question.explanation
            })
            .eq('id', question.id);
          
          if (error) throw error;
        } else {
          // Insert new question
          const { error } = await supabase
            .from('quiz_questions')
            .insert({
              quiz_id: quiz.id,
              question_text: question.question_text,
              image_url: question.image_url,
              option_a: question.option_a,
              option_b: question.option_b,
              option_c: question.option_c,
              option_d: question.option_d,
              correct_answer: question.correct_answer,
              explanation: question.explanation
            });
          
          if (error) throw error;
        }
      }
      
      toast.success("Quiz saved successfully!");
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      toast.error("Failed to save quiz: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareQuiz = () => {
    if (!quiz) return;
    
    const shareUrl = `${window.location.origin}/quiz/take/${quiz.id}`;
    const shareText = `Take my quiz "${quiz.title}" using the access code: ${quiz.access_code}`;
    
    if (navigator.share) {
      navigator.share({
        title: quiz.title,
        text: shareText,
        url: shareUrl
      }).catch(err => {
        console.error('Error sharing:', err);
        copyToClipboard(shareText + " " + shareUrl);
      });
    } else {
      copyToClipboard(shareText + " " + shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Share information copied to clipboard!");
    }).catch(err => {
      console.error('Error copying text:', err);
      toast.error("Failed to copy to clipboard");
    });
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
        <p className="text-xl text-red-500">Quiz not found or you don't have permission to edit it.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medbg dark:bg-gray-900">
      <Navbar />
      
      <div className="fixed top-4 right-4 z-50">
        <UserProfile />
      </div>
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-medblue">{quiz.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="text-sm text-gray-500">
                  Questions: <span className="font-semibold">{quiz.question_count}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Time per question: <span className="font-semibold">{quiz.time_per_question}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Access code: <span className="font-semibold text-medblue">{quiz.access_code}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 justify-end">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleShareQuiz}
                >
                  <Share className="h-4 w-4" />
                  Share Quiz
                </Button>
                <Button 
                  className="bg-medblue hover:bg-medblue/90 text-white flex items-center gap-2"
                  onClick={handleSaveQuiz}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? "Saving..." : "Save Quiz"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-8">
            {questions.map((question, index) => (
              <QuestionFormComponent
                key={index}
                questionNumber={index + 1}
                question={question}
                onChange={(updatedQuestion) => handleQuestionChange(index, updatedQuestion)}
              />
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              className="bg-medblue hover:bg-medblue/90 text-white flex items-center gap-2"
              onClick={handleSaveQuiz}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save All Questions"}
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EditQuiz;
