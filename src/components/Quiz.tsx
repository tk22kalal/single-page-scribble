
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateQuestion, handleDoubt } from "@/services/groqService";
import { toast } from "sonner";
import { QuizResults } from "./QuizResults";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { HorizontalAd } from "./ads/HorizontalAd";
import { SquareAd } from "./ads/SquareAd";
import { InArticleAd } from "./ads/InArticleAd";
import { MultiplexHorizontalAd } from "./ads/MultiplexHorizontalAd";
import { Check, X, BookOpenText, MessageCircleQuestion, ArrowRight } from "lucide-react";

interface QuizProps {
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  questionCount: string;
  timeLimit: string;
  simultaneousResults: boolean;
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

export const Quiz = ({ 
  subject, 
  chapter, 
  topic, 
  difficulty, 
  questionCount, 
  timeLimit,
  simultaneousResults = true
}: QuizProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [adCounter, setAdCounter] = useState(0);
  const [loadedQuestionsCount, setLoadedQuestionsCount] = useState(0);

  useEffect(() => {
    const loadInitialQuestions = async () => {
      setIsLoadingQuestion(true);
      
      if (questionCount !== "No Limit") {
        // Only load the number of questions specified
        const count = parseInt(questionCount);
        const loadedQuestions: Question[] = [];
        
        for (let i = 0; i < count; i++) {
          try {
            const question = await generateSingleQuestion();
            if (question) {
              loadedQuestions.push(question);
              setLoadedQuestionsCount(prev => prev + 1);
            }
          } catch (error) {
            console.error("Error loading question:", error);
          }
        }
        
        if (loadedQuestions.length > 0) {
          setQuestions(loadedQuestions);
          setCurrentQuestion(loadedQuestions[0]);
        }
      } else {
        // For unlimited mode, just load one question
        const question = await generateSingleQuestion();
        if (question) {
          setQuestions([question]);
          setCurrentQuestion(question);
          setLoadedQuestionsCount(1);
        }
      }
      
      setIsLoadingQuestion(false);
    };
    
    loadInitialQuestions();
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

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setCurrentQuestion(questions[currentQuestionIndex]);
      setSelectedAnswer(answers[currentQuestionIndex] || null);
      setShowExplanation(simultaneousResults && answers[currentQuestionIndex] ? true : false);
    }
  }, [currentQuestionIndex, questions, answers, simultaneousResults]);

  const generateSingleQuestion = async () => {
    const topicString = topic ? `${chapter} - ${topic}` : chapter;
    const scope = chapter === "Complete Subject" ? subject : `${subject} - ${topicString}`;
    return await generateQuestion(scope, difficulty);
  };

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

  const loadNewQuestion = async () => {
    // Only load a new question for unlimited mode
    if (questionCount === "No Limit") {
      setIsLoadingQuestion(true);
      const newQuestion = await generateSingleQuestion();
      if (newQuestion) {
        setQuestions(prev => [...prev, newQuestion]);
        setCurrentQuestion(newQuestion);
        setLoadedQuestionsCount(prev => prev + 1);
      }
      setIsLoadingQuestion(false);
    }
    
    setSelectedAnswer(null);
    setShowExplanation(false);
    setDoubt("");
    setDoubtMessages([]);
  };

  const handleAnswerSelect = (answer: string) => {
    if (!selectedAnswer && timeRemaining !== 0) {
      setSelectedAnswer(answer);
      setAnswers(prev => ({...prev, [currentQuestionIndex]: answer}));
      
      if (answer === currentQuestion?.correctAnswer) {
        setScore(prev => prev + 1);
      }
      
      // If simultaneous results, show explanation immediately
      if (simultaneousResults) {
        setShowExplanation(true);
      }
    }
  };

  const handleNext = () => {
    setAdCounter(prev => prev + 1);
    
    // Check if we're at the end of available questions
    if (questionCount !== "No Limit" && currentQuestionIndex >= parseInt(questionCount) - 1) {
      // If not showing simultaneous results, we need to complete the quiz
      if (!simultaneousResults) {
        setIsQuizComplete(true);
      } else {
        // For simultaneousResults, we've already seen all questions, so finish
        setIsQuizComplete(true);
      }
      return;
    }
    
    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionNumber(prev => prev + 1);
    } else {
      // If unlimited, create new question
      setQuestionNumber(prev => prev + 1);
      loadNewQuestion();
    }
    
