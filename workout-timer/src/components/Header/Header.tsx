import React from 'react';
import { Button } from '../Button';
import styles from './Header.module.css';

export interface HeaderProps {
  onSettingsClick: () => void;
  onHelpClick?: () => void;
  title?: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  onSettingsClick,
  onHelpClick,
  title = '운동 타이머',
  className
}) => {
  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.leftSection} />
      
      <div className={styles.centerSection}>
        <h1 className={styles.title}>{title}</h1>
      </div>
      
      <div className={styles.rightSection}>
        {onHelpClick && (
          <Button
            variant="outline"
            size="small"
            onClick={onHelpClick}
            aria-label="키보드 단축키 도움말"
            className={styles.helpButton}
          >
            ?
          </Button>
        )}
        <Button
          variant="outline"
          size="small"
          onClick={onSettingsClick}
          aria-label="설정"
          className={styles.settingsButton}
          data-testid="settings-button"
        >
          ⚙️
        </Button>
      </div>
    </header>
  );
};

export default Header;