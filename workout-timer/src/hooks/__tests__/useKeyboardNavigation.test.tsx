import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useKeyboardNavigation } from '../useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    // Create a mock DOM element
    mockElement = document.createElement('div');
    mockElement.innerHTML = `
      <button data-testid="button1" tabindex="0">Button 1</button>
      <button data-testid="button2" tabindex="0">Button 2</button>
      <button data-testid="button3" tabindex="0">Button 3</button>
    `;
    document.body.appendChild(mockElement);

    // Mock focus method
    const buttons = mockElement.querySelectorAll('button');
    buttons.forEach(button => {
      vi.spyOn(button, 'focus').mockImplementation(() => {});
    });
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    vi.clearAllMocks();
  });

  it('should initialize with default options', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation({ containerRef: { current: mockElement } })
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isEnabled).toBe(true);
  });

  it('should handle arrow key navigation', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation({ containerRef: { current: mockElement } })
    );

    // Navigate down
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(1);

    // Navigate up
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowUp',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it('should handle tab navigation', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation({ containerRef: { current: mockElement } })
    );

    // Tab forward
    act(() => {
      result.current.handleKeyDown({
        key: 'Tab',
        shiftKey: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(1);

    // Shift+Tab backward
    act(() => {
      result.current.handleKeyDown({
        key: 'Tab',
        shiftKey: true,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it('should wrap around at boundaries', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation({ 
        containerRef: { current: mockElement },
        wrap: true 
      })
    );

    // Navigate up from first item (should wrap to last)
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowUp',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(2);

    // Navigate down from last item (should wrap to first)
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it('should not wrap around when wrap is disabled', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation({ 
        containerRef: { current: mockElement },
        wrap: false 
      })
    );

    // Try to navigate up from first item
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowUp',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(0);

    // Navigate to last item
    act(() => {
      result.current.setCurrentIndex(2);
    });

    // Try to navigate down from last item
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(2);
  });

  it('should handle Enter and Space key activation', () => {
    const mockClick = vi.fn();
    const button = mockElement.querySelector('button') as HTMLButtonElement;
    button.addEventListener('click', mockClick);

    const { result } = renderHook(() => 
      useKeyboardNavigation({ containerRef: { current: mockElement } })
    );

    // Press Enter
    act(() => {
      result.current.handleKeyDown({
        key: 'Enter',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(mockClick).toHaveBeenCalled();

    mockClick.mockClear();

    // Press Space
    act(() => {
      result.current.handleKeyDown({
        key: ' ',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(mockClick).toHaveBeenCalled();
  });

  it('should handle Home and End keys', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation({ containerRef: { current: mockElement } })
    );

    // Navigate to middle
    act(() => {
      result.current.setCurrentIndex(1);
    });

    // Press Home
    act(() => {
      result.current.handleKeyDown({
        key: 'Home',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(0);

    // Press End
    act(() => {
      result.current.handleKeyDown({
        key: 'End',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(2);
  });

  it('should focus current element when index changes', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation({ containerRef: { current: mockElement } })
    );

    const buttons = mockElement.querySelectorAll('button');
    const focusSpy = vi.spyOn(buttons[1], 'focus');

    act(() => {
      result.current.setCurrentIndex(1);
    });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('should enable and disable navigation', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation({ containerRef: { current: mockElement } })
    );

    expect(result.current.isEnabled).toBe(true);

    act(() => {
      result.current.setEnabled(false);
    });

    expect(result.current.isEnabled).toBe(false);

    // Key navigation should not work when disabled
    const initialIndex = result.current.currentIndex;
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(initialIndex);
  });

  it('should handle custom selector', () => {
    const customElement = document.createElement('div');
    customElement.innerHTML = `
      <div class="custom-item" tabindex="0">Item 1</div>
      <div class="custom-item" tabindex="0">Item 2</div>
    `;
    document.body.appendChild(customElement);

    const { result } = renderHook(() => 
      useKeyboardNavigation({ 
        containerRef: { current: customElement },
        selector: '.custom-item'
      })
    );

    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(1);

    document.body.removeChild(customElement);
  });

  it('should handle empty container', () => {
    const emptyElement = document.createElement('div');
    document.body.appendChild(emptyElement);

    const { result } = renderHook(() => 
      useKeyboardNavigation({ containerRef: { current: emptyElement } })
    );

    expect(result.current.currentIndex).toBe(0);

    // Navigation should not crash with empty container
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(0);

    document.body.removeChild(emptyElement);
  });

  it('should handle null container ref', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation({ containerRef: { current: null } })
    );

    expect(result.current.currentIndex).toBe(0);

    // Should not crash with null ref
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it('should ignore non-navigation keys', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation({ containerRef: { current: mockElement } })
    );

    const initialIndex = result.current.currentIndex;

    act(() => {
      result.current.handleKeyDown({
        key: 'a',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any);
    });

    expect(result.current.currentIndex).toBe(initialIndex);
  });

  it('should reset to first item when container changes', () => {
    const { result, rerender } = renderHook(
      ({ container }) => useKeyboardNavigation({ containerRef: { current: container } }),
      { initialProps: { container: mockElement } }
    );

    // Navigate to second item
    act(() => {
      result.current.setCurrentIndex(1);
    });

    expect(result.current.currentIndex).toBe(1);

    // Change container
    const newElement = document.createElement('div');
    newElement.innerHTML = '<button>New Button</button>';
    document.body.appendChild(newElement);

    rerender({ container: newElement });

    expect(result.current.currentIndex).toBe(0);

    document.body.removeChild(newElement);
  });
});