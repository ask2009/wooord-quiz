"use client";

import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Check, X, RefreshCw, BrainCircuit } from 'lucide-react';

type QuizResultsProps = {
  userAnswers: (boolean | null)[];
  onRestart: () => void;
  onReview: () => void;
  hasIncorrectWords: boolean;
};

export default function QuizResults({ userAnswers, onRestart, onReview, hasIncorrectWords }: QuizResultsProps) {
  const correctAnswers = userAnswers.filter(answer => answer === true).length;
  const totalQuestions = userAnswers.length;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <Card className="text-center shadow-xl">
      <CardHeader>
        <CardTitle className="text-4xl font-bold">クイズ完了！</CardTitle>
        <CardDescription>結果を見てみましょう。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center items-center">
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-card">
              <svg className="h-full w-full -rotate-90 transform">
                <circle
                  className="text-muted"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="82"
                  cx="96"
                  cy="96"
                />
                <circle
                  className="text-primary"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="82"
                  cx="96"
                  cy="96"
                  style={{
                    strokeDasharray: 2 * Math.PI * 82,
                    strokeDashoffset: 2 * Math.PI * 82 * (1 - score / 100),
                    transition: 'stroke-dashoffset 1s ease-out',
                  }}
                />
              </svg>
              <div className="absolute flex flex-col">
                <span className="text-5xl font-bold text-foreground">{score}%</span>
                <span className="text-muted-foreground">正解率</span>
              </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-lg bg-green-500/10 p-4">
            <Check className="mx-auto h-8 w-8 text-green-500" />
            <p className="mt-2 text-2xl font-bold text-foreground">{correctAnswers}</p>
            <p className="text-sm text-muted-foreground">正解</p>
          </div>
          <div className="rounded-lg bg-red-500/10 p-4">
            <X className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-2 text-2xl font-bold text-foreground">{totalQuestions - correctAnswers}</p>
            <p className="text-sm text-muted-foreground">不正解</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Button onClick={onRestart} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" /> 新しいクイズ
          </Button>
          {hasIncorrectWords && (
            <Button onClick={onReview} className="w-full bg-accent hover:bg-accent/90">
              <BrainCircuit className="mr-2 h-4 w-4" /> 間違いを復習
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
