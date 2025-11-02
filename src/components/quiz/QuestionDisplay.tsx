"use client";

import { Question } from "@/lib/types";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import TypingQuestion from "./TypingQuestion";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { XCircle } from "lucide-react";


type QuestionDisplayProps = {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  onSkip: () => void;
  onInterrupt: () => void;
  progress: { current: number; total: number };
};

export default function QuestionDisplay({ question, onAnswer, onSkip, onInterrupt, progress }: QuestionDisplayProps) {

  const progressValue = (progress.current / progress.total) * 100;

  return (
    <div className="space-y-6">
        <div>
            <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground font-medium">問題 {progress.current} / {progress.total}</p>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      中断
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>クイズを中断しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        現在の進捗は保存されません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction onClick={onInterrupt} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        中断する
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
            <Progress value={progressValue} />
        </div>
      {question.type === 'en-to-jp-mc' && <MultipleChoiceQuestion key={question.word.id} question={question} onAnswer={onAnswer} mode="en-to-jp" />}
      {question.type === 'jp-to-en-mc' && <MultipleChoiceQuestion key={question.word.id} question={question} onAnswer={onAnswer} mode="jp-to-en" />}
      {question.type === 'jp-to-en-typing' && <TypingQuestion key={question.word.id} question={question} onAnswer={onAnswer} onSkip={onSkip} />}
    </div>
  );
}