    // Reset doubt messages for new question
    setDoubtMessages([]);
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setQuestionNumber(index + 1);
  };

  const handleSubmitQuiz = () => {
    if (!simultaneousResults) {
      // Calculate the final score if not in simultaneous mode
      let finalScore = 0;
      Object.entries(answers).forEach(([indexStr, answer]) => {
        const index = parseInt(indexStr);
        if (index < questions.length && answer === questions[index].correctAnswer) {
          finalScore++;
        }
      });
      setScore(finalScore);
    }
    
    setIsQuizComplete(true);
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
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isQuizComplete) {
    return (
      <>
        <div className="max-w-4xl mx-auto p-6">
          <MultiplexHorizontalAd />
        </div>
        <QuizResults 
          score={score} 
          totalQuestions={questionCount !== "No Limit" ? parseInt(questionCount) : loadedQuestionsCount} 
          subject={subject}
          chapter={chapter}
          topic={topic}
          difficulty={difficulty}
          questions={questions}
          answers={answers}
          onJumpToQuestion={handleJumpToQuestion}
          simultaneousResults={simultaneousResults}
        />
      </>
    );
  }

  if (isLoadingQuestion || !currentQuestion) {
    return <div className="text-center p-8">Loading question...</div>;
  }

  // For non-simultaneous results, we need a submit button at the end
  const isLastQuestion = questionCount !== "No Limit" && currentQuestionIndex >= parseInt(questionCount) - 1;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 mt-16">
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Question {questionNumber} {questionCount !== "No Limit" && `of ${questionCount}`}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-lg">Score: {simultaneousResults ? score : '-'}</div>
          {timeRemaining !== null && (
            <div className="text-lg">Time: {formatTime(timeRemaining)}</div>
          )}
        </div>
      </div>

      <div className="my-4">
        <HorizontalAd />
      </div>

      {!simultaneousResults && (
        <div className="flex justify-center mb-4">
          <div className="flex flex-wrap gap-2 max-w-xl">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                  index === currentQuestionIndex
                    ? 'bg-medblue text-white'
                    : answers[index]
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'bg-white dark:bg-gray-800 border'
                }`}
                onClick={() => handleJumpToQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion?.question}</h2>
        <div className="space-y-3">
          {currentQuestion?.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswerSelect(option[0])}
              className={`w-full text-left justify-start border ${getOptionStyle(option)} overflow-x-auto whitespace-normal min-h-[48px] h-auto px-4 py-3 hover:bg-gray-100 active:bg-gray-100 transition-colors relative`}
              disabled={!!selectedAnswer || timeRemaining === 0}
              variant="outline"
            >
              <span className="break-words text-base">{option}</span>
              {simultaneousResults && selectedAnswer && (
                <span className="absolute right-2">
                  {option[0] === currentQuestion.correctAnswer ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : selectedAnswer === option[0] ? (
                    <X className="h-5 w-5 text-red-500" />
                  ) : null}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* In-Article Ad after every 2 questions */}
        {questionNumber % 2 === 0 && (
          <div className="my-6">
            <InArticleAd />
          </div>
        )}

        {simultaneousResults ? (
          // Simultaneous results UI
          selectedAnswer && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <Button
                  onClick={() => setShowExplanation(!showExplanation)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BookOpenText className="h-4 w-4" />
                  {showExplanation ? "Hide" : "Show"} Explanation
                </Button>
                <Button onClick={handleNext} className="flex items-center gap-2">
                  {isLastQuestion ? "Finish Quiz" : "Next Question"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {showExplanation && (
                <Card className="mt-4 p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Correct Answer Explanation:</h3>
                      <p className="text-gray-700">{currentQuestion?.explanation}</p>
                    </div>
                    
                    <div className="py-2">
                      <SquareAd />
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MessageCircleQuestion className="h-5 w-5 text-medblue" />
                        Ask a Doubt
                      </h3>
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
          )
        ) : (
          // Non-simultaneous results UI
          <div className="mt-6 flex justify-between">
            <Button 
              onClick={() => handleJumpToQuestion(Math.max(0, currentQuestionIndex - 1))}
              variant="outline"
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            {isLastQuestion ? (
              <Button 
                onClick={handleSubmitQuiz}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button 
                onClick={() => handleJumpToQuestion(currentQuestionIndex + 1)}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Bottom Ad */}
      <div className="mt-6">
        <MultiplexHorizontalAd />
      </div>
    </div>
  );
};
