
"use client";

import React, { createContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { AnswerRecord, VocabularyFile, QuizSettings, AppSettings } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

type State = {
  files: VocabularyFile[];
  history: AnswerRecord[];
  quizSettings: QuizSettings | null;
  lastQuizSettings: QuizSettings | null;
  isQuizInProgress: boolean;
  settings: AppSettings;
};

type Action =
  | { type: 'SET_STATE'; payload: Partial<State> }
  | { type: 'ADD_FILE'; payload: VocabularyFile }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'ADD_HISTORY'; payload: AnswerRecord[] }
  | { type: 'SET_QUIZ_SETTINGS'; payload: QuizSettings | null }
  | { type: 'SET_LAST_QUIZ_SETTINGS'; payload: QuizSettings | null }
  | { type: 'SET_SETTINGS'; payload: Partial<AppSettings> };

const initialState: State = {
  files: [],
  history: [],
  quizSettings: null,
  lastQuizSettings: null,
  isQuizInProgress: false,
  settings: {
    tapToContinueOnIncorrect: true,
    statsCarouselIndex: 0,
  },
};

function linguaLiftReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_FILE':
      return { ...state, files: [...state.files, action.payload] };
    case 'DELETE_FILE': {
       const newFiles = state.files.filter(f => f.id !== action.payload);
       const newHistory = state.history.filter(h => h.fileId !== action.payload);
       return { ...state, files: newFiles, history: newHistory };
    }
    case 'ADD_HISTORY':
      return { ...state, history: [...state.history, ...action.payload] };
    case 'SET_QUIZ_SETTINGS':
        return { ...state, quizSettings: action.payload, isQuizInProgress: action.payload !== null };
    case 'SET_LAST_QUIZ_SETTINGS':
        return { ...state, lastQuizSettings: action.payload };
    case 'SET_SETTINGS':
        return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

interface LinguaLiftContextType extends State {
  addFile: (file: VocabularyFile) => void;
  deleteFile: (fileId: string) => void;
  addAnswerHistory: (records: AnswerRecord[]) => void;
  setQuizSettings: (settings: QuizSettings | null) => void;
  setLastQuizSettings: (settings: QuizSettings | null) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
}

export const LinguaLiftContext = createContext<LinguaLiftContextType | undefined>(undefined);

export function LinguaLiftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(linguaLiftReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('linguaLiftState');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        // We don't want to persist quiz settings across page reloads
        parsedState.quizSettings = null;
        parsedState.isQuizInProgress = false;
        
        // Ensure settings are properly merged with defaults for backward compatibility
        const finalState = {
            ...initialState,
            ...parsedState,
            settings: {
                ...initialState.settings,
                ...(parsedState.settings || {}),
            }
        };

        dispatch({ type: 'SET_STATE', payload: finalState });
      }
    } catch (error) {
      console.error('Failed to load state from localStorage', error);
      toast({
        title: "エラー",
        description: "保存されたデータを読み込めませんでした。",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    try {
       const stateToSave = { ...state, quizSettings: null, isQuizInProgress: false };
      localStorage.setItem('linguaLiftState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save state to localStorage', error);
      toast({
        title: "エラー",
        description: "進捗を保存できませんでした。",
        variant: "destructive",
      });
    }
  }, [state, toast]);

  const addFile = (file: VocabularyFile) => {
    dispatch({ type: 'ADD_FILE', payload: file });
  };

  const deleteFile = (fileId: string) => {
    dispatch({ type: 'DELETE_FILE', payload: fileId });
    toast({
        title: "ファイルを削除しました",
        description: "単語セットと関連する学習履歴が削除されました。",
    });
  };
  
  const addAnswerHistory = useCallback((records: AnswerRecord[]) => {
    dispatch({ type: 'ADD_HISTORY', payload: records });
  }, []);

  const setQuizSettings = useCallback((settings: QuizSettings | null) => {
    dispatch({ type: 'SET_QUIZ_SETTINGS', payload: settings });
  }, []);

  const setLastQuizSettings = useCallback((settings: QuizSettings | null) => {
    dispatch({ type: 'SET_LAST_QUIZ_SETTINGS', payload: settings });
  }, []);

  const setSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
  }, []);

  return (
    <LinguaLiftContext.Provider value={{ ...state, addFile, deleteFile, addAnswerHistory, setQuizSettings, setLastQuizSettings, setSettings }}>
      {children}
    </LinguaLiftContext.Provider>
  );
}
