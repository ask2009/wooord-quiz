"use client";

import { useContext } from 'react';
import { LinguaLiftContext } from '@/contexts/LinguaLiftContext';

export const useLinguaLift = () => {
  const context = useContext(LinguaLiftContext);
  if (!context) {
    throw new Error('useLinguaLift must be used within a LinguaLiftProvider');
  }
  return context;
};
