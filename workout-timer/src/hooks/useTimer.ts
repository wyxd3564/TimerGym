import { useContext } from 'react';
import { TimerContext } from '../contexts/TimerContext';

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}