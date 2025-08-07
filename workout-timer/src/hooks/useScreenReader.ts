import { useEffect, useRef, useCallback } from 'react';

interface ScreenReaderOptions {
  politeness?: 'polite' | 'assertive';
  delay?: number;
}

/**
 * 스크린 리더 지원을 위한 커스텀 훅
 * 동적 콘텐츠 변경 시 스크린 리더에 알림을 제공
 */
export const useScreenReader = (options: ScreenReaderOptions = {}) => {
  const { politeness = 'polite', delay = 100 } = options;
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // 라이브 리전 생성
  useEffect(() => {
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', politeness);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = `live-region-${Date.now()}`;
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [politeness]);

  // 스크린 리더에 메시지 알림
  const announce = useCallback((message: string, immediate = false) => {
    if (!liveRegionRef.current || !message.trim()) return;

    // 이전 타임아웃 클리어
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    const updateMessage = () => {
      if (liveRegionRef.current) {
        // 먼저 비우고 다시 설정하여 확실히 알림이 발생하도록 함
        liveRegionRef.current.textContent = '';
        window.setTimeout(() => {
          if (liveRegionRef.current) {
            liveRegionRef.current.textContent = message;
          }
        }, 10);
      }
    };

    if (immediate) {
      updateMessage();
    } else {
      timeoutRef.current = window.setTimeout(updateMessage, delay);
    }
  }, [delay]);

  // 타이머 상태 변경 알림
  const announceTimerState = useCallback((
    isRunning: boolean,
    isPaused: boolean,
    remainingTime: number,
    repetitions: number
  ) => {
    let message = '';
    
    if (remainingTime === 0) {
      message = `타이머 완료. 총 ${repetitions}회 반복했습니다.`;
    } else if (isRunning) {
      if (remainingTime <= 10) {
        message = `${remainingTime}초 남음`;
      } else if (remainingTime % 30 === 0) {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        if (minutes > 0) {
          message = `${minutes}분 ${seconds > 0 ? `${seconds}초` : ''} 남음`;
        } else {
          message = `${seconds}초 남음`;
        }
      }
    } else if (isPaused) {
      message = '타이머 일시정지됨';
    } else {
      message = '타이머 정지됨';
    }

    if (message) {
      announce(message);
    }
  }, [announce]);

  // 반복 횟수 변경 알림
  const announceRepetitionChange = useCallback((repetitions: number, action: 'increase' | 'decrease' | 'reset') => {
    const actionText = action === 'increase' ? '증가' : action === 'decrease' ? '감소' : '초기화';
    announce(`반복 횟수 ${actionText}. 현재 ${repetitions}회`);
  }, [announce]);

  // 템플릿 선택 알림
  const announceTemplateSelection = useCallback((templateName: string, duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    let timeText = '';
    
    if (minutes > 0) {
      timeText = `${minutes}분`;
      if (seconds > 0) {
        timeText += ` ${seconds}초`;
      }
    } else {
      timeText = `${seconds}초`;
    }
    
    announce(`${templateName} 템플릿 선택됨. ${timeText}로 설정되었습니다.`);
  }, [announce]);

  // 설정 변경 알림
  const announceSettingChange = useCallback((setting: string, value: string | boolean) => {
    const valueText = typeof value === 'boolean' ? (value ? '켜짐' : '꺼짐') : value;
    announce(`${setting} ${valueText}으로 변경됨`);
  }, [announce]);

  // 에러 알림
  const announceError = useCallback((error: string) => {
    announce(`오류: ${error}`, true);
  }, [announce]);

  return {
    announce,
    announceTimerState,
    announceRepetitionChange,
    announceTemplateSelection,
    announceSettingChange,
    announceError,
  };
};