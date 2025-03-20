
import { toast } from "sonner";

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
}

const getRandomQuestionType = () => {
  // Expanded list of question types for more variety
  const questionTypes = [
    "anatomy and structure identification",
    "physiological functions",
    "clinical correlations",
    "embryological development",
    "nerve pathways and innervation",
    "blood supply and vasculature",
    "anatomical variations",
    "surgical landmarks",
    "diagnostic features",
    "pathological conditions",
    "biochemical processes",
    "pharmacological mechanisms",
    "histological features",
    "radiological findings",
    "genetic disorders",
    "immunological responses",
    "microbiological aspects",
    "laboratory diagnostics",
    "therapeutic approaches",
    "epidemiological factors"
  ];
  return questionTypes[Math.floor(Math.random() * questionTypes.length)];
};

export const generateQuestion = async (scope: string, difficulty: string = 'easy'): Promise<Question | null> => {
  const apiKey = localStorage.getItem("groq_api_key");
  
  if (!apiKey) {
    toast.error("Please enter your Groq API key first");
    return null;
  }

  const cleanedApiKey = apiKey.trim();
  console.log("API Key length:", cleanedApiKey.length);
  console.log("API Key starts with gsk_:", cleanedApiKey.startsWith('gsk_'));

  const getDifficultyPrompt = (level: string) => {
    switch(level.toLowerCase()) {
      case 'easy':
        return "Generate a basic MBBS level question focusing on fundamental concepts.";
      case 'medium':
        return "Generate a moderate difficulty question that combines theoretical knowledge with clinical applications.";
      case 'hard':
        return "Generate a complex clinical scenario-based question that requires integration of multiple concepts.";
      default:
        return "Generate a basic MBBS level question.";
    }
  };

  const questionType = getRandomQuestionType();
  // Adding a random seed to increase variation
  const randomSeed = Math.floor(Math.random() * 10000);

  try {
    console.log(`Generating ${difficulty} question for scope:`, scope);
    console.log("Question type:", questionType);
    console.log("Random seed:", randomSeed);
    console.log("Making request to Groq API...");
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cleanedApiKey}`
      },
      body: JSON.stringify({
        model: "mistral-saba-24b", // Updated to new model
        messages: [
          {
            role: "system",
            content: `You are a medical education expert specializing in NEET PG, FMGE, and INICET exam preparation. ${getDifficultyPrompt(difficulty)} Make sure to generate a unique question that has not been generated before, focusing on specific, uncommon aspects of the topic.`
          },
          {
            role: "user",
            content: `Generate a ${difficulty} level multiple choice question about ${questionType} in ${scope}. The question should be unique, highly specific, and not repetitive. Include uncommon but medically accurate details to ensure variation. Use seed: ${randomSeed} for uniqueness. Format the response in JSON with the following structure:
            {
              "question": "question text",
              "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
              "correctAnswer": "A", // just the letter
              "explanation": "detailed explanation",
              "subject": "${scope}"
            }`
          }
        ],
        temperature: 0.95, // Increased temperature for more variation
        max_tokens: 1024
      }),
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error details:", errorData);
      throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`);
    }

    const data: GroqResponse = await response.json();
    console.log("Groq API response received");
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from API");
    }

    try {
      const questionData = JSON.parse(data.choices[0].message.content);
      return questionData as Question;
    } catch (parseError) {
      console.error("Error parsing API response:", parseError);
      console.log("Raw response content:", data.choices[0].message.content);
      throw new Error("Failed to parse API response");
    }
  } catch (error: any) {
    console.error("Error generating question:", error);
    toast.error(error.message || "Failed to generate question. Please check your API key and try again.");
    return null;
  }
};

export const handleDoubt = async (
  doubt: string,
  question: string,
  options: string[],
  correctAnswer: string,
  explanation: string
): Promise<string | null> => {
  const apiKey = localStorage.getItem("groq_api_key");
  
  if (!apiKey) {
    toast.error("Please enter your Groq API key first");
    return null;
  }

  const cleanedApiKey = apiKey.trim();

  try {
    console.log("Handling doubt:", doubt);
    console.log("Making request to Groq API for doubt resolution...");
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cleanedApiKey}`
      },
      body: JSON.stringify({
        model: "mistral-saba-24b", // Updated to new model
        messages: [
          {
            role: "system",
            content: "You are a medical education expert who helps students understand concepts clearly. Provide detailed, accurate explanations for their doubts about medical questions."
          },
          {
            role: "user",
            content: `Context:
Question: ${question}
Options: ${options.join('\n')}
Correct Answer: ${correctAnswer}
Explanation: ${explanation}

Student's Doubt: ${doubt}

Please provide a clear, detailed explanation addressing this doubt. Include relevant medical concepts and clinical correlations when appropriate.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error details:", errorData);
      throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Groq API response received for doubt");
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from API");
    }

    return data.choices[0].message.content;

  } catch (error: any) {
    console.error("Error handling doubt:", error);
    toast.error(error.message || "Failed to get answer. Please try again.");
    return null;
  }
};
