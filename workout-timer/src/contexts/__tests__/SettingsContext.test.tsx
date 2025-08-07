import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsProvider, SettingsContext } from '../SettingsContext';
import { useSettings } from '../../hooks/useSettings';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../../types';
import { StorageService } from '../../services/StorageService';

// Mock StorageService
vi.mock('../../services/StorageService', () => ({
  StorageService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
}));

// Test component that uses the settings context
function TestComponent() {
  const {
    settings,
    updateSettings,
    updateSoundSettings,
    updateVibrationSettings,
    updateUISettings,
    resetSettings
  } = useSettings();

  return (
    <div>
      <div data-testid="sound-enabled">{settings.sound.enabled.toString()}</div>
      <div data-testid="vibration-enabled">{settings.vibration.enabled.toString()}</div>
      <div data-testid="theme">{settings.ui.theme}</div>
      <div data-testid="keep-screen-on">{settings.ui.keepScreenOn.toString()}</div>
      <div data-testid="countdown-sound">{settings.sound.countdownSound}</div>
      <div data-testid="completion-sound">{settings.sound.completionSound}</div>
      
      <button 
        data-testid="toggle-sound" 
        onClick={() => updateSoundSettings({ enabled: !settings.sound.enabled })}
      >
        Toggle Sound
      </button>
      
      <button 
        data-testid="toggle-vibration" 
        onClick={() => updateVibrationSettings({ enabled: !settings.vibration.enabled })}
      >
        Toggle Vibration
      </button>
      
      <button 
        data-testid="toggle-theme" 
        onClick={() => updateUISettings({ theme: settings.ui.theme === 'light' ? 'dark' : 'light' })}
      >
        Toggle Theme
      </button>
      
      <button 
        data-testid="update-all" 
        onClick={() => updateSettings({
          sound: { ...settings.sound, countdownSound: 'chime' },
          ui: { ...settings.ui, keepScreenOn: true }
        })}
      >
        Update All
      </button>
      
      <button data-testid="reset" onClick={resetSettings}>
        Reset
      </button>
    </div>
  );
}

describe('SettingsContext', () => {
  const mockStorageService = StorageService as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorageService.getItem.mockReturnValue(null);
  });

  it('provides default settings when no saved settings exist', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('true');
    expect(screen.getByTestId('vibration-enabled')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('keep-screen-on')).toHaveTextContent('false');
    expect(screen.getByTestId('countdown-sound')).toHaveTextContent('beep');
    expect(screen.getByTestId('completion-sound')).toHaveTextContent('bell');
  });

  it('loads saved settings from storage on initialization', () => {
    const savedSettings = {
      sound: {
        enabled: false,
        countdownSound: 'chime',
        completionSound: 'beep'
      },
      vibration: {
        enabled: false,
        pattern: [100, 50, 100]
      },
      ui: {
        theme: 'dark' as const,
        keepScreenOn: true
      }
    };

    mockStorageService.getItem.mockReturnValue(savedSettings);

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(mockStorageService.getItem).toHaveBeenCalledWith(STORAGE_KEYS.SETTINGS);
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false');
    expect(screen.getByTestId('vibration-enabled')).toHaveTextContent('false');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('keep-screen-on')).toHaveTextContent('true');
    expect(screen.getByTestId('countdown-sound')).toHaveTextContent('chime');
    expect(screen.getByTestId('completion-sound')).toHaveTextContent('beep');
  });

  it('merges saved settings with default settings for missing properties', () => {
    const partialSavedSettings = {
      sound: {
        enabled: false
        // missing countdownSound and completionSound
      },
      ui: {
        theme: 'dark' as const
        // missing keepScreenOn
      }
      // missing vibration settings
    };

    mockStorageService.getItem.mockReturnValue(partialSavedSettings);

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Should use saved values where available
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    
    // Should use default values for missing properties
    expect(screen.getByTestId('vibration-enabled')).toHaveTextContent('true');
    expect(screen.getByTestId('keep-screen-on')).toHaveTextContent('false');
    expect(screen.getByTestId('countdown-sound')).toHaveTextContent('beep');
    expect(screen.getByTestId('completion-sound')).toHaveTextContent('bell');
  });

  it('handles storage loading errors gracefully', () => {
    mockStorageService.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error));
    
    // Should fall back to default settings
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    consoleSpy.mockRestore();
  });

  it('updates sound settings and saves to storage', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const toggleButton = screen.getByTestId('toggle-sound');
    
    await act(async () => {
      toggleButton.click();
    });

    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false');
    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.SETTINGS,
      expect.objectContaining({
        sound: expect.objectContaining({
          enabled: false
        })
      })
    );
  });

  it('updates vibration settings and saves to storage', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const toggleButton = screen.getByTestId('toggle-vibration');
    
    await act(async () => {
      toggleButton.click();
    });

    expect(screen.getByTestId('vibration-enabled')).toHaveTextContent('false');
    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.SETTINGS,
      expect.objectContaining({
        vibration: expect.objectContaining({
          enabled: false
        })
      })
    );
  });

  it('updates UI settings and saves to storage', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const toggleButton = screen.getByTestId('toggle-theme');
    
    await act(async () => {
      toggleButton.click();
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.SETTINGS,
      expect.objectContaining({
        ui: expect.objectContaining({
          theme: 'dark'
        })
      })
    );
  });

  it('updates multiple settings at once', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const updateButton = screen.getByTestId('update-all');
    
    await act(async () => {
      updateButton.click();
    });

    expect(screen.getByTestId('countdown-sound')).toHaveTextContent('chime');
    expect(screen.getByTestId('keep-screen-on')).toHaveTextContent('true');
    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.SETTINGS,
      expect.objectContaining({
        sound: expect.objectContaining({
          countdownSound: 'chime'
        }),
        ui: expect.objectContaining({
          keepScreenOn: true
        })
      })
    );
  });

  it('resets settings to defaults', async () => {
    // Start with modified settings
    const modifiedSettings = {
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
        theme: 'dark' as const,
        keepScreenOn: true
      }
    };

    mockStorageService.getItem.mockReturnValue(modifiedSettings);

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Verify modified settings are loaded
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    const resetButton = screen.getByTestId('reset');
    
    await act(async () => {
      resetButton.click();
    });

    // Should reset to defaults
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('true');
    expect(screen.getByTestId('vibration-enabled')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('keep-screen-on')).toHaveTextContent('false');
    expect(screen.getByTestId('countdown-sound')).toHaveTextContent('beep');
    expect(screen.getByTestId('completion-sound')).toHaveTextContent('bell');

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.SETTINGS,
      DEFAULT_SETTINGS
    );
  });

  it('handles storage saving errors gracefully', async () => {
    mockStorageService.setItem.mockImplementation(() => {
      throw new Error('Storage save error');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const toggleButton = screen.getByTestId('toggle-sound');
    
    await act(async () => {
      toggleButton.click();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to save settings:', expect.any(Error));
    
    // Settings should still be updated in memory
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false');

    consoleSpy.mockRestore();
  });

  it('throws error when useSettings is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSettings must be used within a SettingsProvider');

    consoleSpy.mockRestore();
  });
});