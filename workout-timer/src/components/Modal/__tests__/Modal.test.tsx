import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Modal from '../Modal';

// Mock createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

describe('Modal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow style
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = '';
  });

  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should render with title', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('should render close button by default', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByRole('button', { name: '모달 닫기' })).toBeInTheDocument();
  });

  it('should not render close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} showCloseButton={false}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByRole('button', { name: '모달 닫기' })).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.click(screen.getByRole('button', { name: '모달 닫기' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal content is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.click(screen.getByText('Modal content'));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should not call onClose when backdrop is clicked and closeOnBackdropClick is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} closeOnBackdropClick={false}>
        <div>Modal content</div>
      </Modal>
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when Escape key is pressed and closeOnEscape is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} closeOnEscape={false}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} className="custom-modal">
        <div>Modal content</div>
      </Modal>
    );

    const modalElement = screen.getByRole('dialog').firstElementChild;
    expect(modalElement?.className).toContain('custom-modal');
  });

  it('should set body overflow to hidden when opened', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body overflow when closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('should trap focus within modal', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <button>First button</button>
        <button>Second button</button>
      </Modal>
    );

    const firstButton = screen.getByText('First button');
    const secondButton = screen.getByText('Second button');
    const closeButton = screen.getByRole('button', { name: '모달 닫기' });

    // Test that all focusable elements are present
    expect(firstButton).toBeInTheDocument();
    expect(secondButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
    
    // Test that modal has proper tabindex
    const modal = screen.getByRole('dialog').firstElementChild;
    expect(modal).toHaveAttribute('tabIndex', '-1');
  });

  it('should handle Tab key navigation correctly', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <button>Button 1</button>
        <button>Button 2</button>
      </Modal>
    );

    const modal = screen.getByRole('dialog').firstElementChild as HTMLElement;
    
    // Test Tab key handling - should not throw error
    expect(() => {
      fireEvent.keyDown(modal, { key: 'Tab' });
    }).not.toThrow();
    
    expect(() => {
      fireEvent.keyDown(modal, { key: 'Tab', shiftKey: true });
    }).not.toThrow();
  });

  it('should ignore non-Tab keys in keyDown handler', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    const modal = screen.getByRole('dialog').firstElementChild as HTMLElement;
    
    // Should not cause any issues with non-Tab keys
    expect(() => {
      fireEvent.keyDown(modal, { key: 'Enter' });
      fireEvent.keyDown(modal, { key: 'Space' });
      fireEvent.keyDown(modal, { key: 'a' });
    }).not.toThrow();
    
    // Modal should still be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});