// Settings Context - 설정 상태 관리 및 저장
import { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { SettingsState } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../types';
import { StorageService } from '../services/StorageService';

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (updates: Partial<SettingsState>) => void;
  updateSoundSettings: (updates: Partial<SettingsState['sound']>) => void;
  updateVibrationSettings: (updates: Partial<SettingsState['vibration']>) => void;
  updateUISettings: (updates: Partial<SettingsState['ui']>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  // 초기 설정 로드
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = StorageService.getItem<SettingsState>(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
          // 저장된 설정과 기본 설정을 병합 (새로운 설정 항목 대응)
          const mergedSettings: SettingsState = {
            sound: { ...DEFAULT_SETTINGS.sound, ...savedSettings.sound },
            vibration: { ...DEFAULT_SETTINGS.vibration, ...savedSettings.vibration },
            ui: { ...DEFAULT_SETTINGS.ui, ...savedSettings.ui }
          };
          setSettings(mergedSettings);
          console.log('Settings loaded from storage:', mergedSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // 로드 실패 시 기본 설정 사용
        setSettings(DEFAULT_SETTINGS);
      }
    };

    loadSettings();
  }, []);

  // 설정 저장 (메모화)
  const saveSettings = useCallback((newSettings: SettingsState) => {
    try {
      StorageService.setItem(STORAGE_KEYS.SETTINGS, newSettings);
      console.log('Settings saved to storage:', newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, []);

  // 전체 설정 업데이트 (메모화)
  const updateSettings = useCallback((updates: Partial<SettingsState>) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        ...updates,
        // 중첩된 객체는 개별적으로 병합
        sound: updates.sound ? { ...prev.sound, ...updates.sound } : prev.sound,
        vibration: updates.vibration ? { ...prev.vibration, ...updates.vibration } : prev.vibration,
        ui: updates.ui ? { ...prev.ui, ...updates.ui } : prev.ui
      };
      
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  // 사운드 설정 업데이트 (메모화)
  const updateSoundSettings = useCallback((updates: Partial<SettingsState['sound']>) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        sound: { ...prev.sound, ...updates }
      };
      
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  // 진동 설정 업데이트 (메모화)
  const updateVibrationSettings = useCallback((updates: Partial<SettingsState['vibration']>) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        vibration: { ...prev.vibration, ...updates }
      };
      
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  // UI 설정 업데이트 (메모화)
  const updateUISettings = useCallback((updates: Partial<SettingsState['ui']>) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        ui: { ...prev.ui, ...updates }
      };
      
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  // 설정 초기화 (메모화)
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    console.log('Settings reset to defaults');
  }, [saveSettings]);

  const contextValue: SettingsContextType = useMemo(() => ({
    settings,
    updateSettings,
    updateSoundSettings,
    updateVibrationSettings,
    updateUISettings,
    resetSettings
  }), [settings, updateSettings, updateSoundSettings, updateVibrationSettings, updateUISettings, resetSettings]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

