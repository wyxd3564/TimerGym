import { useTimer } from '../../hooks';
import styles from './ModeSelector.module.css';

export interface ModeSelectorProps {
  className?: string;
}

export default function ModeSelector({ className }: ModeSelectorProps) {
  const { state, setMode } = useTimer();

  const handleModeChange = (mode: 'timer' | 'stopwatch') => {
    if (mode !== state.mode) {
      setMode(mode);
    }
  };

  return (
    <div className={`${styles.modeSelector} ${className || ''}`} role="tablist" aria-label="타이머 모드 선택">
      <button
        type="button"
        role="tab"
        aria-selected={state.mode === 'timer'}
        aria-controls="timer-display"
        className={`${styles.modeButton} ${state.mode === 'timer' ? styles.active : ''}`}
        onClick={() => handleModeChange('timer')}
        tabIndex={state.mode === 'timer' ? 0 : -1}
      >
        타이머
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={state.mode === 'stopwatch'}
        aria-controls="timer-display"
        className={`${styles.modeButton} ${state.mode === 'stopwatch' ? styles.active : ''}`}
        onClick={() => handleModeChange('stopwatch')}
        tabIndex={state.mode === 'stopwatch' ? 0 : -1}
      >
        스톱워치
      </button>
    </div>
  );
}