import React from 'react';
import { render, screen } from '@testing-library/react';
import TimerDisplay from '../TimerDisplay';
import { TimerProvider } from '../../../contexts/TimerContext';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TimerProvider>
      {component}
    </TimerProvider>
  );
};

describe('TimerDisplay', () => {
  const defaultProps = {
    remainingTime: 120,
    totalTime: 300,
    repetitions: 5,
    isRunning: false,
    isPaused: false
  };

  it('renders without crashing', () => {
    renderWithProvider(<TimerDisplay {...defaultProps} />);
    expect(screen.getByText('02:00')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('반복')).toBeInTheDocument();
  });

  it('displays time in MM:SS format', () => {
    renderWithProvider(<TimerDisplay {...defaultProps} remainingTime={75} />);
    expect(screen.getByText('01:15')).toBeInTheDocument();
  });

  it('displays repetitions count', () => {
    renderWithProvider(<TimerDisplay {...defaultProps} repetitions={10} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows paused status when paused', () => {
    renderWithProvider(<TimerDisplay {...defaultProps} isPaused={true} />);
    expect(screen.getByText('일시정지')).toBeInTheDocument();
  });

  it('does not show paused status when not paused', () => {
    renderWithProvider(<TimerDisplay {...defaultProps} isPaused={false} />);
    expect(screen.queryByText('일시정지')).not.toBeInTheDocument();
  });

  it('applies warning styles for warning time', () => {
    const { container } = renderWithProvider(<TimerDisplay {...defaultProps} remainingTime={25} />);
    const timeDisplay = screen.getByText('00:25');
    expect(timeDisplay.className).toContain('warning');
  });

  it('applies danger styles for danger time', () => {
    const { container } = renderWithProvider(<TimerDisplay {...defaultProps} remainingTime={5} />);
    const timeDisplay = screen.getByText('00:05');
    expect(timeDisplay.className).toContain('danger');
  });

  it('applies completed styles when time is zero', () => {
    const { container } = renderWithProvider(<TimerDisplay {...defaultProps} remainingTime={0} />);
    const timeDisplay = screen.getByText('00:00');
    expect(timeDisplay.className).toContain('completed');
  });

  it('applies paused styles when paused', () => {
    const { container } = renderWithProvider(<TimerDisplay {...defaultProps} isPaused={true} />);
    const timeDisplay = screen.getByText('02:00');
    expect(timeDisplay.className).toContain('paused');
  });

  it('calculates progress correctly', () => {
    const { container } = renderWithProvider(
      <TimerDisplay {...defaultProps} remainingTime={150} totalTime={300} />
    );
    
    // Progress should be 50% (150 seconds remaining out of 300 total = 50% completed)
    const progressCircle = container.querySelector('circle:last-child');
    
    // Calculate expected stroke-dashoffset for 50% progress
    const radius = (280 / 2) - (8 / 2); // size/2 - strokeWidth/2
    const circumference = 2 * Math.PI * radius;
    const expectedOffset = circumference - (50 / 100) * circumference;
    
    expect(progressCircle).toHaveAttribute('stroke-dashoffset', expectedOffset.toString());
  });

  it('uses correct timer color based on remaining time', () => {
    const { container, rerender } = renderWithProvider(
      <TimerDisplay {...defaultProps} remainingTime={60} />
    );
    
    let progressCircle = container.querySelector('circle:last-child');
    expect(progressCircle).toHaveAttribute('stroke', 'var(--color-timer-normal)');
    
    // Test warning time
    rerender(
      <TimerProvider>
        <TimerDisplay {...defaultProps} remainingTime={25} />
      </TimerProvider>
    );
    progressCircle = container.querySelector('circle:last-child');
    expect(progressCircle).toHaveAttribute('stroke', 'var(--color-timer-warning)');
    
    // Test danger time
    rerender(
      <TimerProvider>
        <TimerDisplay {...defaultProps} remainingTime={5} />
      </TimerProvider>
    );
    progressCircle = container.querySelector('circle:last-child');
    expect(progressCircle).toHaveAttribute('stroke', 'var(--color-timer-danger)');
  });

  it('applies custom className', () => {
    const { container } = renderWithProvider(
      <TimerDisplay {...defaultProps} className="custom-class" />
    );
    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveClass('custom-class');
  });

  it('handles zero repetitions', () => {
    renderWithProvider(<TimerDisplay {...defaultProps} repetitions={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles zero total time', () => {
    renderWithProvider(<TimerDisplay {...defaultProps} totalTime={0} remainingTime={0} />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
    
    // Progress should be 0 when total time is 0
    const { container } = renderWithProvider(
      <TimerDisplay {...defaultProps} totalTime={0} remainingTime={0} />
    );
    const progressCircle = container.querySelector('circle:last-child');
    const radius = (280 / 2) - (8 / 2);
    const circumference = 2 * Math.PI * radius;
    expect(progressCircle).toHaveAttribute('stroke-dashoffset', circumference.toString());
  });

  it('renders CircularProgress with correct props', () => {
    const { container } = renderWithProvider(<TimerDisplay {...defaultProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '280');
    expect(svg).toHaveAttribute('height', '280');
  });

  it('renders repetitions container', () => {
    const { container } = renderWithProvider(<TimerDisplay {...defaultProps} />);
    const repetitionsContainer = container.querySelector('[class*="repetitionsContainer"]');
    expect(repetitionsContainer).toBeInTheDocument();
  });

  it('makes time clickable when not running', () => {
    renderWithProvider(<TimerDisplay {...defaultProps} isRunning={false} />);
    const timeButton = screen.getByRole('button', { name: /현재 시간.*클릭하여 시간 설정/i });
    expect(timeButton).toBeInTheDocument();
    expect(timeButton).not.toBeDisabled();
  });

  it('disables time button when running', () => {
    renderWithProvider(<TimerDisplay {...defaultProps} isRunning={true} />);
    const timeButton = screen.getByRole('button', { name: /현재 시간/i });
    expect(timeButton).toBeDisabled();
  });
});