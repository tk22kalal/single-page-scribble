import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateQuestion, handleDoubt } from "@/services/groqService";
import { toast } from "sonner";
import { QuizResults } from "./QuizResults";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { 
  showBannerAd, 
  showInterstitialAd, 
  showRewardedAd, 
  showNativeAd 
} from "@/utils/admobUtils";

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

interface DoubtMessage {
  type: 'doubt' | 'answer';
  content: string;
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
  const [doubt, setDoubt] = useState("");
  const [doubtMessages, setDoubtMessages] = useState<DoubtMessage[]>([]);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [adCounter, setAdCounter] = useState(0);
  const [nativeAdShown, setNativeAdShown] = useState(false);

  useEffect(() => {
    loadQuestion();
    
    // Show banner ad on component mount
    showBannerAd(8); // Show at bottom

    // Create container for native ad
    createNativeAdContainer();

    return () => {
      // Clean up code if needed
    };
  }, []);

  const createNativeAdContainer = () => {
    // Create a container for native ads if it doesn't exist
    if (!document.getElementById('native-ad-container')) {
      const container = document.createElement('div');
      container.id = 'native-ad-container';
      container.style.width = '100%';
      container.style.minHeight = '100px';
      container.style.margin = '20px 0';
      container.style.display = 'none'; // Hidden by default
      document.body.appendChild(container);
    }
  };

  const showNativeAdIfNeeded = () => {
    if (!nativeAdShown) {
      const container = document.getElementById('native-ad-container');
      if (container) {
        container.style.display = 'block';
        showNativeAd('native-ad-container');
        setNativeAdShown(true);
      }
    }
  };

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            toast.error("Time's up!");
            // Show an interstitial ad when time's up
            showInterstitialAd();
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
      setDoubt("");
      setDoubtMessages([]);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (!selectedAnswer && timeRemaining !== 0) {
      setSelectedAnswer(answer);
      if (answer === currentQuestion?.correctAnswer) {
        setScore(prev => prev + 1);
      } else {
        // Show native ad when user answers incorrectly (50% chance)
        if (Math.random() < 0.5) {
          showNativeAdIfNeeded();
        }
      }
    }
  };

  const handleNext = () => {
    // Increment ad counter and show interstitial ad every 3 questions
    const newAdCounter = adCounter + 1;
    setAdCounter(newAdCounter);
    
    if (newAdCounter % 3 === 0) {
      showInterstitialAd();
    }
    
    if (questionCount !== "No Limit" && questionNumber >= parseInt(questionCount)) {
      setIsQuizComplete(true);
      return;
    }
    
    setQuestionNumber(prev => prev + 1);
    setDoubtMessages([]);
    loadQuestion();
  };

  const handleAskDoubt = async () => {
    if (!doubt.trim()) {
      toast.error("Please enter your doubt first");
      return;
    }

    if (!currentQuestion) return;

    setIsLoadingAnswer(true);
    setDoubtMessages(prev => [...prev, { type: 'doubt', content: doubt }]);

    const answer = await handleDoubt(
      doubt,
      currentQuestion.question,
      currentQuestion.options,
      currentQuestion.correctAnswer,
      currentQuestion.explanation
    );

    if (answer) {
      setDoubtMessages(prev => [...prev, { type: 'answer', content: answer }]);
    }

    setDoubt("");
    setIsLoadingAnswer(false);
    
    // Show interstitial ad after asking a doubt (40% chance)
    const shouldShowAd = Math.random() < 0.4;
    if (shouldShowAd) {
      showInterstitialAd();
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isQuizComplete) {
    // Show an interstitial ad when quiz completes
    showInterstitialAd();
    
    return (
      <QuizResults 
        score={score} 
        totalQuestions={parseInt(questionCount)} 
        subject={subject}
        chapter={chapter}
        topic={topic}
        difficulty={difficulty}
      />
    );
  }

  if (!currentQuestion) {
    return <div className="text-center">Loading question...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 mt-16">
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
        <h2 className="text-xl font-semibold mb-4">{currentQuestion?.question}</h2>
        <div className="space-y-3">
          {currentQuestion?.options.map((option, index) => (
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
            <div className="flex justify-between items-center mb-4">
              <Button
                onClick={() => {
                  setShowExplanation(!showExplanation);
                  // Show native ad when showing explanation (30% chance)
                  if (!showExplanation && Math.random() < 0.3) {
                    showNativeAdIfNeeded();
                  }
                }}
                variant="outline"
              >
                {showExplanation ? "Hide" : "Show"} Explanation
              </Button>
              <Button onClick={handleNext}>
                Next Question
              </Button>
            </div>

            {showExplanation && (
              <Card className="mt-4 p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Correct Answer Explanation:</h3>
                    <p className="text-gray-700">{currentQuestion?.explanation}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Ask a Doubt</h3>
                    <div className="space-y-4">
                      {doubtMessages.map((message, index) => (
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
                          placeholder="Ask any doubt about the question, options, or explanation..."
                          value={doubt}
                          onChange={(e) => setDoubt(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleAskDoubt}
                          disabled={isLoadingAnswer}
                          className="self-end"
                        >
                          Ask Doubt
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Add types for AdMob
declare global {
  interface Window {
    admob?: {
      initialize: (appId: string) => void;
      AD_SIZE: {
        SMART_BANNER: string;
        LARGE_BANNER: string;
        BANNER: string;
        MEDIUM_RECTANGLE: string;
        FULL_BANNER: string;
        LEADERBOARD: string;
      };
      createBannerView: (options: any) => void;
      showBannerAd: (show: boolean) => void;
      prepareInterstitial: (options: any) => void;
      prepareRewardVideoAd: (options: any) => void;
      showNativeAd?: (options: any) => void;
      showAppOpenAd?: (options: any) => void;
    };
    admobAppId: string;
    admobAdUnits?: {
      banner: string;
      interstitial: string;
      native: string;
      appOpen: string;
    };
  }
}
