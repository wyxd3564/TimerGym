import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Timer } from '../Timer';
import type { TimerCallbacks } from '../../types';

describe('Timer Service', () => {
  let timer: Timer;
  let mockCallbacks: TimerCallbacks;

  beforeEach(() => {
    // Mock callbacks
    mockCallbacks = {
      onTick: vi.fn(),
      onComplete: vi.fn(),
      onCountdown: vi.fn()
    };

    // Mock setInterval and clearInterval
    vi.useFakeTimers();
    
    timer = new Timer(mockCallbacks);
  });

  afterEach(() => {
    timer.destroy();
    vi.useRealTimers();
  });

  describe('start', () => {
    it('should start timer with given duration', () => {
      timer.start(5);

      expect(mockCallbacks.onTick).toHaveBeenCalledWith(5);
      expect(timer.running).toBe(true);
      expect(timer.paused).toBe(false);
    });

    it('should stop existing timer before starting new one', () => {
      timer.start(5);
      const firstState = timer.getState();
      
      timer.start(10);
      
      expect(mockCallbacks.onTick).toHaveBeenLastCalledWith(10);
      expect(timer.getState().remainingTime).toBe(10);
    });

    it('should call onTick immediately when started', () => {
      timer.start(3);
      
      expect(mockCallbacks.onTick).toHaveBeenCalledWith(3);
    });
  });

  describe('pause and resume', () => {
    it('should pause running timer', () => {
      timer.start(5);
      timer.pause();

      expect(timer.running).toBe(false);
      expect(timer.paused).toBe(true);
    });

    it('should not pause if timer is not running', () => {
      timer.pause();
      
      expect(timer.paused).toBe(false);
    });

    it('should resume paused timer', () => {
      timer.start(5);
      timer.pause();
      timer.resume();

      expect(timer.running).toBe(true);
      expect(timer.paused).toBe(false);
    });

    it('should not resume if timer is not paused', () => {
      timer.start(5);
      timer.resume(); // Should not affect running timer
      
      expect(timer.running).toBe(true);
      expect(timer.paused).toBe(false);
    });

    it('should not resume if remaining time is 0', () => {
      timer.start(1);
      vi.advanceTimersByTime(1000); // Complete the timer
      timer.pause();
      timer.resume();
      
      expect(timer.running).toBe(false);
      expect(timer.paused).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset timer to initial state', () => {
      timer.start(5);
      vi.advanceTimersByTime(2000); // Advance 2 seconds
      timer.reset();

      expect(timer.running).toBe(false);
      expect(timer.paused).toBe(false);
      expect(timer.getState().remainingTime).toBe(0);
    });
  });

  describe('tick behavior', () => {
    it('should decrease remaining time every second', () => {
      timer.start(5);
      
      // Initial call
      expect(mockCallbacks.onTick).toHaveBeenCalledWith(5);
      
      // After 1 second
      vi.advanceTimersByTime(1000);
      expect(mockCallbacks.onTick).toHaveBeenCalledWith(4);
      
      // After 2 seconds
      vi.advanceTimersByTime(1000);
      expect(mockCallbacks.onTick).toHaveBeenCalledWith(3);
    });

    it('should call onCountdown for last 3 seconds', () => {
      const onCountdownSpy = vi.fn();
      const onTickSpy = vi.fn();
      const onCompleteSpy = vi.fn();
      
      const debugTimer = new Timer({
        onTick: onTickSpy,
        onComplete: onCompleteSpy,
        onCountdown: onCountdownSpy
      });
      
      debugTimer.start(4); // Start with 4 seconds
      
      // Check initial state
      expect(onTickSpy).toHaveBeenCalledWith(4);
      
      // Advance 1 second - should be at 3 seconds remaining and trigger countdown
      vi.advanceTimersByTime(1000);
      expect(onTickSpy).toHaveBeenCalledWith(3);
      expect(onCountdownSpy).toHaveBeenCalledWith(3);
      
      // Advance 1 more second - should be at 2 seconds remaining
      vi.advanceTimersByTime(1000);
      expect(onTickSpy).toHaveBeenCalledWith(2);
      expect(onCountdownSpy).toHaveBeenCalledWith(2);
      
      // Advance 1 more second - should be at 1 second remaining
      vi.advanceTimersByTime(1000);
      expect(onTickSpy).toHaveBeenCalledWith(1);
      expect(onCountdownSpy).toHaveBeenCalledWith(1);
      
      debugTimer.destroy();
    });

    it('should call onComplete when timer reaches 0', () => {
      timer.start(2);
      
      // Advance to completion
      vi.advanceTimersByTime(2000);
      
      expect(mockCallbacks.onComplete).toHaveBeenCalled();
      expect(timer.running).toBe(false);
      expect(timer.getState().remainingTime).toBe(0);
    });

    it('should stop timer after completion', () => {
      timer.start(1);
      
      vi.advanceTimersByTime(1000);
      
      expect(timer.running).toBe(false);
      expect(timer.paused).toBe(false);
    });
  });

  describe('getState', () => {
    it('should return current timer state', () => {
      timer.start(10);
      
      const state = timer.getState();
      
      expect(state).toEqual({
        remainingTime: 10,
        isRunning: true,
        isPaused: false
      });
    });

    it('should return updated state after time passes', () => {
      timer.start(5);
      vi.advanceTimersByTime(2000);
      
      const state = timer.getState();
      
      expect(state.remainingTime).toBe(3);
    });
  });

  describe('destroy', () => {
    it('should clean up timer resources', () => {
      timer.start(5);
      timer.destroy();

      expect(timer.running).toBe(false);
      expect(timer.getState().remainingTime).toBe(0);
    });

    it('should stop interval when destroyed', () => {
      timer.start(5);
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      timer.destroy();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle starting timer with 0 duration', () => {
      timer.start(0);
      
      expect(mockCallbacks.onComplete).toHaveBeenCalled();
      expect(timer.running).toBe(false);
    });

    it('should handle negative duration', () => {
      timer.start(-1);
      
      expect(mockCallbacks.onComplete).toHaveBeenCalled();
      expect(timer.running).toBe(false);
    });

    it('should handle multiple pause calls', () => {
      timer.start(5);
      timer.pause();
      timer.pause(); // Second pause should not cause issues
      
      expect(timer.paused).toBe(true);
      expect(timer.running).toBe(false);
    });

    it('should handle multiple resume calls', () => {
      timer.start(5);
      timer.pause();
      timer.resume();
      timer.resume(); // Second resume should not cause issues
      
      expect(timer.running).toBe(true);
      expect(timer.paused).toBe(false);
    });
  });

  describe('properties', () => {
    it('should return correct running state', () => {
      expect(timer.running).toBe(false);
      
      timer.start(5);
      expect(timer.running).toBe(true);
      
      timer.pause();
      expect(timer.running).toBe(false);
      
      timer.resume();
      expect(timer.running).toBe(true);
    });

    it('should return correct paused state', () => {
      expect(timer.paused).toBe(false);
      
      timer.start(5);
      expect(timer.paused).toBe(false);
      
      timer.pause();
      expect(timer.paused).toBe(true);
      
      timer.resume();
      expect(timer.paused).toBe(false);
    });
  });
});