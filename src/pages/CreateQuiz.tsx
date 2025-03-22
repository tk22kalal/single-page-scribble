
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HorizontalAd } from "@/components/ads/HorizontalAd";
import { saveCustomQuiz, CustomQuiz } from "@/services/mongoService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Image, Save, Link, Share } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const questionCounts = ["1", "2", "3", "5", "10", "15", "20"];
const timePerQuestionOptions = ["30", "45", "60", "90", "120", "No Limit"];

interface Question {
  questionText: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState("");
  const [questionCount, setQuestionCount] = useState<string>("5");
  const [timePerQuestion, setTimePerQuestion] = useState<string>("60");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [quizShareUrl, setQuizShareUrl] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        setUserId(session.user.id);
        
        // Fetch user's name
        const { data: userData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single();
        
        setUserName(userData?.name || 'Anonymous User');
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    // Initialize questions array based on selected count
    const count = parseInt(questionCount);
    if (count > 0) {
      const newQuestions = Array(count).fill(null).map(() => ({
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "A",
        explanation: ""
      }));
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
    }
  }, [questionCount]);

  const handleQuestionChange = (field: keyof Question, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[currentQuestionIndex].options];
    options[index] = value;
    updatedQuestions[currentQuestionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].correctAnswer = value;
    setQuestions(updatedQuestions);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        setIsLoading(true);
        const file = files[0];
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('quiz-images')
          .upload(`${userId}/${Date.now()}-${file.name}`, file);
        
        if (error) throw error;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('quiz-images')
          .getPublicUrl(data.path);
        
        // Update question with image URL
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex].imageUrl = publicUrl;
        setQuestions(updatedQuestions);
        
        toast.success("Image uploaded successfully");
      } catch (error: any) {
        console.error("Error uploading image:", error);
        toast.error(error.message || "Failed to upload image");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const saveQuiz = async () => {
    try {
      if (!quizTitle.trim()) {
        toast.error("Please enter a quiz title");
        return;
      }
      
      // Validate all questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText.trim()) {
          toast.error(`Question ${i + 1} is missing text`);
          setCurrentQuestionIndex(i);
          return;
        }
        
        if (q.options.some(opt => !opt.trim())) {
          toast.error(`Question ${i + 1} has empty options`);
          setCurrentQuestionIndex(i);
          return;
        }
        
        if (!q.explanation.trim()) {
          toast.error(`Question ${i + 1} is missing explanation`);
          setCurrentQuestionIndex(i);
          return;
        }
      }
      
      setIsLoading(true);
      
      const quiz: CustomQuiz = {
        creatorId: userId || undefined,
        creatorName: userName,
        title: quizTitle,
        questionCount: questions.length,
        timePerQuestion: timePerQuestion === "No Limit" ? 0 : parseInt(timePerQuestion),
        questions: questions.map(q => ({
          questionText: q.questionText,
          imageUrl: q.imageUrl,
          options: q.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        })),
        createdAt: new Date()
      };
      
      const quizId = await saveCustomQuiz(quiz);
      
      toast.success("Quiz created successfully!");
      
      // Generate share URL
      const shareUrl = `${window.location.origin}/custom-quiz/${quizId}`;
      setQuizShareUrl(shareUrl);
      setShowShareDialog(true);
      
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      toast.error(error.message || "Failed to save quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(quizShareUrl);
    toast.success("Link copied to clipboard");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-medbg dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-medblue dark:text-white mb-8">Create Your Own Quiz</h1>
        
        {/* Quiz Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quiz Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quizTitle">Quiz Title</Label>
              <Input
                id="quizTitle"
                placeholder="Enter quiz title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questionCount">Number of Questions</Label>
              <Select
                value={questionCount}
                onValueChange={(value) => {
                  if (questions.length > 0) {
                    if (confirm("Changing question count will reset all questions. Continue?")) {
                      setQuestionCount(value);
                    }
                  } else {
                    setQuestionCount(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question count" />
                </SelectTrigger>
                <SelectContent>
                  {questionCounts.map((count) => (
                    <SelectItem key={count} value={count}>
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timePerQuestion">Time per Question (seconds)</Label>
              <Select 
                value={timePerQuestion} 
                onValueChange={setTimePerQuestion}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time per question" />
                </SelectTrigger>
                <SelectContent>
                  {timePerQuestionOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time} {time !== "No Limit" ? "seconds" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Question Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <div className="flex space-x-2">
              {currentQuestionIndex > 0 && (
                <Button
                  variant="outline" 
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                >
                  Previous
                </Button>
              )}
              {currentQuestionIndex < questions.length - 1 && (
                <Button 
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="questionText">Question Text</Label>
              <Textarea
                id="questionText"
                placeholder="Enter your question"
                className="h-24"
                value={questions[currentQuestionIndex]?.questionText || ""}
                onChange={(e) => handleQuestionChange("questionText", e.target.value)}
              />
            </div>
            
            <div>
              <Label className="block mb-2">Question Image (Optional)</Label>
              <div className="flex flex-col items-start gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Button type="button" variant="outline" size="sm">
                    <Image className="mr-2" size={16} />
                    Upload Image
                  </Button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                
                {questions[currentQuestionIndex]?.imageUrl && (
                  <div className="relative">
                    <img 
                      src={questions[currentQuestionIndex]?.imageUrl} 
                      alt="Question" 
                      className="max-h-48 rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        const updatedQuestions = [...questions];
                        delete updatedQuestions[currentQuestionIndex].imageUrl;
                        setQuestions(updatedQuestions);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label className="block mb-2">Options</Label>
              <div className="space-y-3">
                {questions[currentQuestionIndex]?.options.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              <Select 
                value={questions[currentQuestionIndex]?.correctAnswer || "A"} 
                onValueChange={handleCorrectAnswerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea
                id="explanation"
                placeholder="Explain the correct answer"
                className="h-24"
                value={questions[currentQuestionIndex]?.explanation || ""}
                onChange={(e) => handleQuestionChange("explanation", e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Save Quiz */}
        <div className="flex justify-end">
          <Button onClick={saveQuiz} className="bg-medblue hover:bg-medblue/90">
            <Save className="mr-2" />
            Save and Share Quiz
          </Button>
        </div>
        
        {/* Ad */}
        <div className="mt-8">
          <HorizontalAd />
        </div>
      </div>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Quiz</DialogTitle>
            <DialogDescription>
              Your quiz has been created successfully! Share this link with friends.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-2 mt-4">
            <Input value={quizShareUrl} readOnly />
            <Button onClick={copyShareLink} size="sm">
              <Link size={16} className="mr-2" />
              Copy
            </Button>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default CreateQuiz;
