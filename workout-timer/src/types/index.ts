// Core Types for Workout Timer App

export interface TimerState {
  mode: 'timer' | 'stopwatch';  // 타이머/스톱워치 모드
  duration: number;        // 설정된 총 시간 (초) - 타이머 모드용
  remainingTime: number;   // 남은 시간 (밀리초) - 타이머 모드용
  elapsedTime: number;     // 경과 시간 (밀리초) - 스톱워치 모드용
  repetitions: number;     // 현재 반복 횟수
  isRunning: boolean;      // 타이머/스톱워치 실행 상태
  isPaused: boolean;       // 일시정지 상태
  voiceCountActive: boolean;     // 음성 카운트 활성 상태
  voiceCountNumber: number;      // 현재 음성 카운트 숫자
}

export interface SettingsState {
  sound: {
    enabled: boolean;
    countdownSound: string;
    completionSound: string;
  };
  vibration: {
    enabled: boolean;
    pattern: number[];
  };
  ui: {
    theme: 'light' | 'dark';
    keepScreenOn: boolean;
  };
}

export interface Template {
  id: string;
  name: string;
  duration: number; // 초 단위
  isDefault: boolean;
  createdAt: Date;
}

export interface TemplateState {
  templates: Template[];
  isLoading: boolean;
  error: string | null;
}

// Action Types
export type TimerAction =
  | { type: 'SET_MODE'; payload: { mode: 'timer' | 'stopwatch' } }
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'RESET_REPETITIONS' }
  | { type: 'COMPLETE_TIMER' }
  | { type: 'SET_DURATION'; payload: { duration: number } }
  | { type: 'INCREMENT_REPETITIONS' }
  | { type: 'DECREMENT_REPETITIONS' }
  | { type: 'TICK'; payload?: { remainingTime?: number; elapsedTime?: number } }
  | { type: 'TOGGLE_VOICE_COUNT' }
  | { type: 'INCREMENT_VOICE_COUNT' };

export type TemplateAction =
  | { type: 'ADD_TEMPLATE'; payload: { template: Omit<Template, 'id' | 'createdAt'> } }
  | { type: 'UPDATE_TEMPLATE'; payload: { id: string; updates: Partial<Template> } }
  | { type: 'DELETE_TEMPLATE'; payload: { id: string } }
  | { type: 'LOAD_TEMPLATES' }
  | { type: 'SET_TEMPLATES'; payload: { templates: Template[] } }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean } }
  | { type: 'SET_ERROR'; payload: { error: string | null } };

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
  tabIndex?: number;
}

export interface CircularProgressProps {
  progress: number;      // 0-100 사이의 진행률
  size: number;         // 원의 크기
  strokeWidth: number;  // 선의 두께
  color: string;        // 진행률 색상
  backgroundColor?: string;
  className?: string;
}

export interface DragTimeInputProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

// Service Types
export interface TimerCallbacks {
  onTick: (timeMs: number) => void; // remainingTime for timer mode, elapsedTime for stopwatch mode
  onComplete: () => void;
  onCountdown: (seconds: number) => void;
}

export interface NotificationOptions {
  sound: boolean;
  vibration: boolean;
  countdownSound?: string;
  completionSound?: string;
  vibrationPattern?: number[];
}

// Utility Types
export type Theme = 'light' | 'dark';

export interface DragState {
  isDragging: boolean;
  startY: number;
  startValue: number;
  sensitivity: number; // 드래그 민감도 (픽셀당 변화량)
}

// Constants
export const DEFAULT_TEMPLATES: Omit<Template, 'id' | 'createdAt'>[] = [
  { name: '30초', duration: 30, isDefault: true },
  { name: '1분', duration: 60, isDefault: true },
  { name: '3분', duration: 180, isDefault: true }
];

// Default template IDs (for consistency)
export const DEFAULT_TEMPLATE_IDS = {
  THIRTY_SECONDS: 'default-30s',
  ONE_MINUTE: 'default-1m',
  THREE_MINUTES: 'default-3m'
} as const;

export const DEFAULT_SETTINGS: SettingsState = {
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
};

export const TIMER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed'
} as const;

export type TimerStatus = typeof TIMER_STATES[keyof typeof TIMER_STATES];

// Time-related constants
export const TIME_CONSTANTS = {
  MIN_SECONDS: 1,
  MAX_SECONDS: 3599, // 59분 59초
  MIN_MINUTES: 0,
  MAX_MINUTES: 59,
  COUNTDOWN_THRESHOLD: 3, // 카운트다운 알림 시작 시간 (초)
  WARNING_THRESHOLD: 10,  // 경고 색상 시작 시간 (초)
  DANGER_THRESHOLD: 30    // 위험 색상 시작 시간 (초)
} as const;

// Audio-related constants
export const AUDIO_CONSTANTS = {
  SOUNDS: {
    BEEP: 'beep',
    BELL: 'bell',
    CHIME: 'chime'
  },
  DEFAULT_VOLUME: 0.8,
  COUNTDOWN_VOLUME: 0.6,
  COMPLETION_VOLUME: 1.0
} as const;

// Vibration patterns
export const VIBRATION_PATTERNS = {
  COUNTDOWN: [100],
  COMPLETION: [200, 100, 200, 100, 200],
  SHORT: [50],
  LONG: [300]
} as const;

// UI Constants
export const UI_CONSTANTS = {
  DRAG_SENSITIVITY: 2, // 픽셀당 변화량
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 16, // ~60fps
  ANIMATION_DURATION: 200,
  TOUCH_TARGET_SIZE: 44 // 최소 터치 타겟 크기 (px)
} as const;

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'workout-timer-settings',
  TEMPLATES: 'workout-timer-templates',
  THEME: 'workout-timer-theme',
  TIMER_STATE: 'workout-timer-state'
} as const;

// Additional utility types
export type SoundType = typeof AUDIO_CONSTANTS.SOUNDS[keyof typeof AUDIO_CONSTANTS.SOUNDS];
export type VibrationPattern = typeof VIBRATION_PATTERNS[keyof typeof VIBRATION_PATTERNS];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Error types
export interface TimerError {
  code: string;
  message: string;
  timestamp: Date;
}

// Event types for timer
export interface TimerTickEvent {
  remainingTime: number;
  progress: number;
  isCountdown: boolean;
}

export interface TimerCompleteEvent {
  totalDuration: number;
  repetitions: number;
  timestamp: Date;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Template form data
export interface TemplateFormData {
  name: string;
  minutes: number;
  seconds: number;
}

// Settings form data
export interface SettingsFormData {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  countdownSound: SoundType;
  completionSound: SoundType;
  theme: Theme;
  keepScreenOn: boolean;
}