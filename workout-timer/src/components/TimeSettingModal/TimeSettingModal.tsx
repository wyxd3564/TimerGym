import React, { useState, useEffect } from 'react';
import { useTimer } from '../../hooks';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import { formatTime } from '../../utils';
import styles from './TimeSettingModal.module.css';

interface TimeSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TimeSettingModal: React.FC<TimeSettingModalProps> = ({ isOpen, onClose }) => {
  const { state, setDuration } = useTimer();
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // 모달이 열릴 때 현재 duration을 분/초로 변환하여 설정
  useEffect(() => {
    if (isOpen) {
      const totalSeconds = state.duration;
      setMinutes(Math.floor(totalSeconds / 60));
      setSeconds(totalSeconds % 60);
    }
  }, [isOpen, state.duration]);

  const handleMinutesChange = (value: number) => {
    setMinutes(Math.max(0, Math.min(59, value)));
  };

  const handleSecondsChange = (value: number) => {
    setSeconds(Math.max(0, Math.min(59, value)));
  };

  const handleConfirm = () => {
    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds > 0) {
      setDuration(totalSeconds);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="시간 설정"
      className={styles.modal}
    >

        <div className={styles.timeInputs}>
          <div className={styles.inputGroup}>
            <label htmlFor="minutes-input" className={styles.label}>
              분
            </label>
            <div className={styles.inputContainer}>
              <Button
                variant="outline"
                size="small"
                onClick={() => handleMinutesChange(minutes + 1)}
                aria-label="분 증가"
                className={styles.incrementButton}
              >
                +
              </Button>
              <input
                id="minutes-input"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
                className={styles.timeInput}
                aria-label="분 입력"
                data-testid="minutes-input"
              />
              <Button
                variant="outline"
                size="small"
                onClick={() => handleMinutesChange(minutes - 1)}
                aria-label="분 감소"
                className={styles.decrementButton}
              >
                -
              </Button>
            </div>
          </div>

          <div className={styles.separator}>:</div>

          <div className={styles.inputGroup}>
            <label htmlFor="seconds-input" className={styles.label}>
              초
            </label>
            <div className={styles.inputContainer}>
              <Button
                variant="outline"
                size="small"
                onClick={() => handleSecondsChange(seconds + 1)}
                aria-label="초 증가"
                className={styles.incrementButton}
              >
                +
              </Button>
              <input
                id="seconds-input"
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => handleSecondsChange(parseInt(e.target.value) || 0)}
                className={styles.timeInput}
                aria-label="초 입력"
                data-testid="seconds-input"
              />
              <Button
                variant="outline"
                size="small"
                onClick={() => handleSecondsChange(seconds - 1)}
                aria-label="초 감소"
                className={styles.decrementButton}
              >
                -
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.preview}>
          <span className={styles.previewLabel}>설정 시간:</span>
          <span className={styles.previewTime}>
            {formatTime(minutes * 60 + seconds)}
          </span>
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={minutes === 0 && seconds === 0}
            className={styles.actionButton}
            data-testid="confirm-time"
          >
            확인
          </Button>
          <Button
            variant="secondary"
            onClick={handleCancel}
            className={styles.actionButton}
          >
            취소
          </Button>
        </div>
    </Modal>
  );
};

export default TimeSettingModal;