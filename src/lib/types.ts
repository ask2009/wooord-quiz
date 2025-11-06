
export type VocabularyWord = {
  id: string;
  english: string;
  japanese: string;
};

export type VocabularyFile = {
  id: string;
  name: string;
  words: VocabularyWord[];
};

export type QuestionType = 'en-to-jp-mc' | 'jp-to-en-mc' | 'jp-to-en-typing';

export type AppSettings = {
    tapToContinueOnIncorrect: boolean;
    statsCarouselIndex: number;
};

export type QuizSettings = {
  fileIds: string[];
  questionTypes: QuestionType[];
  numberOfQuestions: number | 'all';
  weakWordsOnly: boolean;
};

export type Question = {
  word: VocabularyWord;
  type: QuestionType;
  options: VocabularyWord[]; // For MC questions
};

export type AnswerRecord = {
  fileId: string;
  wordId: string;
  correct: boolean;
  timestamp: number;
};
