import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Button from '../Button/Button';
import styles from './WheelPicker.module.css';

interface WheelPickerProps {
  value: number; // 현재 선택된 값
  min: number; // 최소 값
  max: number; // 최대 값
  step?: number; // 증감 간격
  label: string; // 레이블 텍스트 (예: 분, 초)
  onChange: (value: number) => void; // 값 변경 콜백
  className?: string; // 추가 클래스
  inputId?: string; // 테스트/접근성 호환용 숨김 인풋 id
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const WheelPicker: React.FC<WheelPickerProps> = ({
  value,
  min,
  max,
  step = 1,
  label,
  onChange,
  className = '',
  inputId
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const itemHeight = 36; // 항목 높이(px) - 스타일과 동기화

  const items = useMemo(() => {
    const arr: number[] = [];
    for (let i = min; i <= max; i += step) arr.push(i);
    return arr;
  }, [min, max, step]);

  const ensureVisible = useCallback((targetValue: number) => {
    const container = listRef.current;
    if (!container) return;
    const index = items.indexOf(targetValue);
    if (index === -1) return;
    const targetScrollTop = Math.max(0, index * itemHeight - itemHeight * 2); // 중앙 근처로
    // jsdom 등 테스트 환경에서 scrollTo가 없을 수 있으므로 폴백 처리
    const scrollable = container as HTMLDivElement & { scrollTo?: (options: ScrollToOptions) => void };
    if (typeof scrollable.scrollTo === 'function') {
      scrollable.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    } else {
      container.scrollTop = targetScrollTop;
    }
  }, [items]);

  useEffect(() => {
    ensureVisible(value);
  }, [value, ensureVisible]);

  const increment = useCallback(() => {
    const next = clamp(value + step, min, max);
    if (next !== value) onChange(next);
  }, [value, step, min, max, onChange]);

  const decrement = useCallback(() => {
    const next = clamp(value - step, min, max);
    if (next !== value) onChange(next);
  }, [value, step, min, max, onChange]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (Math.abs(e.deltaY) < 1) return;
    if (e.deltaY > 0) increment();
    else decrement();
  }, [increment, decrement]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      decrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      increment();
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  }, [decrement, increment, min, max, onChange]);

  const handleHiddenInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed, min, max));
    }
  }, [min, max, onChange]);

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>{label}</div>

      {/* 접근성/테스트 호환용 숨김 입력. 기존 테스트의 라벨/ID를 그대로 사용할 수 있음 */}
      <input
        id={inputId}
        type="number"
        className="sr-only"
        aria-label={`${label} 입력`}
        value={value}
        onChange={handleHiddenInputChange}
        min={min}
        max={max}
        data-testid={inputId}
      />

      <div className={styles.picker}>
        <Button
          variant="outline"
          size="small"
          onClick={increment}
          aria-label={`${label} 증가`}
          className={styles.controlButton}
          disabled={value >= max}
        >
          +
        </Button>

        <div
          ref={listRef}
          className={styles.wheel}
          role="listbox"
          aria-label={`${label} 선택`}
          aria-activedescendant={`${label}-option-${value}`}
          tabIndex={0}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
        >
          {items.map((item) => (
            <div
              key={item}
              id={`${label}-option-${item}`}
              role="option"
              aria-selected={item === value}
              className={`${styles.item} ${item === value ? styles.selected : ''}`}
              onClick={() => onChange(item)}
            >
              {String(item).padStart(2, '0')}
            </div>
          ))}
          {/* 선택 하이라이트 가이드 */}
          <div aria-hidden className={styles.highlight} />
        </div>

        <Button
          variant="outline"
          size="small"
          onClick={decrement}
          aria-label={`${label} 감소`}
          className={styles.controlButton}
          disabled={value <= min}
        >
          -
        </Button>
      </div>
    </div>
  );
};

export default WheelPicker;


