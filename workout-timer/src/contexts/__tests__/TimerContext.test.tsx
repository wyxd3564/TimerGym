import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import { TimerProvider, TimerContext } from '../TimerContext';
import { useContext } from 'react';
import type { ReactNode } from 'react';

// Mock the Timer service
vi.mock('../../services/Timer', () => {
  const mockTimer = {
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    destroy: vi.fn(),
    getState: vi.fn(() => ({ remainingTime: 60, isRunning: false, isPaused: false })),
    running: false,
    paused: false,
  };

  return {
    Timer: vi.fn(() => mockTimer),
  };
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <TimerProvider>{children}</TimerProvider>
);

describe('TimerContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('TimerProvider', () => {
    it('should provide initial timer state', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current!.state).toEqual({
        duration: 60,
        remainingTime: 60,
        repetitions: 0,
        isRunning: false,
        isPaused: false,
      });
    });

    it('should provide timer action functions', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      expect(result.current!.startTimer).toBeInstanceOf(Function);
      expect(result.current!.pauseTimer).toBeInstanceOf(Function);
      expect(result.current!.resumeTimer).toBeInstanceOf(Function);
      expect(result.current!.resetTimer).toBeInstanceOf(Function);
      expect(result.current!.setDuration).toBeInstanceOf(Function);
      expect(result.current!.incrementRepetitions).toBeInstanceOf(Function);
      expect(result.current!.decrementRepetitions).toBeInstanceOf(Function);
    });
  });

  describe('Timer actions', () => {
    it('should start timer', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      act(() => {
        result.current!.startTimer();
      });

      expect(result.current!.state.isRunning).toBe(true);
      expect(result.current!.state.isPaused).toBe(false);
    });

    it('should pause timer', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      // Start timer first
      act(() => {
        result.current!.startTimer();
      });

      // Then pause it
      act(() => {
        result.current!.pauseTimer();
      });

      expect(result.current!.state.isRunning).toBe(false);
      expect(result.current!.state.isPaused).toBe(true);
    });

    it('should resume paused timer', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      // Start and pause timer
      act(() => {
        result.current!.startTimer();
        result.current!.pauseTimer();
      });

      // Resume timer
      act(() => {
        result.current!.resumeTimer();
      });

      expect(result.current!.state.isRunning).toBe(true);
      expect(result.current!.state.isPaused).toBe(false);
    });

    it('should reset timer', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      // Start timer and change state
      act(() => {
        result.current!.startTimer();
        result.current!.incrementRepetitions();
        result.current!.dispatch({ type: 'TICK', payload: { remainingTime: 30 } });
      });

      // Reset timer
      act(() => {
        result.current!.resetTimer();
      });

      expect(result.current!.state.isRunning).toBe(false);
      expect(result.current!.state.isPaused).toBe(false);
      expect(result.current!.state.remainingTime).toBe(60);
      expect(result.current!.state.repetitions).toBe(0);
    });

    it('should set duration', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      act(() => {
        result.current!.setDuration(120);
      });

      expect(result.current!.state.duration).toBe(120);
      expect(result.current!.state.remainingTime).toBe(120);
      expect(result.current!.state.isRunning).toBe(false);
      expect(result.current!.state.isPaused).toBe(false);
    });

    it('should increment repetitions', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      act(() => {
        result.current!.incrementRepetitions();
        result.current!.incrementRepetitions();
      });

      expect(result.current!.state.repetitions).toBe(2);
    });

    it('should decrement repetitions', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      // First increment to have something to decrement
      act(() => {
        result.current!.incrementRepetitions();
        result.current!.incrementRepetitions();
        result.current!.incrementRepetitions();
      });

      act(() => {
        result.current!.decrementRepetitions();
      });

      expect(result.current!.state.repetitions).toBe(2);
    });

    it('should not decrement repetitions below 0', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      act(() => {
        result.current!.decrementRepetitions();
        result.current!.decrementRepetitions();
      });

      expect(result.current!.state.repetitions).toBe(0);
    });
  });

  describe('Timer reducer', () => {
    it('should handle TICK action', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      act(() => {
        result.current!.dispatch({ type: 'TICK', payload: { remainingTime: 45 } });
      });

      expect(result.current!.state.remainingTime).toBe(45);
    });

    it('should handle TICK action without payload', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });
      const initialRemainingTime = result.current!.state.remainingTime;

      act(() => {
        result.current!.dispatch({ type: 'TICK' });
      });

      expect(result.current!.state.remainingTime).toBe(initialRemainingTime);
    });

    it('should handle START_TIMER action', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      act(() => {
        result.current!.dispatch({ type: 'START_TIMER' });
      });

      expect(result.current!.state.isRunning).toBe(true);
      expect(result.current!.state.isPaused).toBe(false);
    });

    it('should handle PAUSE_TIMER action', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      act(() => {
        result.current!.dispatch({ type: 'PAUSE_TIMER' });
      });

      expect(result.current!.state.isRunning).toBe(false);
      expect(result.current!.state.isPaused).toBe(true);
    });

    it('should handle RESET_TIMER action', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      // Change state first
      act(() => {
        result.current!.dispatch({ type: 'START_TIMER' });
        result.current!.dispatch({ type: 'INCREMENT_REPETITIONS' });
        result.current!.dispatch({ type: 'TICK', payload: { remainingTime: 30 } });
      });

      // Reset
      act(() => {
        result.current!.dispatch({ type: 'RESET_TIMER' });
      });

      expect(result.current!.state.isRunning).toBe(false);
      expect(result.current!.state.isPaused).toBe(false);
      expect(result.current!.state.remainingTime).toBe(60);
      expect(result.current!.state.repetitions).toBe(0);
    });

    it('should handle SET_DURATION action', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      act(() => {
        result.current!.dispatch({ type: 'SET_DURATION', payload: { duration: 180 } });
      });

      expect(result.current!.state.duration).toBe(180);
      expect(result.current!.state.remainingTime).toBe(180);
      expect(result.current!.state.isRunning).toBe(false);
      expect(result.current!.state.isPaused).toBe(false);
    });

    it('should handle INCREMENT_REPETITIONS action', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      act(() => {
        result.current!.dispatch({ type: 'INCREMENT_REPETITIONS' });
      });

      expect(result.current!.state.repetitions).toBe(1);
    });

    it('should handle DECREMENT_REPETITIONS action', () => {
      const { result } = renderHook(() => useContext(TimerContext), { wrapper });

      // First increment
      act(() => {
        result.current!.dispatch({ type: 'INCREMENT_REPETITIONS' });
        result.current!.dispatch({ type: 'INCREMENT_REPETITIONS' });
      });

      // Then decrement
      act(() => {
        result.current!.dispatch({ type: 'DECREMENT_REPETITIONS' });
      });

      expect(result.current!.state.repetitions).toBe(1);
    });
  });

  describe('Error handling', () => {
    it('should return undefined when used outside provider', () => {
      const { result } = renderHook(() => useContext(TimerContext));
      
      expect(result.current).toBeUndefined();
    });
  });
});