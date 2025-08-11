// Storage Service - localStorage wrapper with error handling
import type { SettingsState } from '../types';

export class StorageService {
  // 템플릿 키 제거
  private static readonly SETTINGS_KEY = 'workout-timer-settings';

  /**
   * Generic method to save data to localStorage
   */
  static setItem<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error(`Failed to save to localStorage (${key}):`, error);
      throw new Error(`Storage operation failed: ${error}`);
    }
  }

  /**
   * Generic method to load data from localStorage
   */
  static getItem<T>(key: string): T | null {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return null;
      }
      return JSON.parse(serializedData);
    } catch (error) {
      console.error(`Failed to load from localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage (${key}):`, error);
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // 템플릿 관련 메서드 제거

  // Settings-specific methods
  static saveSettings(settings: SettingsState): void {
    this.setItem(this.SETTINGS_KEY, settings);
  }

  static loadSettings(): SettingsState | null {
    return this.getItem<SettingsState>(this.SETTINGS_KEY);
  }
}