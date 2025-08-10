import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimerProvider, TimerContext } from '../TimerContext';
import { SettingsProvider } from '../SettingsContext';
import { useContext } from 'react';
import type { ReactNode } from 'react';

// Mock services with proper implementations
vi.mock('../../services/Timer', () => ({
  Timer: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    destroy: vi.fn(),
    running: false,
    paused: false,
  })),
}));

vi.mock('../../services/NotificationService', () => ({
  NotificationService: vi.fn().mockImplementation(() => ({
    updateSettings: vi.fn(),
    notifyCompletion: vi.fn(),
    notifyCountdown: vi.fn(),
    testNotification: vi.fn(),
    destroy: vi.fn(),
    isReady: vi.fn().mockReturnValue(true),
    initializeAfterUserInteraction: vi.fn(),
  })),
}));

vi.mock('../../services/BackgroundSyncService', () => ({
  BackgroundSyncService: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
  })),
}));

vi.mock('../../services/WakeLockService', () => ({
  WakeLockService: vi.fn().mockImplementation(() => ({
    setupVisibilityHandler: vi.fn(),
    handleTimerStateChange: vi.fn(),
    destroy: vi.fn(),
  })),
}));

vi.mock('../../services/VoiceCountService', () => ({
  VoiceCountService: vi.fn().mockImplementation(() => ({
    startVoiceCount: vi.fn(),
    stopVoiceCount: vi.fn(),
    destroy: vi.fn(),
    isAvailable: vi.fn().mockReturnValue(true),
    initializeAfterUserInteraction: vi.fn(),
  })),
}));

