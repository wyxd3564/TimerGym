import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimerDisplay from '../TimerDisplay';
import { TimerContext } from '../../../contexts/TimerContext';
import type { TimerState } from '../../../types';

// Mock useTimer hook
const mockTimerContext = {
  state: {
    mode: 'timer' as const,
    duration: 60,
    remainingTime: 60000,
    elapsedTime: 0,
    repetitions: 0,
    isRunning: false,
    isPaused: false,
  } as TimerState,
  dispatch: vi.fn(),
  setMode: vi.fn(),
  startTimer: vi.fn(),
  pauseTimer: vi.fn(),
  resumeTimer: vi.fn(),
  resetTimer: vi.fn(),
  resetRepetitions: vi.fn(),
  setDuration: vi.fn(),
  incrementRepetitions: vi.fn(),
  decrementRepetitions: vi.fn(),
  notificationService: {} as any,
  testNotification: vi.fn(),
};

const renderWithContext = (state: Partial<TimerState> = {}) => {
  const contextValue = {
    ...mockTimerContext,
    state: { ...mockTimerContext.state, ...state },
  };

  return render(
    <TimerContext.Provider value={contextValue}>
      <TimerDisplay />
    </TimerContext.Provider>
  );
};

describe('TimerDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Timer Mode', () => {
    it('renders timer mode correctly', () => {
      renderWithContext({ mode: 'timer', remainingTime: 120000, repetitions: 5 });
      
      expect(screen.getByText('02:00.00')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('반복')).toBeInTheDocument();
    });

    it('displays time as clickable button in timer mode', () => {
      renderWithContext({ mode: 'timer', remainingTime: 75000 });
      
      const timeButton = screen.getByRole('button', { name: /현재 시간: 01:15.00/ });
      expect(timeButton).toBeInTheDocument();
    });

    it('shows correct aria-label for timer mode', () => {
      renderWithContext({ mode: 'timer' });
      
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', '타이머 표시');
    });

    it('disables time button when timer is running', () => {
      renderWithContext({ mode: 'timer', isRunning: true });
      
      const timeButton = screen.getByTestId('time-display');
      expect(timeButton).toBeDisabled();
    });
  });

  describe('Stopwatch Mode', () => {
    it('renders stopwatch mode correctly', () => {
      renderWithContext({ mode: 'stopwatch', elapsedTime: 120000, repetitions: 3 });
      
      expect(screen.getByText('02:00.00')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('반복')).toBeInTheDocument();
    });

    it('displays time as non-clickable div in stopwatch mode', () => {
      renderWithContext({ mode: 'stopwatch', elapsedTime: 75000 });
      
      // Should not have a time button (only repetition control buttons)
      expect(screen.queryByTestId('time-display')).not.toHaveAttribute('type', 'button');
      expect(screen.getByText('01:15.00')).toBeInTheDocument();
    });

    it('shows correct aria-label for stopwatch mode', () => {
      renderWithContext({ mode: 'stopwatch' });
      
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', '스톱워치 표시');
    });

    it('does not show time setting modal in stopwatch mode', () => {
      renderWithContext({ mode: 'stopwatch' });
      
      // Click on time display (should not open modal)
      fireEvent.click(screen.getByText('00:00.00'));
      
      // Modal should not be present
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Repetition Controls', () => {
    it('calls incrementRepetitions when + button is clicked', () => {
      renderWithContext();
      
      fireEvent.click(screen.getByTestId('increment-reps'));
      expect(mockTimerContext.incrementRepetitions).toHaveBeenCalled();
    });

    it('calls decrementRepetitions when - button is clicked', () => {
      renderWithContext({ repetitions: 5 });
      
      fireEvent.click(screen.getByTestId('decrement-reps'));
      expect(mockTimerContext.decrementRepetitions).toHaveBeenCalled();
    });

    it('calls resetRepetitions when reset button is clicked', () => {
      renderWithContext({ repetitions: 5 });
      
      fireEvent.click(screen.getByTestId('reset-counter'));
      expect(mockTimerContext.resetRepetitions).toHaveBeenCalled();
    });

    it('disables decrement and reset buttons when repetitions is 0', () => {
      renderWithContext({ repetitions: 0 });
      
      expect(screen.getByTestId('decrement-reps')).toBeDisabled();
      expect(screen.getByTestId('reset-counter')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('provides screen reader status updates for timer mode', () => {
      renderWithContext({ mode: 'timer', isRunning: true, remainingTime: 5000 });
      
      const statusElement = screen.getByText(/타이머 실행 중.*5초 남음/);
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('provides screen reader status updates for stopwatch mode', () => {
      renderWithContext({ mode: 'stopwatch', isRunning: true, elapsedTime: 5000 });
      
      const statusElement = screen.getByText(/스톱워치 실행 중.*5초 경과/);
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('has proper ARIA labels for progress container', () => {
      renderWithContext({ mode: 'timer', remainingTime: 30000 });
      
      const progressContainer = screen.getByLabelText(/타이머 진행률.*남음/);
      expect(progressContainer).toHaveAttribute('aria-label', expect.stringContaining('타이머 진행률'));
    });
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <TimerContext.Provider value={mockTimerContext}>
        <TimerDisplay className="custom-class" />
      </TimerContext.Provider>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});