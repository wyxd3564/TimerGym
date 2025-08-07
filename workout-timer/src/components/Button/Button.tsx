// Button Component - 재사용 가능한 버튼 컴포넌트
import React from 'react';
import type { ButtonProps } from '../../types';
import { classNames } from '../../utils';
import styles from './Button.module.css';

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
  tabIndex,
  ...props
}) => {
  const buttonClasses = classNames(
    styles.button,
    styles[variant],
    styles[size],
    className
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enter 키와 Space 키로 버튼 활성화
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled && onClick) {
        onClick();
      }
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : tabIndex}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;