import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlayCircle } from "lucide-react";

interface SavedConfig {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  question_count: string;
  time_limit: string;
}

interface QuizSetupFormProps {
  savedConfigs?: SavedConfig[];
}

const subjects = [
  "Complete MBBS",
  "Anatomy",
  "Physiology",
  "Biochemistry",
  "Pathology",
  "Pharmacology",
  "Microbiology",
  "Medicine",
  "Surgery",
  "Obstetrics & Gynecology",
  "Pediatrics"
];

const chapters = {
  Anatomy: ["Complete Subject", "Head & Neck", "Thorax", "Abdomen", "Upper Limb", "Lower Limb", "Neuroanatomy"],
  Physiology: ["Complete Subject", "General Physiology", "Blood", "Nerve-Muscle", "CNS", "CVS", "Respiratory", "Renal", "GIT", "Endocrine"],
  // ... Add chapters for other subjects as needed
};

const difficultyLevels = ["Easy", "Medium", "Hard"];
const questionCounts = ["5", "10", "15", "20", "30", "50", "No Limit"];
const timePerQuestion = ["30", "45", "60", "90", "120", "No Limit"];

export const QuizSetupForm = ({ savedConfigs = [] }: QuizSetupFormProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [specificTopic, setSpecificTopic] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [questionCount, setQuestionCount] = useState<string>("10");
  const [timeLimit, setTimeLimit] = useState<string>("60");
  const navigate = useNavigate();

  const handleStartQuiz = async () => {
    if (!selectedSubject) {
      toast.error("Please select a subject");
      return;
    }

    if (selectedSubject !== "Complete MBBS" && !selectedChapter) {
      toast.error("Please select a chapter");
      return;
    }

    try {
      // Save configuration
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('quiz_configurations').insert({
          user_id: user.id,
          subject: selectedSubject,
          chapter: selectedChapter,
          topic: specificTopic,
          difficulty,
          question_count: questionCount,
          time_limit: timeLimit
        });

        if (error) throw error;
      }

      // Navigate to quiz page with settings
      navigate("/quiz", {
        state: {
          subject: selectedSubject,
          chapter: selectedChapter,
          topic: specificTopic,
          difficulty: difficulty.toLowerCase(),
          questionCount,
          timeLimit,
        },
      });
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      toast.error("Failed to save configuration");
    }
  };

  const loadConfiguration = (config: SavedConfig) => {
    setSelectedSubject(config.subject);
    setSelectedChapter(config.chapter);
    setSpecificTopic(config.topic || "");
    setDifficulty(config.difficulty);
    setQuestionCount(config.question_count);
    setTimeLimit(config.time_limit);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-medical-blue">
          NEET PG Quiz Setup
        </h1>
        {savedConfigs.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Load Saved Configuration</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Saved Configurations</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {savedConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      loadConfiguration(config);
                      const dialogClose = document.querySelector('[data-radix-collection-item]');
                      if (dialogClose instanceof HTMLElement) {
                        dialogClose.click();
                      }
                    }}
                  >
                    <div className="font-medium">{config.subject}</div>
                    <div className="text-sm text-gray-500">
                      {config.chapter} {config.topic && `- ${config.topic}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      Difficulty: {config.difficulty}, Questions: {config.question_count}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select onValueChange={setSelectedSubject} value={selectedSubject}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-2">
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chapter">Chapter</Label>
          <Select 
            onValueChange={setSelectedChapter} 
            value={selectedChapter}
            disabled={!selectedSubject || selectedSubject === "Complete MBBS"}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select Chapter" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-2">
              {selectedSubject && chapters[selectedSubject as keyof typeof chapters]?.map((chapter) => (
                <SelectItem key={chapter} value={chapter}>
                  {chapter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Specific Topic (Optional)</Label>
          <Input
            id="topic"
            placeholder="Enter specific topic"
            value={specificTopic}
            onChange={(e) => setSpecificTopic(e.target.value)}
            disabled={!selectedChapter || selectedChapter === "Complete Subject"}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select onValueChange={setDifficulty} value={difficulty}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-2">
              {difficultyLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="questionCount">Number of Questions</Label>
          <Select onValueChange={setQuestionCount} value={questionCount}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select Question Count" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-2">
              {questionCounts.map((count) => (
                <SelectItem key={count} value={count}>
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeLimit">Time per Question (seconds)</Label>
          <Select onValueChange={setTimeLimit} value={timeLimit}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select Time per Question" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-2">
              {timePerQuestion.map((time) => (
                <SelectItem key={time} value={time}>
                  {time} {time !== "No Limit" ? "seconds" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleStartQuiz}
          size="lg"
          className="bg-medical-blue hover:bg-blue-700 text-white px-16 py-6 rounded-lg text-xl font-semibold transition-all duration-200"
        >
          Start Quiz
        </Button>
      </div>
    </div>
  );
};
