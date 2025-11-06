
"use client";

import { useLinguaLift } from "@/hooks/useLinguaLift";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useEffect } from "react";
import WeakWordsChart from "@/components/stats/WeakWordsChart";
import { FileText, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import AccuracyTrendChart from "@/components/stats/AccuracyTrendChart";

export default function StatsPage() {
  const { files, history, setQuizSettings, setLastQuizSettings, settings, setSettings } = useLinguaLift();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const router = useRouter();

  useEffect(() => {
    if (files.length > 0 && selectedFileId === null) {
      setSelectedFileId(files[0].id);
    }
    if (files.length === 0) {
        setSelectedFileId(null);
    }
  }, [files, selectedFileId]);
  
  useEffect(() => {
    if (!api) return;

    // Set initial slide without animation
    if (settings.statsCarouselIndex !== undefined) {
      api.scrollTo(settings.statsCarouselIndex, true);
    }

    const handleSelect = () => {
      setSettings({ statsCarouselIndex: api.selectedScrollSnap() });
    };
    
    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api, settings.statsCarouselIndex, setSettings]);

  const handleFileChange = (fileId: string) => {
    setSelectedFileId(fileId);
  };
  
  const selectedFile = useMemo(() => files.find(f => f.id === selectedFileId), [files, selectedFileId]);
  const fileHistory = useMemo(() => history.filter(h => h.fileId === selectedFileId), [history, selectedFileId]);

  const weakWords = useMemo(() => {
    if (!selectedFile) return [];
    
    const wordStats = new Map<string, { correct: number, total: number }>();
    
    history.filter(h => h.fileId === selectedFile.id).forEach(record => {
      if (!wordStats.has(record.wordId)) {
        wordStats.set(record.wordId, { correct: 0, total: 0 });
      }
      const stats = wordStats.get(record.wordId)!;
      stats.total++;
      if (record.correct) {
        stats.correct++;
      }
    });

    return Array.from(wordStats.entries())
      .map(([wordId, stats]) => {
         const incorrectRate = stats.total > 0 ? (stats.total - stats.correct) / stats.total : 0;
         return {
            wordId,
            incorrectCount: stats.total - stats.correct,
            incorrectRate
         }
      })
      .filter(item => item.incorrectRate >= 0.5 && item.incorrectCount > 0)
      .map(({ wordId, incorrectCount, incorrectRate }) => ({
        word: selectedFile.words.find(w => w.id === wordId),
        incorrectCount,
        incorrectRate,
      }))
      .filter(item => !!item.word)
      .sort((a, b) => b.incorrectRate - a.incorrectRate || b.incorrectCount - a.incorrectCount);

  }, [history, selectedFile]);


  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="py-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">あなたの進捗</h1>
      </header>

      {files.length === 0 ? (
         <Card>
            <CardContent className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">分析するデータがありません</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                ファイルをアップロードしてクイズを完了すると、統計が表示されます。
              </p>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Select onValueChange={handleFileChange} value={selectedFileId || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="単語セットを選択" />
            </SelectTrigger>
            <SelectContent>
              {files.map(file => (
                <SelectItem key={file.id} value={file.id}>
                  {file.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedFileId && fileHistory.length > 0 ? (
            <>
               <Card>
                <CardHeader>
                  <CardTitle>パフォーマンス概要</CardTitle>
                  <CardDescription>"{selectedFile?.name}" のパフォーマンス。</CardDescription>
                </CardHeader>
                <CardContent>
                  <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                      <CarouselItem>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">全体的な正解率</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <WeakWordsChart history={fileHistory} />
                            </CardContent>
                         </Card>
                      </CarouselItem>
                      <CarouselItem>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">正解率の推移</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AccuracyTrendChart history={fileHistory} />
                            </CardContent>
                         </Card>
                      </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                  </Carousel>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>苦手な単語</CardTitle>
                      <CardDescription>間違えた単語を練習しましょう！</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {weakWords.length > 0 ? (
                    <ul className="space-y-2">
                      {weakWords.map(({ word, incorrectCount, incorrectRate }) => word && (
                        <li key={word.id} className="flex justify-between items-center rounded-lg border bg-card p-3">
                          <div>
                            <p className="font-semibold text-foreground">{word.japanese}</p>
                            <p className="text-sm text-muted-foreground">{word.english}</p>
                          </div>
                          <div className="text-right">
                             <Badge variant="destructive">
                              誤答率 {Math.round(incorrectRate * 100)}%
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{incorrectCount} 回不正解</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">このセットではまだ不正解が記録されていません。素晴らしい！</p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
             <Card>
                <CardContent className="text-center text-muted-foreground p-12">
                  <p>このファイルのクイズ履歴はまだありません。</p>
                  <p className="text-sm">クイズを完了すると統計が表示されます。</p>
                </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
