"use client";

import { useState } from 'react';
import { VocabularyWord } from '@/lib/types';
import TypingQuestion from './TypingQuestion';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PartyPopper } from 'lucide-react';
import { Progress } from '../ui/progress';

type AdaptiveReviewProps = {
  words: VocabularyWord[];
  onFinish: () => void;
};

export default function AdaptiveReview({ words, onFinish }: AdaptiveReviewProps) {
  const [shuffledWords, setShuffledWords] = useState<VocabularyWord[]>(() => [...words].sort(() => 0.5 - Math.random()));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (isCorrect: boolean) => {
    // For review, we don't save history, but if incorrect, we can re-add it to the end of the queue.
    if (!isCorrect) {
        setShuffledWords(prev => [...prev, shuffledWords[currentWordIndex]]);
    }

    setTimeout(() => {
      if (currentWordIndex < shuffledWords.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1200);
  };
  
  if (isFinished) {
    return (
        <Card className="text-center">
            <CardHeader>
                <CardTitle>復習完了！</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <PartyPopper className="mx-auto h-16 w-16 text-accent"/>
                <p className="text-muted-foreground">間違えた単語をすべて復習しました。お疲れ様でした！</p>
                <Button onClick={onFinish}>ホームに戻る</Button>
            </CardContent>
        </Card>
    )
  }

  const currentWord = shuffledWords[currentWordIndex];
  if (!currentWord) {
    // This can happen if the initial words array is empty.
    onFinish();
    return null;
  }

  return (
    <div className="space-y-6">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-accent">間違えた問題の復習</h2>
            <p className="text-muted-foreground">間違えた単語を練習しましょう。</p>
        </div>
        <Progress value={(currentWordIndex / shuffledWords.length) * 100} className="w-full" />
        <TypingQuestion 
            key={currentWord.id}
            question={{ word: currentWord, type: 'jp-to-en-typing', options: [] }}
            onAnswer={handleAnswer}
        />
    </div>
  );
}
