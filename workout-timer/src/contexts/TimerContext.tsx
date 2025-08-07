// Timer Context - useReducer를 사용한 타이머 상태 관리
import { createContext, useReducer, useRef, useEffect, useContext, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { TimerState, TimerAction, TimerCallbacks } from '../types';
import { Timer } from '../services/Timer';
import { NotificationService } from '../services/NotificationService';
import { BackgroundSyncService } from '../services/BackgroundSyncService';
import { WakeLockService } from '../services/WakeLockService';
import { SettingsContext } from './SettingsContext';
import { useScreenReader } from '../hooks/useScreenReader';

interface TimerContextType {
  state: TimerState;
  dispatch: React.Dispatch<TimerAction>;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  resetRepetitions: () => void;
  setDuration: (duration: number) => void;
  incrementRepetitions: () => void;
  decrementRepetitions: () => void;
  notificationService: NotificationService;
  testNotification: (type: 'countdown' | 'completion') => Promise<void>;
}

export const TimerContext = createContext<TimerContextType | undefined>(undefined);

const initialState: TimerState = {
  duration: 60, // 기본 1분 (초)
  remainingTime: 60000, // 기본 1분 (밀리초)
  repetitions: 0,
  isRunning: false,
  isPaused: false,
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START_TIMER':
      return {
        ...state,
        isRunning: true,
        isPaused: false,
      };

    case 'PAUSE_TIMER':
      return {
        ...state,
        isRunning: false,
        isPaused: true,
      };

    case 'RESET_TIMER':
      return {
        ...state,
        remainingTime: state.duration * 1000, // 초를 밀리초로 변환
        isRunning: false,
        isPaused: false,
      };

    case 'RESET_REPETITIONS':
      return {
        ...state,
        repetitions: 0,
      };

    case 'COMPLETE_TIMER':
      return {
        ...state,
        remainingTime: state.duration * 1000, // 초를 밀리초로 변환
        isRunning: false,
        isPaused: false,
        // repetitions는 그대로 유지 (자동 증가 제거)
      };

    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload.duration,
        remainingTime: action.payload.duration * 1000, // 초를 밀리초로 변환
        isRunning: false,
        isPaused: false,
      };

    case 'INCREMENT_REPETITIONS':
      return {
        ...state,
        repetitions: state.repetitions + 1,
      };

    case 'DECREMENT_REPETITIONS':
      return {
        ...state,
        repetitions: Math.max(0, state.repetitions - 1),
      };

    case 'TICK':
      return {
        ...state,
        remainingTime: action.payload?.remainingTime ?? state.remainingTime,
      };

    default:
      return state;
  }
}

interface TimerProviderProps {
  children: ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const timerRef = useRef<Timer | null>(null);
  const notificationServiceRef = useRef<NotificationService | null>(null);
  const backgroundSyncRef = useRef<BackgroundSyncService | null>(null);
  const wakeLockServiceRef = useRef<WakeLockService | null>(null);
  const settingsContext = useContext(SettingsContext);

  // 스크린 리더 지원
  const { announceTimerState, announceRepetitionChange } = useScreenReader();

  // NotificationService 초기화
  useEffect(() => {
    notificationServiceRef.current = new NotificationService();

    return () => {
      if (notificationServiceRef.current) {
        notificationServiceRef.current.destroy();
      }
    };
  }, []);

  // BackgroundSyncService 및 WakeLockService 초기화
  useEffect(() => {
    backgroundSyncRef.current = new BackgroundSyncService();
    wakeLockServiceRef.current = new WakeLockService();

    // Wake Lock 가시성 핸들러 설정
    wakeLockServiceRef.current.setupVisibilityHandler();

    // 타이머 상태 요청 이벤트 리스너
    const handleGetTimerState = (event: Event) => {
      (event as any).detail = state;
    };

    // 타이머 상태 복원 이벤트 리스너
    const handleRestoreTimerState = (event: Event) => {
      const customEvent = event as CustomEvent;
      const restoredState = customEvent.detail;

      // 상태 복원
      dispatch({ type: 'SET_DURATION', payload: { duration: restoredState.duration } });
      dispatch({ type: 'TICK', payload: { remainingTime: restoredState.remainingTime } });

      // 반복 횟수 복원
      for (let i = 0; i < restoredState.repetitions; i++) {
        dispatch({ type: 'INCREMENT_REPETITIONS' });
      }

      // 타이머 상태 복원
      if (restoredState.isRunning && !restoredState.isPaused) {
        if (timerRef.current) {
          timerRef.current.start(restoredState.remainingTime);
        }
        dispatch({ type: 'START_TIMER' });
      } else if (restoredState.isPaused) {
        dispatch({ type: 'PAUSE_TIMER' });
      }
    };

    document.addEventListener('get-timer-state', handleGetTimerState);
    document.addEventListener('restore-timer-state', handleRestoreTimerState);

    return () => {
      if (backgroundSyncRef.current) {
        backgroundSyncRef.current.destroy();
      }
      if (wakeLockServiceRef.current) {
        wakeLockServiceRef.current.destroy();
      }
      document.removeEventListener('get-timer-state', handleGetTimerState);
      document.removeEventListener('restore-timer-state', handleRestoreTimerState);
    };
  }, [state]);

