import { useEffect, useCallback } from 'react';
import { useTimer } from './useTimer';

interface KeyboardNavigationOptions {
  enableSpacebarToggle?: boolean;
  enableArrowKeys?: boolean;
  enableNumberKeys?: boolean;
}

/**
 * 키보드 네비게이션 및 단축키를 관리하는 커스텀 훅
 */
export const useKeyboardNavigation = (options: KeyboardNavigationOptions = {}) => {
  const {
    enableSpacebarToggle = true,
    enableArrowKeys = true,
    enableNumberKeys = true,
  } = options;

  const {
    state,
    startTimer,
    pauseTimer,
    resetTimer,
    incrementRepetitions,
    decrementRepetitions,
  } = useTimer();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 모달이나 입력 필드가 활성화된 경우 단축키 비활성화
    const activeElement = document.activeElement;
    const isInputActive = activeElement?.tagName === 'INPUT' || 
                         activeElement?.tagName === 'TEXTAREA' ||
                         activeElement?.getAttribute('contenteditable') === 'true';
    
    if (isInputActive) {
      return;
    }

    // 스페이스바로 타이머 시작/정지
    if (enableSpacebarToggle && event.code === 'Space') {
      event.preventDefault();
      if (state.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
      return;
    }

    // 화살표 키로 반복 횟수 조정
    if (enableArrowKeys) {
      if (event.code === 'ArrowUp') {
        event.preventDefault();
        incrementRepetitions();
        return;
      }
      
      if (event.code === 'ArrowDown') {
        event.preventDefault();
        if (state.repetitions > 0) {
          decrementRepetitions();
        }
        return;
      }
    }

    // 숫자 키 단축키: 템플릿 기능 제거로 비활성화

    // R 키로 리셋
    if (event.code === 'KeyR' && !state.isRunning) {
      event.preventDefault();
      resetTimer();
      return;
    }

    // Escape 키로 모달 닫기 (전역적으로 처리)
    if (event.code === 'Escape') {
      // 모달 닫기 이벤트 발생
      const escapeEvent = new CustomEvent('closeModal');
      document.dispatchEvent(escapeEvent);
      return;
    }
  }, [
    state,
    startTimer,
    pauseTimer,
    resetTimer,
    incrementRepetitions,
    decrementRepetitions,
    enableSpacebarToggle,
    enableArrowKeys,
    enableNumberKeys,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 키보드 단축키 정보 반환
  const shortcuts = {
    spacebar: enableSpacebarToggle ? '스페이스바: 시작/정지' : null,
    arrowUp: enableArrowKeys ? '↑: 반복 횟수 증가' : null,
    arrowDown: enableArrowKeys ? '↓: 반복 횟수 감소' : null,
    numbers: enableNumberKeys ? '1-3: 빠른 템플릿 선택' : null,
    reset: 'R: 초기화',
    escape: 'ESC: 모달 닫기',
  };

  return {
    shortcuts: Object.fromEntries(
      Object.entries(shortcuts).filter(([, value]) => value !== null)
    ),
  };
};