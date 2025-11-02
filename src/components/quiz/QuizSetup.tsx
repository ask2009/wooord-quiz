"use client";

import { useState } from 'react';
import { useLinguaLift } from '@/hooks/useLinguaLift';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { QuestionType, QuizSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Brain, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type QuizSetupProps = {
  onStartQuiz: (settings: QuizSettings) => void;
  lastQuizSettings: QuizSettings | null;
};

const questionTypeOptions: { id: QuestionType; label: string; description: string }[] = [
  { id: 'en-to-jp-mc', label: '英語→日本語', description: '選択' },
  { id: 'jp-to-en-mc', label: '日本語→英語', description: '選択' },
  { id: 'jp-to-en-typing', label: '日本語→英語', description: '入力' },
];

const numQuestionsOptions = ["10", "20", "50", "all"];

export default function QuizSetup({ onStartQuiz, lastQuizSettings }: QuizSetupProps) {
  const { files, setLastQuizSettings } = useLinguaLift();
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(lastQuizSettings?.fileIds || []);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>(lastQuizSettings?.questionTypes || questionTypeOptions.map(q => q.id));
  const [numQuestions, setNumQuestions] = useState<string>(
    lastQuizSettings?.numberOfQuestions === 'all' ? 'all' : String(lastQuizSettings?.numberOfQuestions || '10')
  );
  const { toast } = useToast();

  const handleFileSelect = (fileId: string) => {
    // If "weak-words" is selected, deselect all others.
    if (fileId === 'weak-words') {
      setSelectedFileIds(prev => prev.includes('weak-words') ? [] : ['weak-words']);
      return;
    }

    // If another file is selected, deselect "weak-words".
    setSelectedFileIds(prev => {
        const newSelection = prev.includes(fileId) 
            ? prev.filter(id => id !== fileId)
            : [...prev, fileId];
        return newSelection.filter(id => id !== 'weak-words');
    });
  };

  const handleQuestionTypeSelect = (typeId: QuestionType) => {
    setSelectedQuestionTypes(prev =>
      prev.includes(typeId) ? prev.filter(id => id !== typeId) : [...prev, typeId]
    );
  };
  
  const handleSubmit = () => {
    if (selectedFileIds.length === 0) {
      toast({ title: '単語セットが選択されていません', description: '少なくとも1つの単語セットを選択してください。', variant: 'destructive' });
      return;
    }
    if (selectedQuestionTypes.length === 0) {
      toast({ title: '問題形式が選択されていません', description: '少なくとも1つの問題形式を選択してください。', variant: 'destructive' });
      return;
    }
    const numberOfQuestions = numQuestions === 'all' ? 'all' : parseInt(numQuestions, 10);
    if (numQuestions !== 'all' && (isNaN(numberOfQuestions) || numberOfQuestions <= 0)) {
        toast({ title: '問題数が無効です', description: '正の数を入力するか、「すべて」を選択してください。', variant: 'destructive' });
        return;
    }

    const settings: QuizSettings = {
      fileIds: selectedFileIds,
      questionTypes: selectedQuestionTypes,
      numberOfQuestions,
      weakWordsOnly: selectedFileIds.includes('weak-words'),
    };
    
    setLastQuizSettings(settings);
    onStartQuiz(settings);
  };

  const isWeakWordsSelected = selectedFileIds.includes('weak-words');

  return (
    <Card>
      <CardHeader>
        <CardTitle>新しいクイズを作成</CardTitle>
        <CardDescription>学習セッションをカスタマイズしましょう。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-semibold">1. 単語セットを選択</Label>
          <div className="grid grid-cols-3 gap-3">
             <button
                key="weak-words"
                onClick={() => handleFileSelect('weak-words')}
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-colors aspect-square",
                    isWeakWordsSelected ? "border-primary ring-2 ring-primary" : ""
                )}
              >
                <Brain className="h-6 w-6 mb-1 text-primary"/>
                <p className="font-medium text-center text-sm">苦手な単語</p>
                {isWeakWordsSelected && <CheckCircle2 className="absolute top-1 right-1 h-4 w-4 text-primary" />}
              </button>
            {files.map(file => (
              <button
                key={file.id}
                onClick={() => handleFileSelect(file.id)}
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-colors aspect-square",
                    selectedFileIds.includes(file.id) ? "border-primary ring-2 ring-primary" : ""
                )}
                disabled={isWeakWordsSelected}
              >
                <p className="font-medium text-center text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.words.length} 単語</p>
                {selectedFileIds.includes(file.id) && <CheckCircle2 className="absolute top-1 right-1 h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">2. 問題形式を選択</Label>
          <div className="grid grid-cols-3 gap-3">
            {questionTypeOptions.map(type => (
              <button
                key={type.id}
                onClick={() => handleQuestionTypeSelect(type.id)}
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-colors aspect-square",
                    selectedQuestionTypes.includes(type.id) ? "border-primary ring-2 ring-primary" : ""
                )}
              >
                <p className="font-medium text-center text-sm">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.description}</p>
                {selectedQuestionTypes.includes(type.id) && <CheckCircle2 className="absolute top-1 right-1 h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="num-questions" className="text-base font-semibold">3. 問題数</Label>
          <Select onValueChange={setNumQuestions} value={numQuestions}>
            <SelectTrigger id="num-questions">
              <SelectValue placeholder="問題数を選択..." />
            </SelectTrigger>
            <SelectContent>
              {numQuestionsOptions.map(option => (
                <SelectItem key={option} value={option}>
                  {option === 'all' ? 'すべて' : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleSubmit} className="w-full" size="lg">
          <BrainCircuit className="mr-2 h-5 w-5" />
          クイズを開始
        </Button>
      </CardContent>
    </Card>
  );
}
