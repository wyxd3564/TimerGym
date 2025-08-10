import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModeSelector from '../ModeSelector';
import { TimerContext } from '../../../contexts/TimerContext';
import type { TimerState } from '../../../types';

// Mock useTimer hook
const mockSetMode = vi.fn();
const mockTimerContext = {
  state: {
    mode: 'timer',
    duration: 60,
    remainingTime: 60000,
    elapsedTime: 0,
    repetitions: 0,
    isRunning: false,
    isPaused: false,
  } as TimerState,
  dispatch: vi.fn(),
  setMode: mockSetMode,
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
      <ModeSelector />
    </TimerContext.Provider>
  );
};

describe('ModeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders timer and stopwatch mode buttons', () => {
    renderWithContext();

    expect(screen.getByRole('tab', { name: '타이머' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '스톱워치' })).toBeInTheDocument();
  });

  it('shows timer mode as active by default', () => {
    renderWithContext({ mode: 'timer' });

    const timerButton = screen.getByRole('tab', { name: '타이머' });
    const stopwatchButton = screen.getByRole('tab', { name: '스톱워치' });

    expect(timerButton).toHaveAttribute('aria-selected', 'true');
    expect(stopwatchButton).toHaveAttribute('aria-selected', 'false');
  });

  it('shows stopwatch mode as active when in stopwatch mode', () => {
    renderWithContext({ mode: 'stopwatch' });

    const timerButton = screen.getByRole('tab', { name: '타이머' });
    const stopwatchButton = screen.getByRole('tab', { name: '스톱워치' });

    expect(timerButton).toHaveAttribute('aria-selected', 'false');
    expect(stopwatchButton).toHaveAttribute('aria-selected', 'true');
  });

  it('calls setMode when timer button is clicked', () => {
    renderWithContext({ mode: 'stopwatch' });

    const timerButton = screen.getByRole('tab', { name: '타이머' });
    fireEvent.click(timerButton);

    expect(mockSetMode).toHaveBeenCalledWith('timer');
  });

  it('calls setMode when stopwatch button is clicked', () => {
    renderWithContext({ mode: 'timer' });

    const stopwatchButton = screen.getByRole('tab', { name: '스톱워치' });
    fireEvent.click(stopwatchButton);

    expect(mockSetMode).toHaveBeenCalledWith('stopwatch');
  });

  it('does not call setMode when clicking already active mode', () => {
    renderWithContext({ mode: 'timer' });

    const timerButton = screen.getByRole('tab', { name: '타이머' });
    fireEvent.click(timerButton);

    expect(mockSetMode).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    renderWithContext();

    const container = screen.getByRole('tablist');
    expect(container).toHaveAttribute('aria-label', '타이머 모드 선택');

    const timerButton = screen.getByRole('tab', { name: '타이머' });
    const stopwatchButton = screen.getByRole('tab', { name: '스톱워치' });

    expect(timerButton).toHaveAttribute('aria-controls', 'timer-display');
    expect(stopwatchButton).toHaveAttribute('aria-controls', 'timer-display');
  });

  it('manages tabindex correctly for keyboard navigation', () => {
    renderWithContext({ mode: 'timer' });

    const timerButton = screen.getByRole('tab', { name: '타이머' });
    const stopwatchButton = screen.getByRole('tab', { name: '스톱워치' });

    expect(timerButton).toHaveAttribute('tabindex', '0');
    expect(stopwatchButton).toHaveAttribute('tabindex', '-1');
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-mode-selector';
    render(
      <TimerContext.Provider value={mockTimerContext}>
        <ModeSelector className={customClass} />
      </TimerContext.Provider>
    );

    const container = screen.getByRole('tablist');
    expect(container).toHaveClass(customClass);
  });
});