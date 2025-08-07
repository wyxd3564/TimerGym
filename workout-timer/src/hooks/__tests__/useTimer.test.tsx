import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimer } from '../useTimer';
import { TimerProvider } from '../../contexts/TimerContext';
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

describe('useTimer', () => {
  it('should return timer context when used within provider', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.state).toBeDefined();
    expect(result.current.dispatch).toBeDefined();
    expect(result.current.startTimer).toBeInstanceOf(Function);
    expect(result.current.pauseTimer).toBeInstanceOf(Function);
    expect(result.current.resetTimer).toBeInstanceOf(Function);
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTimer());
    }).toThrow('useTimer must be used within a TimerProvider');

    consoleSpy.mockRestore();
  });
});