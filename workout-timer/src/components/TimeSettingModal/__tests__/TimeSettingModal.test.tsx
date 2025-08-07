import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimeSettingModal from '../TimeSettingModal';
import { TimerProvider } from '../../../contexts/TimerContext';

// Mock the useTimer hook
const mockUseTimer = {
  state: {
    duration: 120, // 2 minutes
    remainingTime: 120,
    repetitions: 0,
    isRunning: false,
    isPaused: false,
  },
  setDuration: vi.fn(),
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

describe('TimeSettingModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTimer.state = {
      duration: 120,
      remainingTime: 120,
      repetitions: 0,
      isRunning: false,
      isPaused: false,
    };
  });

  it('does not render when isOpen is false', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={false} onClose={mockOnClose} />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('시간 설정')).toBeInTheDocument();
  });

  it('displays current duration in minutes and seconds', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const minutesInput = screen.getByLabelText('분 입력');
    const secondsInput = screen.getByLabelText('초 입력');
    
    expect(minutesInput).toHaveValue(2); // 120 seconds = 2 minutes
    expect(secondsInput).toHaveValue(0); // 0 seconds remainder
  });

  it('updates minutes when + button is clicked', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const incrementButton = screen.getByLabelText('분 증가');
    fireEvent.click(incrementButton);
    
    const minutesInput = screen.getByLabelText('분 입력');
    expect(minutesInput).toHaveValue(3);
  });

  it('updates seconds when + button is clicked', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const incrementButton = screen.getByLabelText('초 증가');
    fireEvent.click(incrementButton);
    
    const secondsInput = screen.getByLabelText('초 입력');
    expect(secondsInput).toHaveValue(1);
  });

  it('updates minutes when - button is clicked', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const decrementButton = screen.getByLabelText('분 감소');
    fireEvent.click(decrementButton);
    
    const minutesInput = screen.getByLabelText('분 입력');
    expect(minutesInput).toHaveValue(1);
  });

  it('does not allow negative minutes', () => {
    mockUseTimer.state.duration = 0;
    
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const decrementButton = screen.getByLabelText('분 감소');
    fireEvent.click(decrementButton);
    
    const minutesInput = screen.getByLabelText('분 입력');
    expect(minutesInput).toHaveValue(0);
  });

  it('does not allow minutes over 59', () => {
    mockUseTimer.state.duration = 59 * 60; // 59 minutes
    
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const incrementButton = screen.getByLabelText('분 증가');
    fireEvent.click(incrementButton);
    
    const minutesInput = screen.getByLabelText('분 입력');
    expect(minutesInput).toHaveValue(59);
  });

  it('updates preview time when inputs change', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const incrementButton = screen.getByLabelText('분 증가');
    fireEvent.click(incrementButton);
    
    expect(screen.getByText('03:00')).toBeInTheDocument();
  });

  it('calls setDuration and onClose when confirm button is clicked', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const confirmButton = screen.getByText('확인');
    fireEvent.click(confirmButton);
    
    expect(mockUseTimer.setDuration).toHaveBeenCalledWith(120);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockUseTimer.setDuration).not.toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay!);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const modal = screen.getByRole('dialog');
    fireEvent.click(modal);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('disables confirm button when time is 0:00', () => {
    mockUseTimer.state.duration = 0;
    
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const confirmButton = screen.getByText('확인');
    expect(confirmButton).toBeDisabled();
  });

  it('allows direct input in time fields', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const minutesInput = screen.getByLabelText('분 입력');
    fireEvent.change(minutesInput, { target: { value: '5' } });
    
    expect(minutesInput).toHaveValue(5);
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  it('handles keyboard navigation - Escape key closes modal', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const modal = screen.getByRole('dialog');
    fireEvent.keyDown(modal, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation - Enter key confirms', () => {
    renderWithProvider(
      <TimeSettingModal isOpen={true} onClose={mockOnClose} />
    );
    
    const modal = screen.getByRole('dialog');
    fireEvent.keyDown(modal, { key: 'Enter' });
    
    expect(mockUseTimer.setDuration).toHaveBeenCalledWith(120);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});