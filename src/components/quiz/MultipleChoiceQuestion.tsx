"use client";

import { useState } from 'react';
import { Question } from '@/lib/types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

type MultipleChoiceQuestionProps = {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  mode: 'en-to-jp' | 'jp-to-en';
};

export default function MultipleChoiceQuestion({ question: { word, options }, onAnswer, mode }: MultipleChoiceQuestionProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleOptionClick = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
    setIsAnswered(true);
    onAnswer(optionId === word.id);
  };
  
  const questionText = mode === 'en-to-jp' ? word.english : word.japanese;
  const getOptionText = (option: typeof word) => mode === 'en-to-jp' ? option.japanese : option.english;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardDescription>選択問題</CardDescription>
        <CardTitle className="text-3xl text-center py-8 font-headline">
          {questionText}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3">
        {options.map((option) => {
            const isCorrect = option.id === word.id;
            const isSelected = option.id === selectedOptionId;

            return (
                <Button
                    key={option.id}
                    variant="outline"
                    size="lg"
                    className={cn(
                        "h-auto justify-start p-4 text-base relative hover:bg-transparent",
                        isAnswered && isCorrect && "border-green-500 text-green-500 border-2",
                        isAnswered && isSelected && !isCorrect && "border-red-500 text-red-500 border-2"
                    )}
                    onClick={() => handleOptionClick(option.id)}
                    disabled={isAnswered}
                >
                    {getOptionText(option)}
                    {isAnswered && isCorrect && <CheckCircle2 className="absolute right-4 h-6 w-6 text-green-500" />}
                </Button>
            )
        })}
      </CardContent>
    </Card>
  );
}
