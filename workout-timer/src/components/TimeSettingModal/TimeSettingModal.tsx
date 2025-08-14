import React, { useState, useEffect } from 'react';
import { useTimer } from '../../hooks';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import { formatTime } from '../../utils';
import styles from './TimeSettingModal.module.css';
import WheelPicker from '../WheelPicker/WheelPicker';

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
        {/* Enter 키로 확인 동작을 전역으로 지원 (테스트 및 키보드 접근성) */}
        {isOpen && (
          <KeydownEnterHandler onEnter={handleConfirm} />
        )}

        <div className={styles.timeInputs} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
          }
        }}>
          <div className={styles.inputGroup}>
            <label htmlFor="minutes-input" className={styles.label}>분</label>
            <WheelPicker
              value={minutes}
              min={0}
              max={59}
              step={1}
              label="분"
              onChange={handleMinutesChange}
              inputId="minutes-input"
            />
          </div>

          <div className={styles.separator}>:</div>

          <div className={styles.inputGroup}>
            <label htmlFor="seconds-input" className={styles.label}>초</label>
            <WheelPicker
              value={seconds}
              min={0}
              max={59}
              step={1}
              label="초"
              onChange={handleSecondsChange}
              inputId="seconds-input"
            />
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

// 모달 열림 동안 Enter 키를 감지해 확인을 트리거하는 헬퍼 컴포넌트
const KeydownEnterHandler: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onEnter();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onEnter]);
  return null;
};