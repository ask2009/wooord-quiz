
"use client";

import { useState, useRef, useEffect } from 'react';
import { Question } from '@/lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useLinguaLift } from '@/hooks/useLinguaLift';

type TypingQuestionProps = {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  onSkip?: () => void;
};

export default function TypingQuestion({ question: { word }, onAnswer, onSkip }: TypingQuestionProps) {
  const { settings } = useLinguaLift();
  const [inputValue, setInputValue] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showTapToContinue, setShowTapToContinue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    setInputValue('');
    setIsAnswered(false);
    setIsCorrect(null);
    setShowTapToContinue(false);
  }, [word]);

  const proceed = () => {
    onAnswer(isCorrect ?? false);
  };
  
  const handleProceed = () => {
    if (!showTapToContinue) return;
    proceed();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showTapToContinue) {
        e.preventDefault();
        proceed();
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !inputValue.trim()) return;

    const correct = inputValue.trim().toLowerCase() === word.english.toLowerCase();
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      onAnswer(true);
    } else {
      if (settings.tapToContinueOnIncorrect) {
        setShowTapToContinue(true);
      } else {
        onAnswer(false);
      }
    }
  };
  
  const handleSkip = () => {
    if (isAnswered || !onSkip) return;
    setIsCorrect(false);
    setIsAnswered(true);
    // Directly call onAnswer because skipping implies incorrect. The parent handles the timeout.
    onAnswer(false);
  }

  return (
    <Card 
      className="shadow-lg"
      onClick={handleProceed}
      onKeyDown={handleKeyDown}
      tabIndex={showTapToContinue ? 0 : -1}
    >
       <CardHeader>
        <CardDescription>入力問題</CardDescription>
        <CardTitle className="text-3xl text-center py-8 font-headline">
          {word.japanese}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="英訳を入力..."
                    className={cn(
                        "h-14 text-lg text-center pr-12",
                        isAnswered && isCorrect && "border-green-500 text-green-500 border-2 ring-green-500",
                        isAnswered && !isCorrect && "border-red-500 text-red-500 border-2 ring-red-500",
                    )}
                    disabled={isAnswered}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                />
                {!isAnswered ? (
                    <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10">
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                ) : (
                    isCorrect && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-green-500" />
                )}
            </div>

            {isAnswered && !isCorrect && (
                <div 
                  className={cn(
                    "rounded-md bg-destructive/10 p-3 text-center",
                    showTapToContinue && "cursor-pointer"
                  )}
                >
                    <p className="text-sm text-destructive">正解:</p>
                    <p className="font-semibold text-foreground">{word.english}</p>
                    {showTapToContinue && (
                        <p className="text-xs text-muted-foreground animate-pulse mt-2">タップして続行</p>
                    )}
                </div>
            )}
             {!isAnswered && onSkip && (
                <Button type="button" variant="link" onClick={handleSkip} className="w-full text-muted-foreground">
                    わからない
                </Button>
            )}
        </form>
      </CardContent>
    </Card>
  );
}
