import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatTime,
  parseTime,
  calculateProgress,
  getTimerColor,
  generateId,
  calculateDragValue,
  clamp,
  isValidTime,
  splitTime,
  combineTime,
  isValidRepetitions,
  isValidTemplateName,
  isCountdownTime,
  isWarningTime,
  isDangerTime,
  validateTemplateForm,
  validateSettings,
  saveToLocalStorage,
  loadFromLocalStorage,
  isTouchDevice,
  isVibrationSupported,
  isAudioSupported,
  isWakeLockSupported,
  debounce,
  throttle,
  classNames,
  getCurrentTheme,
  applyTheme
} from '../index';

describe('Time Utilities', () => {
  it('should format time correctly', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(30)).toBe('00:30');
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(90)).toBe('01:30');
    expect(formatTime(3599)).toBe('59:59');
  });

  it('should parse time correctly', () => {
    expect(parseTime('00:00')).toBe(0);
    expect(parseTime('00:30')).toBe(30);
    expect(parseTime('01:00')).toBe(60);
    expect(parseTime('01:30')).toBe(90);
    expect(parseTime('59:59')).toBe(3599);
  });

  it('should calculate progress correctly', () => {
    expect(calculateProgress(0, 100)).toBe(100);
    expect(calculateProgress(50, 100)).toBe(50);
    expect(calculateProgress(100, 100)).toBe(0);
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it('should split and combine time correctly', () => {
    expect(splitTime(90)).toEqual({ minutes: 1, seconds: 30 });
    expect(splitTime(3599)).toEqual({ minutes: 59, seconds: 59 });
    expect(combineTime(1, 30)).toBe(90);
    expect(combineTime(59, 59)).toBe(3599);
  });
});

describe('Validation Utilities', () => {
  it('should validate time correctly', () => {
    expect(isValidTime(0, 1)).toBe(true);
    expect(isValidTime(1, 0)).toBe(true);
    expect(isValidTime(0, 0)).toBe(false);
    expect(isValidTime(-1, 0)).toBe(false);
    expect(isValidTime(60, 0)).toBe(false);
    expect(isValidTime(0, 60)).toBe(false);
  });

  it('should validate repetitions correctly', () => {
    expect(isValidRepetitions(0)).toBe(true);
    expect(isValidRepetitions(10)).toBe(true);
    expect(isValidRepetitions(-1)).toBe(false);
    expect(isValidRepetitions(1.5)).toBe(false);
  });

  it('should validate template name correctly', () => {
    expect(isValidTemplateName('Valid Name')).toBe(true);
    expect(isValidTemplateName('')).toBe(false);
    expect(isValidTemplateName('   ')).toBe(false);
    expect(isValidTemplateName('a'.repeat(51))).toBe(false);
  });

  it('should identify countdown, warning, and danger times', () => {
    expect(isCountdownTime(3)).toBe(true);
    expect(isCountdownTime(1)).toBe(true);
    expect(isCountdownTime(0)).toBe(false);
    expect(isCountdownTime(4)).toBe(false);

    expect(isWarningTime(30)).toBe(true);
    expect(isWarningTime(20)).toBe(true);
    expect(isWarningTime(10)).toBe(false);
    expect(isWarningTime(31)).toBe(false);

    expect(isDangerTime(10)).toBe(true);
    expect(isDangerTime(5)).toBe(true);
    expect(isDangerTime(11)).toBe(false);
  });
});

describe('Form Validation', () => {
  it('should validate template form correctly', () => {
    const validForm = { name: 'Test Template', minutes: 1, seconds: 30 };
    const result = validateTemplateForm(validForm);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);

    const invalidForm = { name: '', minutes: 0, seconds: 0 };
    const invalidResult = validateTemplateForm(invalidForm);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
});

describe('Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });

  it('should clamp values correctly', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should calculate drag values correctly', () => {
    const result = calculateDragValue(10, 100, 90, 2, 1, 0, 20);
    expect(result).toBe(15); // startValue + (startY - currentY) / sensitivity * step
  });

  it('should get timer color based on remaining time', () => {
    expect(getTimerColor(5)).toBe('var(--color-timer-danger)');
    expect(getTimerColor(20)).toBe('var(--color-timer-warning)');
    expect(getTimerColor(60)).toBe('var(--color-timer-normal)');
  });
});

describe('Local Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load data from localStorage', () => {
    const testData = { name: 'test', value: 123 };
    saveToLocalStorage('test-key', testData);
    
    const loaded = loadFromLocalStorage('test-key', {});
    expect(loaded).toEqual(testData);
  });

  it('should return default value when key does not exist', () => {
    const defaultValue = { default: true };
    const result = loadFromLocalStorage('non-existent-key', defaultValue);
    expect(result).toEqual(defaultValue);
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock localStorage.setItem to throw error
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    saveToLocalStorage('test', { data: 'test' });
    expect(consoleSpy).toHaveBeenCalled();
    
    // Restore
    setItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should handle JSON parse errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Set invalid JSON
    localStorage.setItem('invalid-json', 'invalid json string');
    
    const result = loadFromLocalStorage('invalid-json', { default: true });
    expect(result).toEqual({ default: true });
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});

describe('Device Detection Utilities', () => {
  it('should detect touch device', () => {
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: true
    });
    
    expect(isTouchDevice()).toBe(true);
    
    // Clean up
    delete (window as any).ontouchstart;
  });

  it('should detect non-touch device', () => {
    // Mock no touch support
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 0
    });
    
    expect(isTouchDevice()).toBe(false);
  });

  it('should detect vibration support', () => {
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: vi.fn()
    });
    
    expect(isVibrationSupported()).toBe(true);
  });

  it('should detect audio support', () => {
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      value: vi.fn()
    });
    
    expect(isAudioSupported()).toBe(true);
  });

  it('should detect wake lock support', () => {
    Object.defineProperty(navigator, 'wakeLock', {
      writable: true,
      value: {}
    });
    
    expect(isWakeLockSupported()).toBe(true);
  });
});

describe('Function Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);
    
    debouncedFn('arg1');
    debouncedFn('arg2');
    debouncedFn('arg3');
    
    expect(mockFn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(100);
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg3');
  });

  it('should throttle function calls', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);
    
    throttledFn('arg1');
    throttledFn('arg2');
    throttledFn('arg3');
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg1');
    
    vi.advanceTimersByTime(100);
    
    throttledFn('arg4');
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('arg4');
  });
});

describe('CSS Utilities', () => {
  it('should combine class names correctly', () => {
    expect(classNames('class1', 'class2')).toBe('class1 class2');
    expect(classNames('class1', null, 'class2', undefined, false)).toBe('class1 class2');
    expect(classNames()).toBe('');
  });
});

describe('Theme Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme');
  });

  it('should get current theme from localStorage', () => {
    localStorage.setItem('theme', '"dark"');
    expect(getCurrentTheme()).toBe('dark');
  });

  it('should default to light theme', () => {
    expect(getCurrentTheme()).toBe('light');
  });

  it('should apply theme to document', () => {
    applyTheme('dark');
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('"dark"');
  });

  it('should handle matchMedia availability', () => {
    // Test that getCurrentTheme doesn't crash when matchMedia is not available
    const originalMatchMedia = window.matchMedia;
    delete (window as any).matchMedia;
    
    expect(() => getCurrentTheme()).not.toThrow();
    expect(getCurrentTheme()).toBe('light'); // Should default to light
    
    // Restore
    window.matchMedia = originalMatchMedia;
  });
});