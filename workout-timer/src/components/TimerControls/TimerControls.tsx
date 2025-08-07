import React from 'react';
import { useTimer } from '../../hooks';
import Button from '../Button/Button';
import styles from './TimerControls.module.css';

const TimerControls: React.FC = () => {
  const {
    state,
    startTimer,
    pauseTimer,
    resetTimer,
  } = useTimer();

  const { isRunning, isPaused } = state;

  // 시작/정지 버튼 텍스트와 핸들러 결정
  const getStartPauseButton = () => {
    if (isRunning) {
      return {
        text: '정지',
        handler: pauseTimer,
        variant: 'warning' as const,
      };
    } else if (isPaused) {
      return {
        text: '재개',
        handler: startTimer,
        variant: 'success' as const,
      };
    } else {
      return {
        text: '시작',
        handler: startTimer,
        variant: 'primary' as const,
      };
    }
  };

  const startPauseButton = getStartPauseButton();

  return (
    <div className={styles.container}>
      {/* 타이머 컨트롤 버튼들 */}
      <div className={styles.timerControls} role="group" aria-label="타이머 조절">
        <Button
          variant={startPauseButton.variant}
          size="large"
          onClick={startPauseButton.handler}
          className={styles.controlButton}
          aria-label={`타이머 ${startPauseButton.text} (스페이스바 또는 클릭)`}
          tabIndex={0}
          data-testid="start-button"
        >
          {startPauseButton.text}
        </Button>
        
        <Button
          variant="secondary"
          size="large"
          onClick={resetTimer}
          disabled={!isRunning && !isPaused}
          className={styles.controlButton}
          aria-label="타이머 초기화 (R 키 또는 클릭)"
          tabIndex={0}
          data-testid="reset-button"
        >
          초기화
        </Button>
      </div>
    </div>
  );
};

export default TimerControls;