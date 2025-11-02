"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useLinguaLift } from "@/hooks/useLinguaLift";
import QuizSetup from "./QuizSetup";
import QuestionDisplay from "./QuestionDisplay";
import QuizResults from "./QuizResults";
import AdaptiveReview from "./AdaptiveReview";
import { Question, QuizSettings, AnswerRecord, VocabularyWord } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

type QuizStage = "setup" | "loading" | "in-progress" | "results" | "review";

export default function QuizManager() {
  const { 
    files, 
    history, 
    quizSettings, 
    setQuizSettings, 
    addAnswerHistory, 
    lastQuizSettings,
    setLastQuizSettings
  } = useLinguaLift();
  
  const [stage, setStage] = useState<QuizStage>(quizSettings ? 'loading' : 'setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(boolean | null)[]>([]);
  const router = useRouter();

  const getWeakWords = useCallback(() => {
    const wordStats = new Map<string, { correct: number; total: number }>();
    history.forEach(record => {
        const file = files.find(f => f.words.some(w => w.id === record.wordId));
        if (!file) return; // Word from a deleted file

        if (!wordStats.has(record.wordId)) {
            wordStats.set(record.wordId, { correct: 0, total: 0 });
        }
        const stats = wordStats.get(record.wordId)!;
        stats.total++;
        if (record.correct) {
            stats.correct++;
        }
    });

    const allWords = files.flatMap(f => f.words);
    const weakWordIds = Array.from(wordStats.entries())
        .filter(([, stats]) => stats.total > 0 && (stats.correct / stats.total) < 0.6)
        .map(([wordId]) => wordId);
    
    return allWords.filter(word => weakWordIds.includes(word.id));
  }, [history, files]);


  const startQuiz = useCallback((settings: QuizSettings) => {
    let wordPool: VocabularyWord[] = [];
    
    if (settings.weakWordsOnly) {
        wordPool = getWeakWords();
    } else {
        settings.fileIds.forEach(fileId => {
            const file = files.find(f => f.id === fileId);
            if (file) {
                wordPool.push(...file.words);
            }
        });
    }

    if (wordPool.length === 0) {
      setQuizSettings(null); 
      setStage('setup');
      return;
    }

    let questionWords: VocabularyWord[];

    const askedWordIds = new Set(history.map(h => h.wordId));
    const unaskedWords = wordPool.filter(w => !askedWordIds.has(w.id));
    const askedWords = wordPool.filter(w => askedWordIds.has(w.id));

    const shuffledUnasked = [...unaskedWords].sort(() => 0.5 - Math.random());
    const shuffledAsked = [...askedWords].sort(() => 0.5 - Math.random());
    
    questionWords = [...shuffledUnasked, ...shuffledAsked];
    
    const questionCount = settings.numberOfQuestions === 'all' 
      ? questionWords.length 
      : Math.min(settings.numberOfQuestions, questionWords.length);

    const finalQuestionWords = questionWords.slice(0, questionCount);

    if (finalQuestionWords.length === 0) {
      setQuizSettings(null);
      setStage('setup');
      return;
    }

    const generatedQuestions: Question[] = finalQuestionWords.map(word => {
      const type = settings.questionTypes[Math.floor(Math.random() * settings.questionTypes.length)];
      
      let options: VocabularyWord[] = [];
      if (type.endsWith('-mc')) {
        options.push(word);
        const distractors = [...wordPool]
          .filter(w => w.id !== word.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        options.push(...distractors);
        options = options.sort(() => 0.5 - Math.random());
      }
      
      return { word, type, options };
    });

    setQuestions(generatedQuestions);
    setUserAnswers(new Array(generatedQuestions.length).fill(null));
    setCurrentQuestionIndex(0);
    setStage('in-progress');
  }, [files, history, setQuizSettings, getWeakWords]);

  useEffect(() => {
    if (quizSettings && stage === 'loading') {
      startQuiz(quizSettings);
    }
  }, [quizSettings, stage, startQuiz]);

  const handleAnswer = (isCorrect: boolean) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = isCorrect;
    setUserAnswers(newAnswers);

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const file = files.find(f => f.words.some(w => w.id === currentQuestion.word.id));
    const fileId = file ? file.id : "unknown";
    
    if (fileId !== 'unknown') {
        addAnswerHistory([{
          fileId: fileId,
          wordId: currentQuestion.word.id,
          correct: isCorrect,
          timestamp: Date.now()
        }]);
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setStage('results');
      }
    }, 1200);
  };

  const handleSkip = () => {
    handleAnswer(false);
  }
  
  const incorrectWords = useMemo(() => {
    return questions.filter((_, index) => userAnswers[index] === false).map(q => q.word);
  }, [questions, userAnswers]);


  const restartQuiz = () => {
    setQuizSettings(null);
    setStage('setup');
    router.push('/');
  };

  const startReview = () => {
    if (incorrectWords.length > 0) {
      setStage('review');
    } else {
      restartQuiz();
    }
  };


  if (files.length === 0 && getWeakWords().length === 0) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-lg font-semibold mb-2">単語セットが見つかりません</p>
                <p className="text-muted-foreground mb-4">クイズを開始する前にCSVファイルをアップロードする必要があります。</p>
                <Button onClick={() => router.push('/files')}>ファイルに移動</Button>
            </CardContent>
        </Card>
    )
  }

  switch (stage) {
    case 'setup':
      return <QuizSetup onStartQuiz={(settings) => {
        setLastQuizSettings(settings);
        setQuizSettings(settings);
        setStage('loading');
      }} lastQuizSettings={lastQuizSettings} />;
    case 'loading':
      return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    case 'in-progress':
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
      return (
        <QuestionDisplay
          question={currentQuestion}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
          onInterrupt={restartQuiz}
          progress={{ current: currentQuestionIndex + 1, total: questions.length }}
        />
      );
    case 'results':
      return <QuizResults userAnswers={userAnswers} onRestart={restartQuiz} onReview={startReview} hasIncorrectWords={incorrectWords.length > 0} />;
    case 'review':
      return <AdaptiveReview words={incorrectWords} onFinish={restartQuiz} />;
    default:
      return null;
  }
}
