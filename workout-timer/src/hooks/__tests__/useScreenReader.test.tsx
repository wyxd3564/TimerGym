import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useScreenReader } from '../useScreenReader';

describe('useScreenReader', () => {
  let mockLiveRegion: HTMLElement;

  beforeEach(() => {
    // Create mock live region
    mockLiveRegion = document.createElement('div');
    mockLiveRegion.setAttribute('aria-live', 'polite');
    mockLiveRegion.setAttribute('aria-atomic', 'true');
    mockLiveRegion.className = 'sr-only';
    document.body.appendChild(mockLiveRegion);

    // Mock querySelector to return our mock element
    vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
      if (selector === '[aria-live]') {
        return mockLiveRegion;
      }
      return null;
    });
  });

  afterEach(() => {
    if (mockLiveRegion && document.body.contains(mockLiveRegion)) {
      document.body.removeChild(mockLiveRegion);
    }
    vi.restoreAllMocks();
  });

  it('should create live region if none exists', () => {
    vi.spyOn(document, 'querySelector').mockReturnValue(null);
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');

    renderHook(() => useScreenReader());

    expect(createElementSpy).toHaveBeenCalledWith('div');
    expect(appendChildSpy).toHaveBeenCalled();
  });

  it('should use existing live region if available', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');

    renderHook(() => useScreenReader());

    expect(createElementSpy).not.toHaveBeenCalled();
  });

  it('should announce message with default politeness', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announce('Test message');
    });

    expect(mockLiveRegion.textContent).toBe('Test message');
    expect(mockLiveRegion.getAttribute('aria-live')).toBe('polite');
  });

  it('should announce message with assertive politeness', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announce('Urgent message', 'assertive');
    });

    expect(mockLiveRegion.textContent).toBe('Urgent message');
    expect(mockLiveRegion.getAttribute('aria-live')).toBe('assertive');
  });

  it('should announce message with off politeness', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announce('Silent message', 'off');
    });

    expect(mockLiveRegion.textContent).toBe('Silent message');
    expect(mockLiveRegion.getAttribute('aria-live')).toBe('off');
  });

  it('should clear announcement after delay', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announce('Test message');
    });

    expect(mockLiveRegion.textContent).toBe('Test message');

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockLiveRegion.textContent).toBe('');

    vi.useRealTimers();
  });

  it('should announce timer status', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announceTimerStatus('running', 30, 60);
    });

    expect(mockLiveRegion.textContent).toBe('타이머 시작됨. 남은 시간: 30초, 총 시간: 1분');
  });

  it('should announce timer completion', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announceTimerStatus('completed', 0, 60);
    });

    expect(mockLiveRegion.textContent).toBe('타이머 완료됨');
  });

  it('should announce timer pause', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announceTimerStatus('paused', 45, 60);
    });

    expect(mockLiveRegion.textContent).toBe('타이머 일시정지됨. 남은 시간: 45초');
  });

  it('should announce repetition count', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announceRepetitionCount(5);
    });

    expect(mockLiveRegion.textContent).toBe('반복 횟수: 5회');
  });

  it('should announce template selection', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announceTemplateSelection('1분 운동', 60);
    });

    expect(mockLiveRegion.textContent).toBe('템플릿 선택됨: 1분 운동, 1분');
  });

  it('should announce settings change', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announceSettingsChange('sound', true);
    });

    expect(mockLiveRegion.textContent).toBe('소리 알림이 켜졌습니다');

    act(() => {
      result.current.announceSettingsChange('vibration', false);
    });

    expect(mockLiveRegion.textContent).toBe('진동 알림이 꺼졌습니다');
  });

  it('should announce error messages', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announceError('타이머 설정에 오류가 발생했습니다');
    });

    expect(mockLiveRegion.textContent).toBe('오류: 타이머 설정에 오류가 발생했습니다');
    expect(mockLiveRegion.getAttribute('aria-live')).toBe('assertive');
  });

  it('should announce success messages', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announceSuccess('템플릿이 저장되었습니다');
    });

    expect(mockLiveRegion.textContent).toBe('성공: 템플릿이 저장되었습니다');
    expect(mockLiveRegion.getAttribute('aria-live')).toBe('polite');
  });

  it('should format time correctly', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announceTimerStatus('running', 90, 150);
    });

    expect(mockLiveRegion.textContent).toBe('타이머 시작됨. 남은 시간: 1분 30초, 총 시간: 2분 30초');
  });

  it('should handle zero seconds', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announceTimerStatus('running', 60, 60);
    });

    expect(mockLiveRegion.textContent).toBe('타이머 시작됨. 남은 시간: 1분, 총 시간: 1분');
  });

  it('should handle seconds only', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announceTimerStatus('running', 45, 45);
    });

    expect(mockLiveRegion.textContent).toBe('타이머 시작됨. 남은 시간: 45초, 총 시간: 45초');
  });

  it('should clear previous announcements', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announce('First message');
    });

    expect(mockLiveRegion.textContent).toBe('First message');

    act(() => {
      result.current.announce('Second message');
    });

    expect(mockLiveRegion.textContent).toBe('Second message');

    vi.useRealTimers();
  });

  it('should handle empty messages gracefully', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announce('');
    });

    expect(mockLiveRegion.textContent).toBe('');
  });

  it('should cleanup on unmount', () => {
    vi.useFakeTimers();
    const { unmount } = renderHook(() => useScreenReader());

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should handle DOM manipulation errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock appendChild to throw an error
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {
      throw new Error('DOM error');
    });

    // Mock querySelector to return null to trigger createElement
    vi.spyOn(document, 'querySelector').mockReturnValue(null);

    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announce('Test message');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to create or update live region:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle setAttribute errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock setAttribute to throw an error
    vi.spyOn(mockLiveRegion, 'setAttribute').mockImplementation(() => {
      throw new Error('setAttribute error');
    });

    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announce('Test message', 'assertive');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to create or update live region:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});