
import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb+srv://tk22kalal:tk22kalal@cluster0.shm5c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

interface CustomQuestion {
  questionText: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface CustomQuiz {
  _id?: string;
  creatorId?: string;
  creatorName: string;
  title: string;
  questionCount: number;
  timePerQuestion: number;
  questions: CustomQuestion[];
  createdAt: Date;
  participants?: {
    userId: string;
    userName: string;
    score: number;
    completedAt: Date;
  }[];
}

export const saveCustomQuiz = async (quiz: CustomQuiz): Promise<string> => {
  try {
    await client.connect();
    const database = client.db("medquiz");
    const quizzes = database.collection("customQuizzes");
    
    const result = await quizzes.insertOne({
      ...quiz,
      createdAt: new Date(),
      participants: []
    });
    
    return result.insertedId.toString();
  } catch (error) {
    console.error("Error saving quiz to MongoDB:", error);
    throw error;
  } finally {
    await client.close();
  }
};

export const getCustomQuiz = async (quizId: string): Promise<CustomQuiz | null> => {
  try {
    await client.connect();
    const database = client.db("medquiz");
    const quizzes = database.collection("customQuizzes");
    
    const quiz = await quizzes.findOne({ _id: new ObjectId(quizId) });
    return quiz as unknown as CustomQuiz;
  } catch (error) {
    console.error("Error fetching quiz from MongoDB:", error);
    throw error;
  } finally {
    await client.close();
  }
};

export const saveQuizResult = async (
  quizId: string, 
  userId: string, 
  userName: string, 
  score: number
): Promise<void> => {
  try {
    await client.connect();
    const database = client.db("medquiz");
    const quizzes = database.collection("customQuizzes");
    
    await quizzes.updateOne(
      { _id: new ObjectId(quizId) },
      { 
        $push: { 
          participants: {
            userId,
            userName,
            score,
            completedAt: new Date()
          } 
        } 
      }
    );
  } catch (error) {
    console.error("Error saving quiz result to MongoDB:", error);
    throw error;
  } finally {
    await client.close();
  }
};

export const getUserCreatedQuizzes = async (userId: string): Promise<CustomQuiz[]> => {
  try {
    await client.connect();
    const database = client.db("medquiz");
    const quizzes = database.collection("customQuizzes");
    
    const userQuizzes = await quizzes.find({ creatorId: userId }).toArray();
    return userQuizzes as unknown as CustomQuiz[];
  } catch (error) {
    console.error("Error fetching user quizzes from MongoDB:", error);
    throw error;
  } finally {
    await client.close();
  }
};
