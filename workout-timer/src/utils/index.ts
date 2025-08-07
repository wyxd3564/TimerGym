// Utility Functions for Workout Timer App
import type { SettingsState } from '../types';

/**
 * 초를 MM:SS 형식으로 포맷팅
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * 밀리초를 포함한 시간을 MM:SS.mmm 형식으로 포맷팅
 */
export const formatTimeWithMilliseconds = (totalMilliseconds: number): string => {
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const milliseconds = totalMilliseconds % 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${Math.floor(milliseconds / 10).toString().padStart(2, '0')}`;
};

/**
 * MM:SS 형식의 문자열을 초로 변환
 */
export const parseTime = (timeString: string): number => {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return (minutes || 0) * 60 + (seconds || 0);
};

/**
 * 진행률 계산 (0-100)
 * @param remainingTime 남은 시간 (밀리초)
 * @param totalTime 총 시간 (초)
 */
export const calculateProgress = (remainingTime: number, totalTime: number): number => {
  if (totalTime === 0) return 0;
  const totalTimeMs = totalTime * 1000; // 초를 밀리초로 변환
  const progress = ((totalTimeMs - remainingTime) / totalTimeMs) * 100;
  return Math.max(0, Math.min(100, progress));
};

/**
 * 남은 시간에 따른 색상 결정
 * @param remainingTime 남은 시간 (밀리초)
 */
export const getTimerColor = (remainingTime: number): string => {
  const remainingSeconds = remainingTime / 1000;
  if (remainingSeconds <= 10) {
    return 'var(--color-timer-danger)';
  } else if (remainingSeconds <= 30) {
    return 'var(--color-timer-warning)';
  } else {
    return 'var(--color-timer-normal)';
  }
};

/**
 * 로컬 스토리지에 데이터 저장
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
};

/**
 * 로컬 스토리지에서 데이터 로드
 */
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error(`Error loading from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * 고유 ID 생성
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * 드래그 민감도 계산
 */
export const calculateDragValue = (
  startValue: number,
  startY: number,
  currentY: number,
  sensitivity: number,
  step: number,
  min: number,
  max: number
): number => {
  const deltaY = startY - currentY; // 위로 드래그하면 양수
  const deltaValue = Math.floor(deltaY / sensitivity) * step;
  const newValue = startValue + deltaValue;
  return Math.max(min, Math.min(max, newValue));
};

/**
 * 디바이스가 터치를 지원하는지 확인
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * 브라우저가 Vibration API를 지원하는지 확인
 */
export const isVibrationSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * 브라우저가 Web Audio API를 지원하는지 확인
 */
export const isAudioSupported = (): boolean => {
  return 'AudioContext' in window || 'webkitAudioContext' in window;
};

/**
 * 브라우저가 Wake Lock API를 지원하는지 확인
 */
export const isWakeLockSupported = (): boolean => {
  return 'wakeLock' in navigator;
};

/**
 * 숫자를 특정 범위로 제한
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * 디바운스 함수
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 스로틀 함수
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

/**
 * CSS 클래스명 결합
 */
export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * 현재 테마 감지
 */
export const getCurrentTheme = (): 'light' | 'dark' => {
  const savedTheme = loadFromLocalStorage<'light' | 'dark'>('theme', 'light');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }
  
  // 시스템 테마 감지
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

/**
 * 테마 적용
 */
export const applyTheme = (theme: 'light' | 'dark'): void => {
  document.documentElement.setAttribute('data-theme', theme);
  saveToLocalStorage('theme', theme);
};

/**
 * 시간 유효성 검사
 */
export const isValidTime = (minutes: number, seconds: number): boolean => {
  return (
    minutes >= 0 && 
    minutes <= 59 && 
    seconds >= 0 && 
    seconds <= 59 && 
    (minutes > 0 || seconds > 0) // 최소 1초는 있어야 함
  );
};

/**
 * 총 시간을 분과 초로 분해
 */
export const splitTime = (totalSeconds: number): { minutes: number; seconds: number } => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds };
};

/**
 * 분과 초를 총 초로 결합
 */
export const combineTime = (minutes: number, seconds: number): number => {
  return minutes * 60 + seconds;
};

/**
 * 반복 횟수 유효성 검사
 */
export const isValidRepetitions = (repetitions: number): boolean => {
  return repetitions >= 0 && Number.isInteger(repetitions);
};

/**
 * 템플릿 이름 유효성 검사
 */
export const isValidTemplateName = (name: string): boolean => {
  return name.trim().length > 0 && name.trim().length <= 50;
};

/**
 * 카운트다운 시간인지 확인
 */
export const isCountdownTime = (remainingTime: number): boolean => {
  return remainingTime <= 3 && remainingTime > 0;
};

/**
 * 경고 시간인지 확인
 * @param remainingTime 남은 시간 (밀리초)
 */
export const isWarningTime = (remainingTime: number): boolean => {
  const remainingSeconds = remainingTime / 1000;
  return remainingSeconds <= 30 && remainingSeconds > 10;
};

/**
 * 위험 시간인지 확인
 * @param remainingTime 남은 시간 (밀리초)
 */
export const isDangerTime = (remainingTime: number): boolean => {
  const remainingSeconds = remainingTime / 1000;
  return remainingSeconds <= 10;
};

/**
 * 템플릿 폼 데이터 유효성 검사
 */
export const validateTemplateForm = (data: { name: string; minutes: number; seconds: number }): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!isValidTemplateName(data.name)) {
    errors.push('템플릿 이름은 1-50자 사이여야 합니다.');
  }
  
  if (!isValidTime(data.minutes, data.seconds)) {
    errors.push('시간은 최소 1초 이상이어야 하며, 59분 59초를 초과할 수 없습니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 설정 데이터 유효성 검사
 */
export const validateSettings = (settings: Partial<SettingsState>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // 기본적인 타입 체크는 TypeScript가 처리하므로 여기서는 비즈니스 로직 검증만
  if (settings.sound?.countdownSound && !Object.values(['beep', 'bell', 'chime']).includes(settings.sound.countdownSound)) {
    errors.push('유효하지 않은 카운트다운 사운드입니다.');
  }
  
  if (settings.sound?.completionSound && !Object.values(['beep', 'bell', 'chime']).includes(settings.sound.completionSound)) {
    errors.push('유효하지 않은 완료 사운드입니다.');
  }
  
  if (settings.ui?.theme && !['light', 'dark'].includes(settings.ui.theme)) {
    errors.push('유효하지 않은 테마입니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};