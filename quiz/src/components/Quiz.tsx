
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateQuestion } from "@/services/groqService";
import { toast } from "sonner";
import { QuizResults } from "./QuizResults";
import { NativeAd } from "./ads/NativeAd";
import { InArticleAd } from "./ads/InArticleAd";
import { QuizAd } from "./ads/QuizAd";

interface QuizProps {
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  questionCount: string;
  timeLimit: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
}

export const Quiz = ({ subject, chapter, topic, difficulty, questionCount, timeLimit }: QuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    timeLimit !== "No Limit" ? parseInt(timeLimit) : null
  );
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, []);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            toast.error("Time's up!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const getOptionStyle = (option: string) => {
    if (!selectedAnswer) {
      return "bg-white text-black hover:bg-gray-100 font-normal";
    }
    
    const isCorrect = option[0] === currentQuestion?.correctAnswer;
    
    if (isCorrect) {
      return "bg-[#E7F8E9] text-black border-[#86D492] font-normal";
    }
    
    if (selectedAnswer === option[0] && !isCorrect) {
      return "bg-[#FFE9E9] text-black border-[#FF8989] font-normal";
    }
    
    return "bg-white text-black font-normal";
  };

  const loadQuestion = async () => {
    const topicString = topic ? `${chapter} - ${topic}` : chapter;
    const scope = chapter === "Complete Subject" ? subject : `${subject} - ${topicString}`;
    const newQuestion = await generateQuestion(scope, difficulty);
    if (newQuestion) {
      setCurrentQuestion(newQuestion);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (!selectedAnswer && timeRemaining !== 0) {
      setSelectedAnswer(answer);
      if (answer === currentQuestion?.correctAnswer) {
        setScore(prev => prev + 1);
      }
    }
  };

  const handleNext = () => {
    if (questionCount !== "No Limit" && questionNumber >= parseInt(questionCount)) {
      setIsQuizComplete(true);
      return;
    }
    setQuestionNumber(prev => prev + 1);
    loadQuestion();
  };

  const handleRestartQuiz = () => {
    setScore(0);
    setQuestionNumber(1);
    setIsQuizComplete(false);
    setTimeRemaining(timeLimit !== "No Limit" ? parseInt(timeLimit) : null);
    loadQuestion();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isQuizComplete) {
    return (
      <>
        <QuizAd className="my-4" />
        <QuizResults 
          score={score} 
          totalQuestions={parseInt(questionCount)} 
          subject={subject}
          chapter={chapter}
          topic={topic}
          difficulty={difficulty}
        />
        <NativeAd className="my-8" />
      </>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center">Loading question...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 mt-16">
      {/* Top Ad */}
      <QuizAd className="mb-4" />
      
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Question {questionNumber} {questionCount !== "No Limit" && `of ${questionCount}`}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-lg">Score: {score}</div>
          {timeRemaining !== null && (
            <div className="text-lg">Time: {formatTime(timeRemaining)}</div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
        <div className="space-y-3">
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

        {questionNumber % 2 === 0 && <InArticleAd className="my-6" />}

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
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">{currentQuestion.explanation}</p>
                <NativeAd className="mt-6" />
              </div>
            )}
            <Button onClick={handleNext} className="mt-4">
              Next Question
            </Button>
          </div>
        )}
      </div>
      
      {/* Bottom Ad */}
      <NativeAd className="mt-6" />
    </div>
  );
};
