"use client";

import React, { useRef } from 'react';
import { useLinguaLift } from '@/hooks/useLinguaLift';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { VocabularyFile, VocabularyWord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
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

export default function FilesPage() {
  const { files, addFile, deleteFile } = useLinguaLift();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, '').trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim().replace(/^"|"$/g, '').trim());
    return result;
};


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast({
        title: '無効なファイル形式です',
        description: 'CSVファイルをアップロードしてください。',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length <= 1) { // Also check if there's more than just a header
            toast({
              title: 'ファイルが空か、ヘッダーのみです',
              description: 'CSVファイルに単語が含まれていることを確認してください。',
              variant: 'destructive',
            });
            return;
        }
        
        const words: VocabularyWord[] = lines
          .slice(1) // Skip the header row
          .map((line, index) => {
            const [english, japanese] = parseCsvLine(line);
            if (!english || !japanese) throw new Error(`Invalid format on line ${index + 2}`); // +2 because of slice and 0-based index
            return { id: `${Date.now()}-${index}`, english, japanese };
          });
        
        if (words.length === 0) {
            toast({
              title: '単語が見つかりません',
              description: 'ヘッダー行以降に単語データがあるか確認してください。',
              variant: 'destructive',
            });
            return;
        }

        const newFile: VocabularyFile = {
          id: `file-${Date.now()}`,
          name: file.name,
          words: words,
        };

        addFile(newFile);
        toast({
          title: 'ファイルがアップロードされました',
          description: `"${file.name}" が正常に追加されました。`,
        });
      } catch (error) {
        toast({
          title: 'CSVの解析中にエラーが発生しました',
          description: 'CSVが "english,japanese" の形式（ヘッダー行を含む）であることを確認してください。',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if(event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">設定</h1>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".csv"
        />
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          CSVをアップロード
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>単語セット</CardTitle>
          <CardDescription>
            学習を開始するために、英単語と日本語のペアを含むCSVファイルをアップロードしてください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">まだファイルがありません</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                「CSVをアップロード」をクリックして、最初の単語セットを追加してください。
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {files.map((file) => (
                <li key={file.id} className="flex items-center justify-between rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{file.words.length} 単語</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className='h-9 w-9'>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>よろしいですか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            これにより、"{file.name}" とそれに関連するすべてのクイズ履歴が完全に削除されます。この操作は元に戻せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteFile(file.id)}>
                            削除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
