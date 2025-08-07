import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import DragTimeInput from '../DragTimeInput';

// Mock the Button component
vi.mock('../../Button/Button', () => ({
  default: ({ children, onClick, disabled, 'aria-label': ariaLabel, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      data-testid={`button-${children}`}
    >
      {children}
    </button>
  )
}));

describe('DragTimeInput', () => {
  const defaultProps = {
    value: 30,
    min: 0,
    max: 59,
    step: 1,
    onChange: vi.fn(),
    label: '초'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any body styles that might have been set during drag
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  });

  it('renders with correct initial value', () => {
    render(<DragTimeInput {...defaultProps} />);
    
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    expect(screen.getByText('초')).toBeInTheDocument();
  });

  it('displays value with zero padding', () => {
    render(<DragTimeInput {...defaultProps} value={5} />);
    
    expect(screen.getByDisplayValue('05')).toBeInTheDocument();
  });

  it('handles increment button click', () => {
    const onChange = vi.fn();
    render(<DragTimeInput {...defaultProps} onChange={onChange} />);
    
    fireEvent.click(screen.getByTestId('button-+'));
    
    expect(onChange).toHaveBeenCalledWith(31);
  });

  it('handles decrement button click', () => {
    const onChange = vi.fn();
    render(<DragTimeInput {...defaultProps} onChange={onChange} />);
    
    fireEvent.click(screen.getByTestId('button--'));
    
    expect(onChange).toHaveBeenCalledWith(29);
  });

  it('respects min value constraint', () => {
    const onChange = vi.fn();
    render(<DragTimeInput {...defaultProps} value={0} onChange={onChange} />);
    
    fireEvent.click(screen.getByTestId('button--'));
    
    expect(onChange).not.toHaveBeenCalled(); // Should not call onChange when at min
  });

  it('respects max value constraint', () => {
    const onChange = vi.fn();
    render(<DragTimeInput {...defaultProps} value={59} onChange={onChange} />);
    
    fireEvent.click(screen.getByTestId('button-+'));
    
    expect(onChange).not.toHaveBeenCalled(); // Should not call onChange when at max
  });

  it('handles direct input change', () => {
    const onChange = vi.fn();
    render(<DragTimeInput {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByDisplayValue('30');
    fireEvent.change(input, { target: { value: '45' } });
    
    expect(onChange).toHaveBeenCalledWith(45);
  });

  it('ignores invalid input values', () => {
    const onChange = vi.fn();
    render(<DragTimeInput {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByDisplayValue('30');
    fireEvent.change(input, { target: { value: 'abc' } });
    
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores input values outside min/max range', () => {
    const onChange = vi.fn();
    render(<DragTimeInput {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByDisplayValue('30');
    fireEvent.change(input, { target: { value: '100' } });
    
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables buttons when disabled prop is true', () => {
    render(<DragTimeInput {...defaultProps} disabled />);
    
    expect(screen.getByTestId('button-+')).toBeDisabled();
    expect(screen.getByTestId('button--')).toBeDisabled();
    expect(screen.getByDisplayValue('30')).toBeDisabled();
  });

  it('disables decrement button at min value', () => {
    render(<DragTimeInput {...defaultProps} value={0} />);
    
    expect(screen.getByTestId('button--')).toBeDisabled();
    expect(screen.getByTestId('button-+')).not.toBeDisabled();
  });

  it('disables increment button at max value', () => {
    render(<DragTimeInput {...defaultProps} value={59} />);
    
    expect(screen.getByTestId('button-+')).toBeDisabled();
    expect(screen.getByTestId('button--')).not.toBeDisabled();
  });

  describe('Mouse drag functionality', () => {
    it('starts drag on mouse down', () => {
      render(<DragTimeInput {...defaultProps} />);
      
      const container = screen.getByDisplayValue('30').parentElement?.parentElement;
      expect(container).toBeInTheDocument();
      
      fireEvent.mouseDown(container!, { clientY: 100 });
      
      // Check if drag state is active by checking if the component responds to drag
      act(() => {
        fireEvent.mouseMove(document, { clientY: 90 });
      });
      
      // If dragging is working, the onChange should be called
      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it('updates value during mouse drag', () => {
      const onChange = vi.fn();
      render(<DragTimeInput {...defaultProps} onChange={onChange} />);
      
      const container = screen.getByDisplayValue('30').parentElement?.parentElement;
      
      // Start drag
      fireEvent.mouseDown(container!, { clientY: 100 });
      
      // Simulate drag up (should increase value)
      act(() => {
        fireEvent.mouseMove(document, { clientY: 90 }); // 10px up
      });
      
      // With sensitivity of 2, 10px should increase by 5 steps
      expect(onChange).toHaveBeenCalledWith(35);
    });

    it('ends drag on mouse up', () => {
      const onChange = vi.fn();
      render(<DragTimeInput {...defaultProps} onChange={onChange} />);
      
      const container = screen.getByDisplayValue('30').parentElement?.parentElement;
      
      // Start drag
      fireEvent.mouseDown(container!, { clientY: 100 });
      
      // Move to trigger drag
      act(() => {
        fireEvent.mouseMove(document, { clientY: 90 });
      });
      
      expect(onChange).toHaveBeenCalled();
      
      // End drag
      act(() => {
        fireEvent.mouseUp(document);
      });
      
      // Reset mock and try to drag again - should not work after mouseUp
      onChange.mockClear();
      act(() => {
        fireEvent.mouseMove(document, { clientY: 80 });
      });
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it('prevents drag when disabled', () => {
      const onChange = vi.fn();
      render(<DragTimeInput {...defaultProps} disabled onChange={onChange} />);
      
      const container = screen.getByDisplayValue('30').parentElement?.parentElement;
      
      fireEvent.mouseDown(container!, { clientY: 100 });
      
      act(() => {
        fireEvent.mouseMove(document, { clientY: 90 });
      });
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Touch drag functionality', () => {
    it('starts drag on touch start', () => {
      const onChange = vi.fn();
      render(<DragTimeInput {...defaultProps} onChange={onChange} />);
      
      const container = screen.getByDisplayValue('30').parentElement?.parentElement;
      
      fireEvent.touchStart(container!, {
        touches: [{ clientY: 100 }]
      });
      
      // Test if drag is active by moving
      act(() => {
        fireEvent.touchMove(document, {
          touches: [{ clientY: 90 }]
        });
      });
      
      expect(onChange).toHaveBeenCalled();
    });

    it('updates value during touch drag', () => {
      const onChange = vi.fn();
      render(<DragTimeInput {...defaultProps} onChange={onChange} />);
      
      const container = screen.getByDisplayValue('30').parentElement?.parentElement;
      
      // Start drag
      fireEvent.touchStart(container!, {
        touches: [{ clientY: 100 }]
      });
      
      // Simulate drag down (should decrease value)
      act(() => {
        fireEvent.touchMove(document, {
          touches: [{ clientY: 110 }] // 10px down
        });
      });
      
      // With sensitivity of 2, 10px should decrease by 5 steps
      expect(onChange).toHaveBeenCalledWith(25);
    });

    it('ends drag on touch end', () => {
      const onChange = vi.fn();
      render(<DragTimeInput {...defaultProps} onChange={onChange} />);
      
      const container = screen.getByDisplayValue('30').parentElement?.parentElement;
      
      // Start drag
      fireEvent.touchStart(container!, {
        touches: [{ clientY: 100 }]
      });
      
      // Move to trigger drag
      act(() => {
        fireEvent.touchMove(document, {
          touches: [{ clientY: 90 }]
        });
      });
      
      expect(onChange).toHaveBeenCalled();
      
      // End drag
      act(() => {
        fireEvent.touchEnd(document);
      });
      
      // Reset mock and try to drag again - should not work after touchEnd
      onChange.mockClear();
      act(() => {
        fireEvent.touchMove(document, {
          touches: [{ clientY: 80 }]
        });
      });
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Drag constraints', () => {
    it('respects min value during drag', () => {
      const onChange = vi.fn();
      render(<DragTimeInput {...defaultProps} value={2} onChange={onChange} />);
      
      const container = screen.getByDisplayValue('02').parentElement?.parentElement;
      
      // Start drag
      fireEvent.mouseDown(container!, { clientY: 100 });
      
      // Drag down significantly (should hit min value)
      act(() => {
        fireEvent.mouseMove(document, { clientY: 200 }); // 100px down
      });
      
      expect(onChange).toHaveBeenCalledWith(0); // Should be clamped to min
    });

    it('respects max value during drag', () => {
      const onChange = vi.fn();
      render(<DragTimeInput {...defaultProps} value={57} onChange={onChange} />);
      
      const container = screen.getByDisplayValue('57').parentElement?.parentElement;
      
      // Start drag
      fireEvent.mouseDown(container!, { clientY: 100 });
      
      // Drag up significantly (should hit max value)
      act(() => {
        fireEvent.mouseMove(document, { clientY: 0 }); // 100px up
      });
      
      expect(onChange).toHaveBeenCalledWith(59); // Should be clamped to max
    });
  });

  describe('Accessibility', () => {
    it('has proper aria labels', () => {
      render(<DragTimeInput {...defaultProps} />);
      
      expect(screen.getByLabelText('초')).toBeInTheDocument();
      expect(screen.getByLabelText('초 증가')).toBeInTheDocument();
      expect(screen.getByLabelText('초 감소')).toBeInTheDocument();
    });

    it('prevents drag on input field interaction', () => {
      const onChange = vi.fn();
      render(<DragTimeInput {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByDisplayValue('30');
      
      // Mouse down on input should not start drag
      fireEvent.mouseDown(input, { clientY: 100 });
      
      // Try to move - should not trigger drag
      act(() => {
        fireEvent.mouseMove(document, { clientY: 90 });
      });
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Custom step size', () => {
    it('uses custom step size for button clicks', () => {
      const onChange = vi.fn();
      render(<DragTimeInput {...defaultProps} step={5} onChange={onChange} />);
      
      fireEvent.click(screen.getByTestId('button-+'));
      
      expect(onChange).toHaveBeenCalledWith(35);
    });

    it('uses custom step size for drag', () => {
      const onChange = vi.fn();
      render(<DragTimeInput {...defaultProps} step={5} onChange={onChange} />);
      
      const container = screen.getByDisplayValue('30').parentElement?.parentElement;
      
      // Start drag
      fireEvent.mouseDown(container!, { clientY: 100 });
      
      // Drag up by 2px (should be 1 step with sensitivity 2)
      act(() => {
        fireEvent.mouseMove(document, { clientY: 98 });
      });
      
      expect(onChange).toHaveBeenCalledWith(35); // 30 + (1 * 5)
    });
  });
});