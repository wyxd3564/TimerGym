import React, { useCallback } from 'react';
import { classNames } from '../../utils';
import styles from './VoiceCountButton.module.css';

interface VoiceCountButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const VoiceCountButton: React.FC<VoiceCountButtonProps> = React.memo(({
  isActive,
  onClick,
  disabled = false,
  className = ''
}) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [onClick, disabled]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
      event.preventDefault();
      onClick();
    }
  }, [onClick, disabled]);

  return (
    <button
      className={classNames(
        styles.voiceButton,
        isActive && styles.active,
        disabled && styles.disabled,
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={isActive ? '음성 카운트 중지' : '음성 카운트 시작'}
      aria-pressed={isActive}
      title={isActive ? '음성 카운트를 중지합니다' : '음성 카운트를 시작합니다'}
      data-testid="voice-count-button"
      type="button"
    >
      <div className={styles.iconContainer}>
        {isActive ? (
          // 활성 상태 아이콘 (마이크 + 파형)
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2Z"
              fill="currentColor"
            />
            <path
              d="M19 11C19 15.42 15.42 19 11 19H13C17.42 19 21 15.42 21 11H19Z"
              fill="currentColor"
            />
            <path
              d="M12 17V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M8 21H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* 음성 파형 표시 */}
            <g className={styles.waveform}>
              <rect x="2" y="8" width="1" height="8" fill="currentColor" opacity="0.6">
                <animate attributeName="height" values="4;8;4" dur="1s" repeatCount="indefinite" />
                <animate attributeName="y" values="10;8;10" dur="1s" repeatCount="indefinite" />
              </rect>
              <rect x="4" y="6" width="1" height="12" fill="currentColor" opacity="0.7">
                <animate attributeName="height" values="8;12;8" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="y" values="8;6;8" dur="1.2s" repeatCount="indefinite" />
              </rect>
              <rect x="6" y="9" width="1" height="6" fill="currentColor" opacity="0.5">
                <animate attributeName="height" values="2;6;2" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="y" values="11;9;11" dur="0.8s" repeatCount="indefinite" />
              </rect>
            </g>
          </svg>
        ) : (
          // 비활성 상태 아이콘 (마이크만)
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2Z"
              fill="currentColor"
            />
            <path
              d="M19 11C19 15.42 15.42 19 11 19H13C17.42 19 21 15.42 21 11H19Z"
              fill="currentColor"
            />
            <path
              d="M12 17V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M8 21H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      
      {/* 활성 상태 표시 */}
      {isActive && (
        <div className={styles.activeIndicator} aria-hidden="true">
          <div className={styles.pulse}></div>
        </div>
      )}
    </button>
  );
});

VoiceCountButton.displayName = 'VoiceCountButton';

export default VoiceCountButton;