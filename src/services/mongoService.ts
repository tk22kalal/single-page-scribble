
import { MongoClient, ObjectId, Document } from "mongodb";

// MongoDB connection string - in production this should be in an environment variable
const uri = "mongodb+srv://tk22kalal:tk22kalal@cluster0.shm5c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Don't create a global client instance, create per-operation ones instead
// Removed: const client = new MongoClient(uri);

interface CustomQuestion {
  questionText: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Participant {
  userId: string;
  userName: string;
  score: number;
  completedAt: Date;
}

export interface CustomQuiz {
  _id?: string | ObjectId;
  creatorId?: string;
  creatorName: string;
  title: string;
  questionCount: number;
  timePerQuestion: number;
  questions: CustomQuestion[];
  createdAt: Date;
  participants?: Participant[];
}

// Helper function to create and connect a client
async function getMongoClient() {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export const saveCustomQuiz = async (quiz: CustomQuiz): Promise<string> => {
  let client = null;
  try {
    client = await getMongoClient();
    const database = client.db("medquiz");
    const quizzes = database.collection("customQuizzes");
    
    // Remove _id if present to let MongoDB generate it
    const { _id, ...quizWithoutId } = quiz;
    
    const result = await quizzes.insertOne({
      ...quizWithoutId,
      createdAt: new Date(),
      participants: []
    });
    
    return result.insertedId.toString();
  } catch (error) {
    console.error("Error saving quiz to MongoDB:", error);
    throw error;
  } finally {
    if (client) await client.close();
  }
};

export const getCustomQuiz = async (quizId: string): Promise<CustomQuiz | null> => {
  let client = null;
  try {
    client = await getMongoClient();
    const database = client.db("medquiz");
    const quizzes = database.collection("customQuizzes");
    
    const quiz = await quizzes.findOne({ _id: new ObjectId(quizId) });
    
    if (!quiz) return null;
    
    // Convert ObjectId to string for frontend compatibility
    return {
      ...quiz,
      _id: quiz._id.toString()
    } as CustomQuiz;
  } catch (error) {
    console.error("Error fetching quiz from MongoDB:", error);
    throw error;
  } finally {
    if (client) await client.close();
  }
};

export const saveQuizResult = async (
  quizId: string, 
  userId: string, 
  userName: string, 
  score: number
): Promise<void> => {
  let client = null;
  try {
    client = await getMongoClient();
    const database = client.db("medquiz");
    const quizzes = database.collection("customQuizzes");
    
    const participant = {
      userId,
      userName,
      score,
      completedAt: new Date()
    };
    
    // Use updateOne with proper typing
    await quizzes.updateOne(
      { _id: new ObjectId(quizId) },
      { $push: { participants: participant } }
    );
  } catch (error) {
    console.error("Error saving quiz result to MongoDB:", error);
    throw error;
  } finally {
    if (client) await client.close();
  }
};

export const getUserCreatedQuizzes = async (userId: string): Promise<CustomQuiz[]> => {
  let client = null;
  try {
    client = await getMongoClient();
    const database = client.db("medquiz");
    const quizzes = database.collection("customQuizzes");
    
    const userQuizzes = await quizzes.find({ creatorId: userId }).toArray();
    
    // Convert ObjectId to string for frontend compatibility
    return userQuizzes.map(quiz => ({
      ...quiz,
      _id: quiz._id.toString()
    })) as CustomQuiz[];
  } catch (error) {
    console.error("Error fetching user quizzes from MongoDB:", error);
    throw error;
  } finally {
    if (client) await client.close();
  }
};
