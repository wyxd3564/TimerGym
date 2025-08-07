import React, { useState, useMemo, useCallback } from 'react';
import CircularProgress from '../CircularProgress/CircularProgress';
import TimeSettingModal from '../TimeSettingModal/TimeSettingModal';
import Button from '../Button/Button';
import { useTimer } from '../../hooks';
import { formatTime, formatTimeWithMilliseconds, calculateProgress, getTimerColor, isDangerTime, isWarningTime } from '../../utils';
import { classNames } from '../../utils';
import styles from './TimerDisplay.module.css';

interface TimerDisplayProps {
  remainingTime: number;
  totalTime: number;
  repetitions: number;
  isRunning: boolean;
  isPaused: boolean;
  className?: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = React.memo(({
  remainingTime,
  totalTime,
  repetitions,
  isRunning,
  isPaused,
  className = ''
}) => {
  const [isTimeSettingOpen, setIsTimeSettingOpen] = useState(false);
  const { incrementRepetitions, decrementRepetitions, resetRepetitions, resetTimer } = useTimer();

  const handleTimeClick = useCallback(() => {
    // 타이머가 실행 중이 아닐 때만 시간 설정 가능
    if (!isRunning) {
      setIsTimeSettingOpen(true);
    }
  }, [isRunning]);

  const handleCloseTimeSetting = useCallback(() => {
    setIsTimeSettingOpen(false);
  }, []);

  // 진행률 계산 (메모화)
  const progress = useMemo(() => calculateProgress(remainingTime, totalTime), [remainingTime, totalTime]);
  
  // 색상 결정 (메모화)
  const timerColor = useMemo(() => getTimerColor(remainingTime), [remainingTime]);
  
  // 상태에 따른 CSS 클래스 결정 (메모화)
  const progressClasses = useMemo(() => {
    const classes = [styles.progressCircle];
    
    if (remainingTime === 0) {
      classes.push(styles.completed);
    } else if (isDangerTime(remainingTime)) {
      classes.push(styles.danger);
    } else if (isWarningTime(remainingTime)) {
      classes.push(styles.warning);
    }
    
    return classes.join(' ');
  }, [remainingTime]);

  // 시간 표시 색상 클래스 (메모화)
  const timeDisplayClasses = useMemo(() => {
    const classes = [styles.timeDisplay];
    
    if (remainingTime === 0) {
      classes.push(styles.completed);
    } else if (isDangerTime(remainingTime)) {
      classes.push(styles.danger);
    } else if (isWarningTime(remainingTime)) {
      classes.push(styles.warning);
    }
    
    if (isPaused) {
      classes.push(styles.paused);
    }
    
    return classes.join(' ');
  }, [remainingTime, isPaused]);

  // 포맷된 시간 (메모화) - 밀리초 포함
  const formattedTime = useMemo(() => formatTimeWithMilliseconds(remainingTime), [remainingTime]);

  return (
    <div className={classNames(styles.container, className)} role="main" aria-label="타이머 표시" data-testid="timer-display">
      {/* 상단 시간 표시 - 클릭 가능 */}
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
      
      {/* 스크린 리더용 타이머 상태 정보 */}
      <div 
        id="timer-status" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {isRunning ? '타이머 실행 중' : isPaused ? '타이머 일시정지' : '타이머 정지'}
        {remainingTime === 0 ? ', 타이머 완료' : ''}
        {remainingTime <= 10000 && remainingTime > 0 ? `, ${Math.ceil(remainingTime / 1000)}초 남음` : ''}
      </div>
      
      {/* 원형 진행률 표시기 */}
      <div 
        className={styles.progressContainer}
        role="img"
        aria-label={`타이머 진행률, ${formattedTime} 남음`}
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
      

      


      {/* 시간 설정 모달 */}
      <TimeSettingModal
        isOpen={isTimeSettingOpen}
        onClose={handleCloseTimeSetting}
      />
    </div>
  );
});

export default TimerDisplay;