import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSettings } from '../useSettings';
import { SettingsProvider } from '../../contexts/SettingsContext';
import type { ReactNode } from 'react';

// Mock StorageService
vi.mock('../../services/StorageService', () => ({
  StorageService: {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
}));

describe('useSettings', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SettingsProvider>{children}</SettingsProvider>
  );

  it('returns settings context when used within provider', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current).toEqual(
      expect.objectContaining({
        settings: expect.objectContaining({
          sound: expect.objectContaining({
            enabled: expect.any(Boolean),
            countdownSound: expect.any(String),
            completionSound: expect.any(String)
          }),
          vibration: expect.objectContaining({
            enabled: expect.any(Boolean),
            pattern: expect.any(Array)
          }),
          ui: expect.objectContaining({
            theme: expect.any(String),
            keepScreenOn: expect.any(Boolean)
          })
        }),
        updateSettings: expect.any(Function),
        updateSoundSettings: expect.any(Function),
        updateVibrationSettings: expect.any(Function),
        updateUISettings: expect.any(Function),
        resetSettings: expect.any(Function)
      })
    );
  });

  it('throws error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSettings());
    }).toThrow('useSettings must be used within a SettingsProvider');

    consoleSpy.mockRestore();
  });

  it('provides default settings initially', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings).toEqual({
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
        theme: 'light',
        keepScreenOn: false
      }
    });
  });
});