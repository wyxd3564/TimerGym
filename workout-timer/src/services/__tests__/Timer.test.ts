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

      expect(mockCallbacks.onTick).toHaveBeenCalledWith(5000); // 5 seconds = 5000ms
      expect(timer.running).toBe(true);
      expect(timer.paused).toBe(false);
    });

    it('should stop existing timer before starting new one', () => {
      timer.start(5);
      const firstState = timer.getState();
      
      timer.start(10);
      
      expect(mockCallbacks.onTick).toHaveBeenLastCalledWith(10000); // 10 seconds = 10000ms
      expect(timer.getState().remainingTime).toBe(10000);
    });

    it('should call onTick immediately when started', () => {
      timer.start(3);
      
      expect(mockCallbacks.onTick).toHaveBeenCalledWith(3000); // 3 seconds = 3000ms
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
      expect(mockCallbacks.onTick).toHaveBeenCalledWith(5000); // 5 seconds = 5000ms
      
      // After 1 second
      vi.advanceTimersByTime(1000);
      expect(mockCallbacks.onTick).toHaveBeenCalledWith(4000); // 4 seconds = 4000ms
      
      // After 2 seconds
      vi.advanceTimersByTime(1000);
      expect(mockCallbacks.onTick).toHaveBeenCalledWith(3000); // 3 seconds = 3000ms
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
      expect(onTickSpy).toHaveBeenCalledWith(4000); // 4 seconds = 4000ms
      
      // Advance 1 second - should be at 3 seconds remaining and trigger countdown
      vi.advanceTimersByTime(1000);
      expect(onTickSpy).toHaveBeenCalledWith(3000); // 3 seconds = 3000ms
      expect(onCountdownSpy).toHaveBeenCalledWith(3);
      
      // Advance 1 more second - should be at 2 seconds remaining
      vi.advanceTimersByTime(1000);
      expect(onTickSpy).toHaveBeenCalledWith(2000); // 2 seconds = 2000ms
      expect(onCountdownSpy).toHaveBeenCalledWith(2);
      
      // Advance 1 more second - should be at 1 second remaining
      vi.advanceTimersByTime(1000);
      expect(onTickSpy).toHaveBeenCalledWith(1000); // 1 second = 1000ms
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
        mode: 'timer',
        remainingTime: 10000, // 10 seconds = 10000ms
        elapsedTime: 0,
        isRunning: true,
        isPaused: false
      });
    });

    it('should return updated state after time passes', () => {
      timer.start(5);
      vi.advanceTimersByTime(2000);
      
      const state = timer.getState();
      
      expect(state.remainingTime).toBe(3000); // 3 seconds = 3000ms
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

  describe('stopwatch mode', () => {
    it('should start stopwatch mode and count up', () => {
      timer.start(0, 'stopwatch');

      expect(mockCallbacks.onTick).toHaveBeenCalledWith(0); // Start at 0ms
      expect(timer.running).toBe(true);
      expect(timer.paused).toBe(false);
    });

    it('should increase elapsed time in stopwatch mode', () => {
      timer.start(0, 'stopwatch');
      
      // Initial call
      expect(mockCallbacks.onTick).toHaveBeenCalledWith(0);
      
      // After 1 second
      vi.advanceTimersByTime(1000);
      expect(mockCallbacks.onTick).toHaveBeenCalledWith(1000); // 1 second = 1000ms
      
      // After 2 seconds
      vi.advanceTimersByTime(1000);
      expect(mockCallbacks.onTick).toHaveBeenCalledWith(2000); // 2 seconds = 2000ms
    });

    it('should not call onCountdown in stopwatch mode', () => {
      timer.start(0, 'stopwatch');
      
      // Run for several seconds
      vi.advanceTimersByTime(5000);
      
      expect(mockCallbacks.onCountdown).not.toHaveBeenCalled();
    });

    it('should not call onComplete in stopwatch mode', () => {
      timer.start(0, 'stopwatch');
      
      // Run for a long time
      vi.advanceTimersByTime(10000);
      
      expect(mockCallbacks.onComplete).not.toHaveBeenCalled();
      expect(timer.running).toBe(true);
    });

    it('should return correct state in stopwatch mode', () => {
      timer.start(0, 'stopwatch');
      vi.advanceTimersByTime(3000);
      
      const state = timer.getState();
      
      expect(state).toEqual({
        mode: 'stopwatch',
        remainingTime: 0,
        elapsedTime: 3000, // 3 seconds = 3000ms
        isRunning: true,
        isPaused: false
      });
    });

    it('should pause and resume stopwatch correctly', () => {
      timer.start(0, 'stopwatch');
      vi.advanceTimersByTime(2000);
      
      timer.pause();
      expect(timer.paused).toBe(true);
      
      // Time should not advance while paused
      vi.advanceTimersByTime(1000);
      expect(timer.getState().elapsedTime).toBe(2000);
      
      timer.resume();
      expect(timer.paused).toBe(false);
      
      // Time should continue from where it left off
      vi.advanceTimersByTime(1000);
      expect(timer.getState().elapsedTime).toBe(3000);
    });

    it('should reset stopwatch to zero', () => {
      timer.start(0, 'stopwatch');
      vi.advanceTimersByTime(5000);
      
      timer.reset();
      
      const state = timer.getState();
      expect(state.elapsedTime).toBe(0);
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
    });
  });
});