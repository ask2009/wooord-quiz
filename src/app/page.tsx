import QuizManager from "@/components/quiz/QuizManager";
import { Suspense } from "react";

export default function QuizPage() {
  return (
    <div className="container mx-auto max-w-2xl p-4">
       <header className="py-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">クイズ</h1>
      </header>
      <Suspense fallback={<div>クイズを読み込んでいます...</div>}>
        <QuizManager />
      </Suspense>
    </div>
  );
}
