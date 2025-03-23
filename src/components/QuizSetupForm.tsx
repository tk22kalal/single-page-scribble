
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

interface QuizConfig {
  id: string;
  subject: string;
  chapter: string;
  topic: string | null;
  difficulty: string;
  question_count: string;
  time_limit: string;
  created_at: string;
}

interface QuizSetupFormProps {
  savedConfigs?: QuizConfig[];
}

export const QuizSetupForm = ({ savedConfigs = [] }: QuizSetupFormProps) => {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [questionCount, setQuestionCount] = useState("10");
  const [timeLimit, setTimeLimit] = useState("No Limit");
  const [simultaneousResults, setSimultaneousResults] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Quiz Setup | MedquizAI";
  }, []);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject || !chapter || !difficulty || !questionCount || !timeLimit) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Store the quiz configuration
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await supabase
          .from("quiz_configurations")
          .insert({
            user_id: session.user.id,
            subject,
            chapter,
            topic,
            difficulty,
            question_count: questionCount,
            time_limit: timeLimit
          });
      }
    } catch (error) {
      console.error("Error saving quiz configuration:", error);
    }
    
    // Navigate to the quiz page with the selected settings
    navigate("/quiz", { 
      state: { 
        subject, 
        chapter, 
        topic, 
        difficulty, 
        questionCount, 
        timeLimit,
        simultaneousResults 
      } 
    });
  };

  return (
    <div className="container max-w-2xl mx-auto mt-16">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Configuration</CardTitle>
          <CardDescription>Customize your quiz settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Anatomy"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter">Chapter</Label>
              <Textarea
                id="chapter"
                placeholder="e.g., Upper Limb"
                required
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic (Optional)</Label>
              <Input
                id="topic"
                placeholder="e.g., Brachial Plexus"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <RadioGroup defaultValue="easy" className="flex flex-col space-y-1" value={difficulty} onValueChange={setDifficulty}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="easy" id="difficulty-easy" />
                  <Label htmlFor="difficulty-easy">Easy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="difficulty-medium" />
                  <Label htmlFor="difficulty-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="difficulty-hard" />
                  <Label htmlFor="difficulty-hard">Hard</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-count">Number of Questions</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger id="question-count">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="No Limit">No Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-limit">Time Limit per Question (seconds)</Label>
              <Select value={timeLimit} onValueChange={setTimeLimit}>
                <SelectTrigger id="time-limit">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                  <SelectItem value="90">90</SelectItem>
                  <SelectItem value="120">120</SelectItem>
                  <SelectItem value="No Limit">No Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="simultaneous-results">Show Results Immediately</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="simultaneous-results" 
                  checked={simultaneousResults}
                  onCheckedChange={setSimultaneousResults}
                />
                <Label htmlFor="simultaneous-results" className="text-sm text-gray-600">
                  {simultaneousResults ? "Results shown after each question" : "Results shown at the end"}
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Choose whether to see results immediately after each answer or only at the end of the quiz.
              </p>
            </div>
            <CardFooter>
              <Button className="w-full" type="submit">
                Start Quiz
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
