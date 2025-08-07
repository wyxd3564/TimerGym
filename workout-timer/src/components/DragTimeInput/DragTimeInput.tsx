import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Button from '../Button/Button';
import type { DragTimeInputProps, DragState } from '../../types';
import { UI_CONSTANTS } from '../../types';
import { throttle } from '../../utils';
import styles from './DragTimeInput.module.css';

const DragTimeInput: React.FC<DragTimeInputProps> = React.memo(({
  value,
  min,
  max,
  step,
  onChange,
  label,
  disabled = false,
  className = ''
}) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startY: 0,
    startValue: 0,
    sensitivity: UI_CONSTANTS.DRAG_SENSITIVITY
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle increment/decrement buttons
  const handleIncrement = useCallback(() => {
    const newValue = Math.min(max, value + step);
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [value, max, step, onChange]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(min, value - step);
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [value, min, step, onChange]);

  // Handle direct input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  }, [min, max, onChange]);

  // Memoized formatted value
  const formattedValue = useMemo(() => value.toString().padStart(2, '0'), [value]);

  // Drag start handlers
  const handleDragStart = useCallback((clientY: number) => {
    if (disabled) return;
    
    setDragState({
      isDragging: true,
      startY: clientY,
      startValue: value,
      sensitivity: UI_CONSTANTS.DRAG_SENSITIVITY
    });
  }, [disabled, value]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    handleDragStart(event.clientY);
  }, [handleDragStart]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      handleDragStart(touch.clientY);
    }
  }, [handleDragStart]);

  // Throttled drag move handler
  const handleDragMove = useMemo(() => 
    throttle((clientY: number) => {
      if (!dragState.isDragging || disabled) return;

      const deltaY = dragState.startY - clientY; // 위로 드래그하면 양수
      const deltaValue = Math.floor(deltaY / dragState.sensitivity) * step;
      const newValue = Math.max(min, Math.min(max, dragState.startValue + deltaValue));
      
      if (newValue !== value) {
        onChange(newValue);
      }
    }, 16), // 60fps throttling
    [dragState, disabled, step, min, max, value, onChange]
  );

  // Drag end handler
  const handleDragEnd = useCallback(() => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  }, []);

  // Global mouse/touch event handlers
  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      handleDragMove(event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      if (touch) {
        handleDragMove(touch.clientY);
      }
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  // Prevent text selection during drag
  useEffect(() => {
    if (dragState.isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    } else {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [dragState.isDragging]);

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      <div className={styles.label}>{label}</div>
      <div 
        className={`${styles.inputGroup} ${dragState.isDragging ? styles.dragging : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <Button
          variant="outline"
          size="small"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          aria-label={`${label} 감소`}
          className={styles.button}
        >
          -
        </Button>
        
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="number"
            value={formattedValue}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={styles.input}
            aria-label={label}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag on input field
            onTouchStart={(e) => e.stopPropagation()} // Prevent drag on input field
          />
          <div className={styles.dragHint}>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="small"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          aria-label={`${label} 증가`}
          className={styles.button}
        >
          +
        </Button>
      </div>
    </div>
  );
});

export default DragTimeInput;