  // Wake Lock 상태 관리 (타이머 상태 변경 시)
  useEffect(() => {
    if (wakeLockServiceRef.current && settingsContext?.settings.ui?.keepScreenOn) {
      wakeLockServiceRef.current.handleTimerStateChange(state.isRunning && !state.isPaused);
    }
  }, [state.isRunning, state.isPaused, settingsContext?.settings.ui?.keepScreenOn]);

  // 설정 변경 시 알림 서비스 업데이트
  useEffect(() => {
    if (notificationServiceRef.current && settingsContext) {
      const { sound, vibration } = settingsContext.settings;
      notificationServiceRef.current.updateSettings(sound, vibration);
    }
  }, [settingsContext?.settings]);

  // Timer 서비스 초기화
  useEffect(() => {
    const callbacks: TimerCallbacks = {
      onTick: (remainingTimeMs: number) => {
        dispatch({ type: 'TICK', payload: { remainingTime: remainingTimeMs } });
      },
      onComplete: async () => {
        // 완료 알림 실행
        if (notificationServiceRef.current) {
          await notificationServiceRef.current.notifyCompletion();
        }

        // 타이머 완료 처리 (반복 횟수 증가 포함)
        dispatch({ type: 'COMPLETE_TIMER' });

        // 스크린 리더 알림
        announceTimerState(false, false, 0, state.repetitions);
      },
      onCountdown: async (seconds: number) => {
        // 카운트다운 알림 실행
        if (notificationServiceRef.current) {
          await notificationServiceRef.current.notifyCountdown();
        }
        console.log(`Countdown: ${seconds} seconds remaining`);
      },
    };

    timerRef.current = new Timer(callbacks);

    return () => {
      if (timerRef.current) {
        timerRef.current.destroy();
      }
    };
  }, []);

  // 타이머 액션 함수들 (메모화)
  const startTimer = useCallback(async () => {
    if (timerRef.current && !state.isRunning) {
      // 사용자 상호작용 후 알림 서비스 초기화
      if (notificationServiceRef.current && !notificationServiceRef.current.isReady()) {
        await notificationServiceRef.current.initializeAfterUserInteraction();
      }

      if (state.isPaused) {
        // 일시정지 상태에서 재개
        timerRef.current.resume();
      } else {
        // 새로 시작
        timerRef.current.start(state.duration);
      }
      dispatch({ type: 'START_TIMER' });

      // 스크린 리더 알림
      announceTimerState(true, false, state.remainingTime, state.repetitions);
    }
  }, [state.isRunning, state.isPaused, state.duration, state.remainingTime, state.repetitions, announceTimerState]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current && state.isRunning) {
      timerRef.current.pause();
      dispatch({ type: 'PAUSE_TIMER' });

      // 스크린 리더 알림
      announceTimerState(false, true, state.remainingTime, state.repetitions);
    }
  }, [state.isRunning, state.remainingTime, state.repetitions, announceTimerState]);

  const resumeTimer = useCallback(() => {
    if (timerRef.current && state.isPaused) {
      timerRef.current.resume();
      dispatch({ type: 'START_TIMER' });
    }
  }, [state.isPaused]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      timerRef.current.reset();
      dispatch({ type: 'RESET_TIMER' });

      // 스크린 리더 알림 (카운터는 유지)
      announceTimerState(false, false, state.duration, state.repetitions);
    }
  }, [state.duration, state.repetitions, announceTimerState]);

  const resetRepetitions = useCallback(() => {
    dispatch({ type: 'RESET_REPETITIONS' });

    // 스크린 리더 알림
    announceRepetitionChange(0, 'reset');
  }, [announceRepetitionChange]);

  const setDuration = useCallback((duration: number) => {
    if (timerRef.current) {
      timerRef.current.reset();
      dispatch({ type: 'SET_DURATION', payload: { duration } });
    }
  }, []);

  const incrementRepetitions = useCallback(() => {
    dispatch({ type: 'INCREMENT_REPETITIONS' });

    // 스크린 리더 알림
    announceRepetitionChange(state.repetitions + 1, 'increase');
  }, [state.repetitions, announceRepetitionChange]);

  const decrementRepetitions = useCallback(() => {
    if (state.repetitions > 0) {
      dispatch({ type: 'DECREMENT_REPETITIONS' });

      // 스크린 리더 알림
      announceRepetitionChange(state.repetitions - 1, 'decrease');
    }
  }, [state.repetitions, announceRepetitionChange]);

  // 알림 테스트 함수 (설정 화면에서 사용)
  const testNotification = useCallback(async (type: 'countdown' | 'completion') => {
    if (notificationServiceRef.current) {
      await notificationServiceRef.current.testNotification(type);
    }
  }, []);

  const contextValue: TimerContextType = useMemo(() => ({
    state,
    dispatch,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    resetRepetitions,
    setDuration,
    incrementRepetitions,
    decrementRepetitions,
    notificationService: notificationServiceRef.current!,
    testNotification,
  }), [
    state,
    dispatch,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    resetRepetitions,
    setDuration,
    incrementRepetitions,
    decrementRepetitions,
    testNotification
  ]);

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
}

