import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageService } from '../StorageService';
import type { Template, SettingsState } from '../../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getItem', () => {
    it('should return parsed JSON data when item exists', () => {
      const testData = { test: 'value' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = StorageService.getItem('test-key');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null when item does not exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = StorageService.getItem('non-existent-key');

      expect(result).toBeNull();
    });

    it('should return null when JSON parsing fails', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = StorageService.getItem('invalid-key');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error parsing stored data for key invalid-key:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle localStorage access errors', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = StorageService.getItem('error-key');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error accessing localStorage for key error-key:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('setItem', () => {
    it('should store JSON stringified data', () => {
      const testData = { test: 'value', number: 42 };

      StorageService.setItem('test-key', testData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
    });

    it('should handle localStorage write errors', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      StorageService.setItem('error-key', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith('Error storing data for key error-key:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('removeItem', () => {
    it('should remove item from localStorage', () => {
      StorageService.removeItem('test-key');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should handle localStorage remove errors', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      StorageService.removeItem('error-key');

      expect(consoleSpy).toHaveBeenCalledWith('Error removing data for key error-key:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('should clear all localStorage data', () => {
      StorageService.clear();

      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });

    it('should handle localStorage clear errors', () => {
      mockLocalStorage.clear.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      StorageService.clear();

      expect(consoleSpy).toHaveBeenCalledWith('Error clearing localStorage:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('loadTemplates', () => {
    it('should load templates from storage', () => {
      const mockTemplates: Template[] = [
        {
          id: 'template-1',
          name: 'Test Template',
          duration: 120,
          isDefault: false,
          createdAt: new Date('2023-01-01')
        }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTemplates));

      const result = StorageService.loadTemplates();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('workout-timer-templates');
      expect(result).toEqual(mockTemplates);
    });

    it('should return empty array when no templates exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = StorageService.loadTemplates();

      expect(result).toEqual([]);
    });

    it('should handle invalid template data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = StorageService.loadTemplates();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('saveTemplates', () => {
    it('should save templates to storage', () => {
      const mockTemplates: Template[] = [
        {
          id: 'template-1',
          name: 'Test Template',
          duration: 120,
          isDefault: false,
          createdAt: new Date('2023-01-01')
        }
      ];

      StorageService.saveTemplates(mockTemplates);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'workout-timer-templates',
        JSON.stringify(mockTemplates)
      );
    });
  });

  describe('loadSettings', () => {
    it('should load settings from storage', () => {
      const mockSettings: SettingsState = {
        sound: {
          enabled: true,
          countdownSound: 'beep',
          completionSound: 'bell'
        },
        vibration: {
          enabled: true,
          pattern: [200, 100, 200]
        },
        ui: {
          theme: 'dark',
          keepScreenOn: true
        }
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSettings));

      const result = StorageService.loadSettings();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('workout-timer-settings');
      expect(result).toEqual(mockSettings);
    });

    it('should return null when no settings exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = StorageService.loadSettings();

      expect(result).toBeNull();
    });
  });

  describe('saveSettings', () => {
    it('should save settings to storage', () => {
      const mockSettings: SettingsState = {
        sound: {
          enabled: false,
          countdownSound: 'chime',
          completionSound: 'beep'
        },
        vibration: {
          enabled: false,
          pattern: [100]
        },
        ui: {
          theme: 'light',
          keepScreenOn: false
        }
      };

      StorageService.saveSettings(mockSettings);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'workout-timer-settings',
        JSON.stringify(mockSettings)
      );
    });
  });

  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      const result = StorageService.isStorageAvailable();

      expect(result).toBe(true);
    });

    it('should return false when localStorage is not available', () => {
      const originalLocalStorage = window.localStorage;
      
      // Remove localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });

      const result = StorageService.isStorageAvailable();

      expect(result).toBe(false);

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });

    it('should return false when localStorage throws an error', () => {
      const originalLocalStorage = window.localStorage;
      
      // Mock localStorage that throws on access
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          throw new Error('Storage disabled');
        },
        configurable: true
      });

      const result = StorageService.isStorageAvailable();

      expect(result).toBe(false);

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage information', () => {
      mockLocalStorage.length = 5;
      mockLocalStorage.key.mockImplementation((index) => `key-${index}`);
      mockLocalStorage.getItem.mockImplementation((key) => `value-for-${key}`);

      const result = StorageService.getStorageInfo();

      expect(result).toEqual({
        available: true,
        itemCount: 5,
        estimatedSize: expect.any(Number),
        keys: ['key-0', 'key-1', 'key-2', 'key-3', 'key-4']
      });
    });

    it('should handle storage info errors', () => {
      mockLocalStorage.length = 0;
      mockLocalStorage.key.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = StorageService.getStorageInfo();

      expect(result).toEqual({
        available: true,
        itemCount: 0,
        estimatedSize: 0,
        keys: []
      });
    });
  });
});