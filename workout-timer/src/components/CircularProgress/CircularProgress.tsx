import React, { useMemo } from 'react';
import type { CircularProgressProps } from '../../types';
import styles from './CircularProgress.module.css';

const CircularProgress: React.FC<CircularProgressProps> = React.memo(({
  progress,
  size,
  strokeWidth,
  color,
  backgroundColor = 'var(--color-border)',
  className = ''
}) => {
  // SVG 원의 중심점과 반지름 계산 (메모화)
  const { center, radius, circumference, strokeDashoffset } = useMemo(() => {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return { center, radius, circumference, strokeDashoffset };
  }, [size, strokeWidth, progress]);
  
  return (
    <div className={`${styles.container} ${className}`} data-testid="circular-progress">
      <svg
        width={size}
        height={size}
        className={styles.svg}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`타이머 진행률`}
        aria-describedby="progress-description"
      >
        {/* 배경 원 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          className={styles.backgroundCircle}
          aria-hidden="true"
        />
        
        {/* 진행률 원 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={styles.progressCircle}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: `${center}px ${center}px`,
          }}
          aria-hidden="true"
        />
        

      </svg>
    </div>
  );
});

export default CircularProgress;