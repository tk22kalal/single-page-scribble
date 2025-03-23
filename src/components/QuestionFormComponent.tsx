
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Image, Trash2, Upload } from "lucide-react";

interface Question {
  id?: string;
  question_text: string;
  image_url?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

interface QuestionFormComponentProps {
  questionNumber: number;
  question: Question;
  onChange: (question: Question) => void;
}

export function QuestionFormComponent({ 
  questionNumber, 
  question, 
  onChange 
}: QuestionFormComponentProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (field: keyof Question, value: string) => {
    onChange({
      ...question,
      [field]: value
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `quiz-images/${fileName}`;
    
    setIsUploading(true);
    
    try {
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('quiz-media')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage.from('quiz-media').getPublicUrl(filePath);
      
      if (data?.publicUrl) {
        handleChange('image_url', data.publicUrl);
        toast.success("Image uploaded successfully");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    handleChange('image_url', '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Question {questionNumber}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={`question-${questionNumber}`}>Question Text</Label>
          <Textarea
            id={`question-${questionNumber}`}
            value={question.question_text}
            onChange={(e) => handleChange('question_text', e.target.value)}
            placeholder="Enter your question"
            className="min-h-[100px]"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Question Image (Optional)
          </Label>
          
          {question.image_url ? (
            <div className="space-y-2">
              <div className="relative w-full max-w-md mx-auto">
                <img 
                  src={question.image_url} 
                  alt="Question" 
                  className="rounded-md border border-gray-200 max-h-[200px] object-contain mx-auto"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Label
                htmlFor={`image-upload-${questionNumber}`}
                className="cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex flex-col items-center justify-center rounded-md border border-dashed p-6 transition-colors"
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <Upload className="h-8 w-8 text-gray-500" />
                  <span className="text-sm font-medium">
                    {isUploading ? "Uploading..." : "Click to upload image"}
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG or GIF (max 2MB)
                  </span>
                </div>
                <Input
                  id={`image-upload-${questionNumber}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </Label>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <Label>Options</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-medblue bg-medblue text-white">
                  A
                </div>
                <Input
                  value={question.option_a}
                  onChange={(e) => handleChange('option_a', e.target.value)}
                  placeholder="Option A"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-medblue bg-medblue text-white">
                  B
                </div>
                <Input
                  value={question.option_b}
                  onChange={(e) => handleChange('option_b', e.target.value)}
                  placeholder="Option B"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-medblue bg-medblue text-white">
                  C
                </div>
                <Input
                  value={question.option_c}
                  onChange={(e) => handleChange('option_c', e.target.value)}
                  placeholder="Option C"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-medblue bg-medblue text-white">
                  D
                </div>
                <Input
                  value={question.option_d}
                  onChange={(e) => handleChange('option_d', e.target.value)}
                  placeholder="Option D"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <RadioGroup
              value={question.correct_answer}
              onValueChange={(value) => handleChange('correct_answer', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id={`correct-a-${questionNumber}`} />
                <Label htmlFor={`correct-a-${questionNumber}`}>A</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B" id={`correct-b-${questionNumber}`} />
                <Label htmlFor={`correct-b-${questionNumber}`}>B</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="C" id={`correct-c-${questionNumber}`} />
                <Label htmlFor={`correct-c-${questionNumber}`}>C</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="D" id={`correct-d-${questionNumber}`} />
                <Label htmlFor={`correct-d-${questionNumber}`}>D</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`explanation-${questionNumber}`}>Explanation (Optional)</Label>
            <Textarea
              id={`explanation-${questionNumber}`}
              value={question.explanation || ''}
              onChange={(e) => handleChange('explanation', e.target.value)}
              placeholder="Explain why this answer is correct"
              className="min-h-[100px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
