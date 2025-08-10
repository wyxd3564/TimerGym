import React, { useState, useMemo, useCallback } from 'react';
import CircularProgress from '../CircularProgress/CircularProgress';
import TimeSettingModal from '../TimeSettingModal/TimeSettingModal';
import Button from '../Button/Button';
import VoiceCountButton from '../VoiceCountButton/VoiceCountButton';
import { useTimer } from '../../hooks';
import { formatTimeWithMilliseconds, getTimerColor, isDangerTime, isWarningTime } from '../../utils';
import { classNames } from '../../utils';
import styles from './TimerDisplay.module.css';

interface TimerDisplayProps {
  className?: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = React.memo(({
  className = ''
}) => {
  const [isTimeSettingOpen, setIsTimeSettingOpen] = useState(false);
  const { state, incrementRepetitions, decrementRepetitions, resetRepetitions, toggleVoiceCount } = useTimer();
  
  const { mode, duration, remainingTime, elapsedTime, repetitions, isRunning, isPaused, voiceCountActive } = state;

  const handleTimeClick = useCallback(() => {
    // 타이머 모드이고 실행 중이 아닐 때만 시간 설정 가능
    if (mode === 'timer' && !isRunning) {
      setIsTimeSettingOpen(true);
    }
  }, [mode, isRunning]);

  const handleCloseTimeSetting = useCallback(() => {
    setIsTimeSettingOpen(false);
  }, []);

  // 현재 시간 및 총 시간 계산 (메모화)
  const { currentTime, totalTime } = useMemo(() => {
    if (mode === 'timer') {
      return {
        currentTime: remainingTime,
        totalTime: duration * 1000 // 초를 밀리초로 변환
      };
    } else {
      // 스톱워치 모드: 경과 시간을 표시하고, 총 시간은 임의의 큰 값 사용
      return {
        currentTime: elapsedTime,
        totalTime: Math.max(elapsedTime, 60000) // 최소 1분 또는 경과 시간 중 큰 값
      };
    }
  }, [mode, remainingTime, elapsedTime, duration]);

  // 진행률 계산 (메모화) - 타이머와 스톱워치 모두 동일한 UX (0에서 시작해서 증가)
  const progress = useMemo(() => {
    if (mode === 'timer') {
      // 타이머 모드: 경과 시간에 따른 진행률 (0에서 시작해서 시간이 지날수록 증가)
      const elapsedTime = totalTime - remainingTime;
      return Math.max(0, Math.min(100, (elapsedTime / totalTime) * 100));
    } else {
      // 스톱워치 모드: 경과 시간에 따른 진행률 (0에서 시작해서 증가)
      return Math.min((elapsedTime / totalTime) * 100, 100);
    }
  }, [mode, remainingTime, elapsedTime, totalTime]);
  
  // 색상 결정 (메모화)
  const timerColor = useMemo(() => {
    if (mode === 'timer') {
      return getTimerColor(remainingTime);
    } else {
      // 스톱워치 모드: 항상 기본 색상
      return 'var(--color-primary)';
    }
  }, [mode, remainingTime]);
  
  // 상태에 따른 CSS 클래스 결정 (메모화)
  const progressClasses = useMemo(() => {
    const classes = [styles.progressCircle];
    
    if (mode === 'timer') {
      if (remainingTime === 0) {
        classes.push(styles.completed);
      } else if (isDangerTime(remainingTime)) {
        classes.push(styles.danger);
      } else if (isWarningTime(remainingTime)) {
        classes.push(styles.warning);
      }
    } else {
      // 스톱워치 모드: 기본 스타일
      classes.push(styles.stopwatch);
    }
    
    return classes.join(' ');
  }, [mode, remainingTime]);

  // 시간 표시 색상 클래스 (메모화)
  const timeDisplayClasses = useMemo(() => {
    const classes = [styles.timeDisplay];
    
    if (mode === 'timer') {
      if (remainingTime === 0) {
        classes.push(styles.completed);
      } else if (isDangerTime(remainingTime)) {
        classes.push(styles.danger);
      } else if (isWarningTime(remainingTime)) {
        classes.push(styles.warning);
      }
    } else {
      // 스톱워치 모드: 기본 스타일
      classes.push(styles.stopwatch);
    }
    
    if (isPaused) {
      classes.push(styles.paused);
    }
    
    return classes.join(' ');
  }, [mode, remainingTime, isPaused]);

  // 포맷된 시간 (메모화) - 밀리초 포함
  const formattedTime = useMemo(() => formatTimeWithMilliseconds(currentTime), [currentTime]);

  return (
    <div className={classNames(styles.container, className)} role="main" aria-label={`${mode === 'timer' ? '타이머' : '스톱워치'} 표시`} data-testid="timer-display" id="timer-display">
      {/* 상단 시간 표시 - 타이머 모드에서만 클릭 가능 */}
      {mode === 'timer' ? (
        <button
          className={classNames(timeDisplayClasses, styles.timeButton)}
          onClick={handleTimeClick}
          disabled={isRunning}
          aria-label={`현재 시간: ${formattedTime}. 클릭하여 시간 설정`}
          aria-describedby="timer-status"
          title={isRunning ? "타이머 실행 중에는 시간을 변경할 수 없습니다" : "클릭하여 시간 설정"}
          data-testid="time-display"
        >
          {formattedTime}
        </button>
      ) : (
        <div
          className={timeDisplayClasses}
          aria-label={`경과 시간: ${formattedTime}`}
          aria-describedby="timer-status"
          data-testid="time-display"
        >
          {formattedTime}
        </div>
      )}
      
      {/* 스크린 리더용 타이머/스톱워치 상태 정보 */}
      <div 
        id="timer-status" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {mode === 'timer' ? (
          <>
            {isRunning ? '타이머 실행 중' : isPaused ? '타이머 일시정지' : '타이머 정지'}
            {remainingTime === 0 ? ', 타이머 완료' : ''}
            {remainingTime <= 10000 && remainingTime > 0 ? `, ${Math.ceil(remainingTime / 1000)}초 남음` : ''}
          </>
        ) : (
          <>
            {isRunning ? '스톱워치 실행 중' : isPaused ? '스톱워치 일시정지' : '스톱워치 정지'}
            {elapsedTime > 0 ? `, ${Math.ceil(elapsedTime / 1000)}초 경과` : ''}
          </>
        )}
      </div>
      
      {/* 원형 진행률 표시기 */}
      <div 
        className={styles.progressContainer}
        role="img"
        aria-label={mode === 'timer' ? `타이머 진행률, ${formattedTime} 남음` : `스톱워치 진행률, ${formattedTime} 경과`}
      >
        <CircularProgress
          progress={progress}
          size={280} // CSS 변수와 일치
          strokeWidth={8}
          color={timerColor}
          className={progressClasses}
        />
        
        {/* 중앙 반복 횟수 표시 */}
        <div 
          className={styles.repetitionsContainer}
          role="status"
          aria-label={`현재 반복 횟수: ${repetitions}회`}
          data-testid="repetition-count"
        >
          <div className={styles.repetitionsNumber} aria-hidden="true">
            {repetitions}
          </div>
          <div className={styles.repetitionsLabel} aria-hidden="true">
            반복
          </div>
          
          {/* 음성 카운트 버튼 */}
          <VoiceCountButton
            isActive={voiceCountActive}
            onClick={toggleVoiceCount}
            className={styles.voiceCountButton}
          />
        </div>
      </div>
      
      {/* 하단 반복 횟수 컨트롤 */}
      <div className={styles.repetitionControls} role="group" aria-label="반복 횟수 조절">
        <Button
          variant="outline"
          size="large"
          onClick={decrementRepetitions}
          disabled={repetitions === 0}
          aria-label="반복 횟수 감소"
          className={styles.repetitionButton}
          data-testid="decrement-reps"
        >
          -
        </Button>
        <Button
          variant="outline"
          size="large"
          onClick={resetRepetitions}
          disabled={repetitions === 0}
          aria-label="카운터 초기화"
          className={styles.resetButton}
          data-testid="reset-counter"
        >
          ↻
        </Button>
        <Button
          variant="outline"
          size="large"
          onClick={incrementRepetitions}
          aria-label="반복 횟수 증가"
          className={styles.repetitionButton}
          data-testid="increment-reps"
        >
          +
        </Button>
      </div>
      

      


      {/* 시간 설정 모달 - 타이머 모드에서만 표시 */}
      {mode === 'timer' && (
        <TimeSettingModal
          isOpen={isTimeSettingOpen}
          onClose={handleCloseTimeSetting}
        />
      )}
    </div>
  );
});

export default TimerDisplay;