
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Medal, Share, Trophy, Users } from "lucide-react";

interface QuizResult {
  id: string;
  quiz_id: string;
  user_id: string | null;
  user_name: string;
  score: number;
  total_questions: number;
  time_taken: number | null;
  created_at: string;
}

interface CustomQuiz {
  id: string;
  title: string;
  creator_id: string;
  description?: string | null;
  question_count: number;
  time_per_question?: string | null;
  access_code?: string | null;
  created_at: string;
  updated_at: string;
  creator_name?: string; // Added this optional property
}

interface Ranking {
  user_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at: string;
}

const QuizResults = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [quiz, setQuiz] = useState<CustomQuiz | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Quiz Results | MedquizAI";
    
    const fetchResultData = async () => {
      try {
        const { data: resultData, error: resultError } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', id)
          .single();
        
        if (resultError) throw resultError;
        
        setResult(resultData);
        
        const { data: quizData, error: quizError } = await supabase
          .from('custom_quizzes')
          .select('*')
          .eq('id', resultData.quiz_id)
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
        
        const { data: allResults, error: rankingsError } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('quiz_id', resultData.quiz_id)
          .order('score', { ascending: false });
        
        if (rankingsError) throw rankingsError;
        
        const formattedRankings = allResults.map(r => ({
          user_name: r.user_name,
          score: r.score,
          total_questions: r.total_questions,
          percentage: Math.round((r.score / r.total_questions) * 100),
          created_at: r.created_at
        }));
        
        setRankings(formattedRankings);
      } catch (error: any) {
        console.error("Error fetching result:", error);
        toast.error("Failed to load result: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResultData();
  }, [id]);

  const handleRetakeQuiz = () => {
    if (!quiz) return;
    navigate(`/quiz/take/${quiz.id}`);
  };

  const handleShareResults = () => {
    if (!quiz || !result) return;
    
    const shareUrl = `${window.location.origin}/quiz/results/${id}`;
    const shareText = `I scored ${result.score}/${result.total_questions} (${Math.round((result.score / result.total_questions) * 100)}%) on "${quiz.title}" quiz!`;
    
    if (navigator.share) {
      navigator.share({
        title: `My Results: ${quiz.title}`,
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
      toast.success("Results copied to clipboard!");
    }).catch(err => {
      console.error('Error copying text:', err);
      toast.error("Failed to copy to clipboard");
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserRank = () => {
    if (!result) return 0;
    
    return rankings.findIndex(r => 
      r.user_name === result.user_name && 
      r.score === result.score && 
      r.total_questions === result.total_questions
    ) + 1;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-medblue" />
      </div>
    );
  }

  if (!result || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-500">Result not found.</p>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.total_questions) * 100);
  const userRank = getUserRank();

  return (
    <div className="min-h-screen bg-medbg dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-medblue">{quiz.title} - Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-semibold">{result.user_name}</h2>
                  <p className="text-gray-500 text-sm">{formatDate(result.created_at)}</p>
                </div>
                
                <div className="w-36 h-36 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-medblue">{percentage}%</div>
                    <div className="text-sm text-gray-500">
                      {result.score}/{result.total_questions}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  <Card className="border-2 border-yellow-300">
                    <CardContent className="p-4 flex flex-col items-center">
                      <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
                      <div className="text-xl font-bold">
                        {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : percentage >= 40 ? 'Fair' : 'Needs Improvement'}
                      </div>
                      <div className="text-sm text-gray-500">Performance</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-blue-300">
                    <CardContent className="p-4 flex flex-col items-center">
                      <Medal className="h-8 w-8 text-blue-500 mb-2" />
                      <div className="text-xl font-bold">#{userRank}</div>
                      <div className="text-sm text-gray-500">Your Rank</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-green-300">
                    <CardContent className="p-4 flex flex-col items-center">
                      <Users className="h-8 w-8 text-green-500 mb-2" />
                      <div className="text-xl font-bold">{rankings.length}</div>
                      <div className="text-sm text-gray-500">Total Participants</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleShareResults}
                  >
                    <Share className="h-4 w-4" />
                    Share Results
                  </Button>
                  <Button 
                    className="bg-medblue hover:bg-medblue/90 text-white"
                    onClick={handleRetakeQuiz}
                  >
                    Retake Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-4 py-2 text-left">Rank</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-right">Score</th>
                      <th className="px-4 py-2 text-right">Percentage</th>
                      <th className="px-4 py-2 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((ranking, index) => (
                      <tr 
                        key={index} 
                        className={`border-t ${ranking.user_name === result.user_name && ranking.score === result.score ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                      >
                        <td className="px-4 py-2">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                        </td>
                        <td className="px-4 py-2 font-medium">{ranking.user_name}</td>
                        <td className="px-4 py-2 text-right">{ranking.score}/{ranking.total_questions}</td>
                        <td className="px-4 py-2 text-right">{ranking.percentage}%</td>
                        <td className="px-4 py-2 text-right text-sm text-gray-500">
                          {formatDate(ranking.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default QuizResults;