vi.mock('../../hooks/useScreenReader', () => ({
  useScreenReader: () => ({
    announceTimerState: vi.fn(),
    announceRepetitionChange: vi.fn(),
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <SettingsProvider>
    <TimerProvider>{children}</TimerProvider>
  </SettingsProvider>
);

describe('TimerContext - Mode Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setMode function', () => {
    it('should switch from timer to stopwatch mode', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      expect(result.current?.state.mode).toBe('timer');

      act(() => {
        result.current?.setMode('stopwatch');
      });

      expect(result.current?.state.mode).toBe('stopwatch');
    });

    it('should switch from stopwatch to timer mode', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // First switch to stopwatch
      act(() => {
        result.current?.setMode('stopwatch');
      });

      expect(result.current?.state.mode).toBe('stopwatch');

      // Then switch back to timer
      act(() => {
        result.current?.setMode('timer');
      });

      expect(result.current?.state.mode).toBe('timer');
    });

    it('should reset timer state when switching modes', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Start timer and modify state
      act(() => {
        result.current?.setDuration(120); // 2 minutes
        result.current?.incrementRepetitions();
      });

      expect(result.current?.state.repetitions).toBe(1);

      // Switch mode
      act(() => {
        result.current?.setMode('stopwatch');
      });

      // State should be reset
      expect(result.current?.state.mode).toBe('stopwatch');
      expect(result.current?.state.isRunning).toBe(false);
      expect(result.current?.state.isPaused).toBe(false);
      expect(result.current?.state.elapsedTime).toBe(0);
      expect(result.current?.state.remainingTime).toBe(120000); // Duration preserved
    });

    it('should stop voice count when switching modes', async () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Enable voice count
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      expect(result.current?.state.voiceCountActive).toBe(true);

      // Switch mode
      act(() => {
        result.current?.setMode('stopwatch');
      });

      // Voice count should be stopped
      expect(result.current?.state.voiceCountActive).toBe(false);
      expect(result.current?.state.voiceCountNumber).toBe(0);
    });

    it('should preserve repetitions when switching modes', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Add some repetitions
      act(() => {
        result.current?.incrementRepetitions();
        result.current?.incrementRepetitions();
        result.current?.incrementRepetitions();
      });

      expect(result.current?.state.repetitions).toBe(3);

      // Switch mode
      act(() => {
        result.current?.setMode('stopwatch');
      });

      // Repetitions should be preserved
      expect(result.current?.state.repetitions).toBe(3);
    });
  });

  describe('mode-specific behavior', () => {
    it('should initialize with correct default values for timer mode', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      expect(result.current?.state.mode).toBe('timer');
      expect(result.current?.state.duration).toBe(60);
      expect(result.current?.state.remainingTime).toBe(60000);
      expect(result.current?.state.elapsedTime).toBe(0);
      expect(result.current?.state.isRunning).toBe(false);
      expect(result.current?.state.isPaused).toBe(false);
    });

    it('should initialize with correct values when switching to stopwatch mode', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      act(() => {
        result.current?.setMode('stopwatch');
      });

      expect(result.current?.state.mode).toBe('stopwatch');
      expect(result.current?.state.elapsedTime).toBe(0);
      expect(result.current?.state.isRunning).toBe(false);
      expect(result.current?.state.isPaused).toBe(false);
    });

    it('should handle duration changes correctly in timer mode', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      act(() => {
        result.current?.setDuration(300); // 5 minutes
      });

      expect(result.current?.state.duration).toBe(300);
      expect(result.current?.state.remainingTime).toBe(300000);
    });

    it('should not affect elapsed time when setting duration in stopwatch mode', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      act(() => {
        result.current?.setMode('stopwatch');
        result.current?.setDuration(300); // Should not affect stopwatch
      });

      expect(result.current?.state.elapsedTime).toBe(0);
      expect(result.current?.state.duration).toBe(300); // Duration still updated for when switching back
    });
  });

  describe('mode switching edge cases', () => {
    it('should handle switching to the same mode gracefully', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      const initialState = result.current?.state;

      act(() => {
        result.current?.setMode('timer'); // Same mode
      });

      // State should be reset even when switching to same mode
      expect(result.current?.state.mode).toBe('timer');
      expect(result.current?.state.isRunning).toBe(false);
      expect(result.current?.state.isPaused).toBe(false);
    });

    it('should handle rapid mode switching', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      act(() => {
        result.current?.setMode('stopwatch');
        result.current?.setMode('timer');
        result.current?.setMode('stopwatch');
        result.current?.setMode('timer');
      });

      expect(result.current?.state.mode).toBe('timer');
      expect(result.current?.state.isRunning).toBe(false);
      expect(result.current?.state.isPaused).toBe(false);
    });

    it('should handle mode switching while timer is running', async () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Start timer
      await act(async () => {
        await result.current?.startTimer();
      });

      // Switch mode while running
      act(() => {
        result.current?.setMode('stopwatch');
      });

      // Should stop and reset
      expect(result.current?.state.mode).toBe('stopwatch');
      expect(result.current?.state.isRunning).toBe(false);
      expect(result.current?.state.isPaused).toBe(false);
    });

    it('should handle mode switching while timer is paused', async () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Start and pause timer
      await act(async () => {
        await result.current?.startTimer();
      });
      
      act(() => {
        result.current?.pauseTimer();
      });

      expect(result.current?.state.isPaused).toBe(true);

      // Switch mode while paused
      act(() => {
        result.current?.setMode('stopwatch');
      });

      // Should reset pause state
      expect(result.current?.state.mode).toBe('stopwatch');
      expect(result.current?.state.isRunning).toBe(false);
      expect(result.current?.state.isPaused).toBe(false);
    });
  });

  describe('context value consistency', () => {
    it('should provide all required functions and state', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      expect(result.current).toBeDefined();
      expect(typeof result.current?.setMode).toBe('function');
      expect(typeof result.current?.startTimer).toBe('function');
      expect(typeof result.current?.pauseTimer).toBe('function');
      expect(typeof result.current?.resetTimer).toBe('function');
      expect(typeof result.current?.setDuration).toBe('function');
      expect(typeof result.current?.incrementRepetitions).toBe('function');
      expect(typeof result.current?.decrementRepetitions).toBe('function');
      expect(typeof result.current?.toggleVoiceCount).toBe('function');
      expect(result.current?.state).toBeDefined();
      expect(result.current?.dispatch).toBeDefined();
    });

    it('should provide stable context value structure', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      expect(result.current).toBeDefined();
      expect(typeof result.current?.setMode).toBe('function');
      expect(typeof result.current?.startTimer).toBe('function');
      expect(typeof result.current?.pauseTimer).toBe('function');
      expect(typeof result.current?.resetTimer).toBe('function');
      expect(result.current?.state).toBeDefined();
      expect(result.current?.dispatch).toBeDefined();
    });
  });
});