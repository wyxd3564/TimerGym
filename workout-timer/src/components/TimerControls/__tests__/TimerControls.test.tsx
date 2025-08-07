import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimerControls from '../TimerControls';
import { TimerProvider } from '../../../contexts/TimerContext';

// Mock the useTimer hook
const mockUseTimer = {
  state: {
    isRunning: false,
    isPaused: false,
    repetitions: 0,
    duration: 60,
    remainingTime: 60,
  },
  startTimer: vi.fn(),
  pauseTimer: vi.fn(),
  resetTimer: vi.fn(),
  incrementRepetitions: vi.fn(),
  decrementRepetitions: vi.fn(),
};

vi.mock('../../../hooks', () => ({
  useTimer: () => mockUseTimer,
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TimerProvider>
      {component}
    </TimerProvider>
  );
};

describe('TimerControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockUseTimer.state = {
      isRunning: false,
      isPaused: false,
      repetitions: 0,
      duration: 60,
      remainingTime: 60,
    };
  });

  it('renders all control buttons', () => {
    renderWithProvider(<TimerControls />);
    
    expect(screen.getByRole('button', { name: /타이머 시작/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /타이머 초기화/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /반복 횟수 증가/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /반복 횟수 감소/i })).toBeInTheDocument();
  });

  it('displays current repetition count', () => {
    renderWithProvider(<TimerControls />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByLabelText(/현재 반복 횟수: 0회/i)).toBeInTheDocument();
  });

  it('calls startTimer when start button is clicked', () => {
    renderWithProvider(<TimerControls />);
    
    const startButton = screen.getByRole('button', { name: /타이머 시작/i });
    fireEvent.click(startButton);
    
    expect(mockUseTimer.startTimer).toHaveBeenCalledTimes(1);
  });

  it('calls incrementRepetitions when + button is clicked', () => {
    renderWithProvider(<TimerControls />);
    
    const incrementButton = screen.getByRole('button', { name: /반복 횟수 증가/i });
    fireEvent.click(incrementButton);
    
    expect(mockUseTimer.incrementRepetitions).toHaveBeenCalledTimes(1);
  });

  it('calls decrementRepetitions when - button is clicked and repetitions > 0', () => {
    mockUseTimer.state.repetitions = 1;
    
    renderWithProvider(<TimerControls />);
    
    const decrementButton = screen.getByRole('button', { name: /반복 횟수 감소/i });
    fireEvent.click(decrementButton);
    
    expect(mockUseTimer.decrementRepetitions).toHaveBeenCalledTimes(1);
  });

  it('disables decrement button when repetitions is 0', () => {
    renderWithProvider(<TimerControls />);
    
    const decrementButton = screen.getByRole('button', { name: /반복 횟수 감소/i });
    expect(decrementButton).toBeDisabled();
  });

  it('shows "정지" button when timer is running', () => {
    mockUseTimer.state.isRunning = true;
    mockUseTimer.state.isPaused = false;
    
    renderWithProvider(<TimerControls />);
    
    expect(screen.getByRole('button', { name: /타이머 정지/i })).toBeInTheDocument();
  });

  it('shows "재개" button when timer is paused', () => {
    mockUseTimer.state.isRunning = false;
    mockUseTimer.state.isPaused = true;
    
    renderWithProvider(<TimerControls />);
    
    expect(screen.getByRole('button', { name: /타이머 재개/i })).toBeInTheDocument();
  });

  it('calls pauseTimer when stop button is clicked while running', () => {
    mockUseTimer.state.isRunning = true;
    mockUseTimer.state.isPaused = false;
    
    renderWithProvider(<TimerControls />);
    
    const stopButton = screen.getByRole('button', { name: /타이머 정지/i });
    fireEvent.click(stopButton);
    
    expect(mockUseTimer.pauseTimer).toHaveBeenCalledTimes(1);
  });

  it('calls resetTimer when reset button is clicked', () => {
    mockUseTimer.state.isRunning = true;
    
    renderWithProvider(<TimerControls />);
    
    const resetButton = screen.getByRole('button', { name: /타이머 초기화/i });
    fireEvent.click(resetButton);
    
    expect(mockUseTimer.resetTimer).toHaveBeenCalledTimes(1);
  });

  it('disables reset button when timer is not running and not paused', () => {
    mockUseTimer.state.isRunning = false;
    mockUseTimer.state.isPaused = false;
    
    renderWithProvider(<TimerControls />);
    
    const resetButton = screen.getByRole('button', { name: /타이머 초기화/i });
    expect(resetButton).toBeDisabled();
  });

  it('displays correct repetition count', () => {
    mockUseTimer.state.repetitions = 5;
    
    renderWithProvider(<TimerControls />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByLabelText(/현재 반복 횟수: 5회/i)).toBeInTheDocument();
  });

  it('enables decrement button when repetitions > 0', () => {
    mockUseTimer.state.repetitions = 3;
    
    renderWithProvider(<TimerControls />);
    
    const decrementButton = screen.getByRole('button', { name: /반복 횟수 감소/i });
    expect(decrementButton).not.toBeDisabled();
  });
});