
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UserProfile } from "@/components/UserProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateRandomCode } from "@/lib/utils";

const CreateQuiz = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [timePerQuestion, setTimePerQuestion] = useState("60");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Create Your Own Quiz | MedquizAI";
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        navigate("/auth", { state: { redirectTo: "/quiz/create" } });
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error("Please enter a quiz title");
      return;
    }
    
    if (questionCount <= 0) {
      toast.error("Please enter a valid number of questions");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to create a quiz");
        navigate("/auth");
        return;
      }
      
      // Generate a unique access code
      const accessCode = generateRandomCode(6);
      
      // Create the quiz
      const { data: quiz, error } = await supabase
        .from('custom_quizzes')
        .insert({
          creator_id: user.id,
          title,
          description,
          question_count: questionCount,
          time_per_question: timePerQuestion,
          access_code: accessCode
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Quiz created successfully!");
      navigate(`/quiz/edit/${quiz.id}`);
    } catch (error: any) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-medbg dark:bg-gray-900">
      <Navbar />
      
      <div className="fixed top-4 right-4 z-50">
        <UserProfile />
      </div>
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-medblue dark:text-white mb-6">
            Create Your Own Quiz
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                placeholder="Enter quiz title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter quiz description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Enter number of questions"
                  value={questionCount || ""}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timePerQuestion">Time per Question (seconds)</Label>
                <Select value={timePerQuestion} onValueChange={setTimePerQuestion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time per question" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="45">45 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="90">90 seconds</SelectItem>
                    <SelectItem value="120">120 seconds</SelectItem>
                    <SelectItem value="No Limit">No time limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-center">
              <Button 
                type="submit"
                className="bg-medblue hover:bg-medblue/90 text-white font-semibold px-8 py-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Continue to Add Questions"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CreateQuiz;
