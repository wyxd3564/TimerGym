import React from 'react';
import styles from './KeyboardShortcuts.module.css';

interface KeyboardShortcutsProps {
  isVisible: boolean;
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  isVisible,
  onClose,
}) => {

  if (!isVisible) return null;

  const shortcutList = [
    { key: 'Space', description: '타이머 시작/정지' },
    { key: '↑', description: '반복 횟수 증가' },
    { key: '↓', description: '반복 횟수 감소' },
    { key: 'R', description: '타이머 초기화' },
    { key: '1', description: '30초 템플릿 선택' },
    { key: '2', description: '1분 템플릿 선택' },
    { key: '3', description: '3분 템플릿 선택' },
    { key: 'Esc', description: '모달 닫기' },
    { key: 'Tab', description: '다음 요소로 이동' },
    { key: 'Shift + Tab', description: '이전 요소로 이동' },
  ];

  return (
    <div 
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div 
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="shortcuts-title" className={styles.title}>
            키보드 단축키
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="단축키 도움말 닫기"
          >
            ✕
          </button>
        </div>
        
        <div className={styles.content}>
          <ul className={styles.shortcutList} role="list">
            {shortcutList.map((shortcut, index) => (
              <li key={index} className={styles.shortcutItem} role="listitem">
                <kbd className={styles.key}>{shortcut.key}</kbd>
                <span className={styles.description}>{shortcut.description}</span>
              </li>
            ))}
          </ul>
          
          <div className={styles.note}>
            <p>
              <strong>참고:</strong> 입력 필드가 활성화된 상태에서는 단축키가 비활성화됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;