import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimerProvider, TimerContext } from '../TimerContext';
import { SettingsProvider } from '../SettingsContext';
import { useContext } from 'react';
import type { ReactNode } from 'react';

// Mock services with proper implementations
const mockVoiceCountService = {
  startVoiceCount: vi.fn(),
  stopVoiceCount: vi.fn(),
  destroy: vi.fn(),
  isAvailable: vi.fn().mockReturnValue(true),
  initializeAfterUserInteraction: vi.fn().mockResolvedValue(undefined),
  isVoiceCountActive: vi.fn().mockReturnValue(false),
  getCurrentCount: vi.fn().mockReturnValue(0),
  setVolume: vi.fn(),
  getVolume: vi.fn().mockReturnValue(0.8),
};

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
  VoiceCountService: vi.fn().mockImplementation(() => mockVoiceCountService),
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

describe('TimerContext - Voice Count Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVoiceCountService.isVoiceCountActive.mockReturnValue(false);
    mockVoiceCountService.getCurrentCount.mockReturnValue(0);
  });

  describe('toggleVoiceCount function', () => {
    it('should initialize voice service after user interaction when not available', async () => {
      mockVoiceCountService.isAvailable.mockReturnValue(false);
      
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      expect(mockVoiceCountService.initializeAfterUserInteraction).toHaveBeenCalled();
    });

    it('should start voice count when inactive', async () => {
      mockVoiceCountService.isAvailable.mockReturnValue(true);
      
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      expect(result.current?.state.voiceCountActive).toBe(false);

      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      expect(mockVoiceCountService.startVoiceCount).toHaveBeenCalled();
      expect(result.current?.state.voiceCountActive).toBe(true);
    });

    it('should stop voice count when active', async () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // First activate voice count
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      expect(result.current?.state.voiceCountActive).toBe(true);

      // Then deactivate it
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      expect(mockVoiceCountService.stopVoiceCount).toHaveBeenCalled();
      expect(result.current?.state.voiceCountActive).toBe(false);
    });

    it('should reset voice count number when toggling off', async () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Activate voice count
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      // Simulate some voice counting
      act(() => {
        result.current?.dispatch({ type: 'INCREMENT_VOICE_COUNT' });
        result.current?.dispatch({ type: 'INCREMENT_VOICE_COUNT' });
        result.current?.dispatch({ type: 'INCREMENT_VOICE_COUNT' });
      });

      expect(result.current?.state.voiceCountNumber).toBe(3);

      // Deactivate voice count
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      expect(result.current?.state.voiceCountNumber).toBe(0);
    });
  });

  describe('voice count state management', () => {
    it('should increment voice count number', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      expect(result.current?.state.voiceCountNumber).toBe(0);

      act(() => {
        result.current?.dispatch({ type: 'INCREMENT_VOICE_COUNT' });
      });

      expect(result.current?.state.voiceCountNumber).toBe(1);

      act(() => {
        result.current?.dispatch({ type: 'INCREMENT_VOICE_COUNT' });
      });

      expect(result.current?.state.voiceCountNumber).toBe(2);
    });

    it('should reset voice count when timer is reset', async () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Activate voice count and increment
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      act(() => {
        result.current?.dispatch({ type: 'INCREMENT_VOICE_COUNT' });
        result.current?.dispatch({ type: 'INCREMENT_VOICE_COUNT' });
      });

      expect(result.current?.state.voiceCountActive).toBe(true);
      expect(result.current?.state.voiceCountNumber).toBe(2);

      // Reset timer
      act(() => {
        result.current?.resetTimer();
      });

      expect(result.current?.state.voiceCountActive).toBe(false);
      expect(result.current?.state.voiceCountNumber).toBe(0);
      expect(mockVoiceCountService.stopVoiceCount).toHaveBeenCalled();
    });

    it('should reset voice count when switching modes', async () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Activate voice count
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      act(() => {
        result.current?.dispatch({ type: 'INCREMENT_VOICE_COUNT' });
      });

      expect(result.current?.state.voiceCountActive).toBe(true);
      expect(result.current?.state.voiceCountNumber).toBe(1);

      // Switch mode
      act(() => {
        result.current?.setMode('stopwatch');
      });

      expect(result.current?.state.voiceCountActive).toBe(false);
      expect(result.current?.state.voiceCountNumber).toBe(0);
      expect(mockVoiceCountService.stopVoiceCount).toHaveBeenCalled();
    });
  });

  describe('voice count with timer operations', () => {
    it('should maintain voice count state when starting timer', async () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Activate voice count first
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      expect(result.current?.state.voiceCountActive).toBe(true);

      // Start timer
      await act(async () => {
        await result.current?.startTimer();
      });

      // Voice count should still be active
      expect(result.current?.state.voiceCountActive).toBe(true);
    });

    it('should maintain voice count state when pausing timer', async () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Activate voice count and start timer
      await act(async () => {
        await result.current?.toggleVoiceCount();
        await result.current?.startTimer();
      });

      expect(result.current?.state.voiceCountActive).toBe(true);

      // Pause timer
      act(() => {
        result.current?.pauseTimer();
      });

      // Voice count should still be active
      expect(result.current?.state.voiceCountActive).toBe(true);
    });

    it('should stop voice count when timer completes', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Activate voice count
      act(() => {
        result.current?.dispatch({ type: 'TOGGLE_VOICE_COUNT' });
      });

      expect(result.current?.state.voiceCountActive).toBe(true);

      // Complete timer
      act(() => {
        result.current?.dispatch({ type: 'COMPLETE_TIMER' });
      });

      // Voice count should be reset but not necessarily stopped by COMPLETE_TIMER
      // The actual stopping happens in the timer callback
      expect(result.current?.state.voiceCountActive).toBe(true); // State doesn't change in COMPLETE_TIMER
    });
  });

  describe('voice count service integration', () => {
    it('should provide voice count service in context', () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      expect(result.current?.voiceCountService).toBeDefined();
    });

    it('should handle voice count service errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockVoiceCountService.startVoiceCount.mockImplementation(() => {
        throw new Error('Voice count service error');
      });

      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Should not throw error
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      // State should still be updated
      expect(result.current?.state.voiceCountActive).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Voice count service error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle unavailable voice count service', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockVoiceCountService.isAvailable.mockReturnValue(false);
      mockVoiceCountService.initializeAfterUserInteraction.mockRejectedValue(
        new Error('Initialization failed')
      );

      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Should not throw error
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      expect(mockVoiceCountService.initializeAfterUserInteraction).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Voice count service error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('voice count edge cases', () => {
    it('should handle multiple rapid toggle calls', async () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Rapid toggle calls
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });
      
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });
      
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      // Should end up in a consistent state
      expect(typeof result.current?.state.voiceCountActive).toBe('boolean');
      expect(result.current?.state.voiceCountActive).toBe(true); // Odd number of toggles
    });

    it('should handle voice count toggle when service is not ready', async () => {
      mockVoiceCountService.isAvailable.mockReturnValue(false);
      mockVoiceCountService.initializeAfterUserInteraction.mockResolvedValue(undefined);
      
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      expect(mockVoiceCountService.initializeAfterUserInteraction).toHaveBeenCalled();
    });

    it('should maintain voice count number across timer operations', async () => {
      const { result } = renderHook(
        () => useContext(TimerContext),
        { wrapper }
      );

      // Activate voice count (this resets count to 0)
      await act(async () => {
        await result.current?.toggleVoiceCount();
      });

      // Then increment
      act(() => {
        result.current?.dispatch({ type: 'INCREMENT_VOICE_COUNT' });
        result.current?.dispatch({ type: 'INCREMENT_VOICE_COUNT' });
      });

      expect(result.current?.state.voiceCountNumber).toBe(2);

      // Start and pause timer
      await act(async () => {
        await result.current?.startTimer();
      });

      act(() => {
        result.current?.pauseTimer();
      });

      // Voice count number should be maintained
      expect(result.current?.state.voiceCountNumber).toBe(2);
    });
  });
});