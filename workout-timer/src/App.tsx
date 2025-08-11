import React, { Suspense, lazy } from 'react';
import { TimerProvider, SettingsProvider, PWAProvider } from './contexts';
import { Header, TimerDisplay, TimerControls, Modal, ModeSelector } from './components';
import { useSettings, useKeyboardNavigation } from './hooks';
import styles from './App.module.css';

// Lazy load heavy components
const Settings = lazy(() => import('./components/Settings/Settings'));
const KeyboardShortcuts = lazy(() => import('./components/KeyboardShortcuts/KeyboardShortcuts'));

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className={styles.loading}>
    <div className={styles.loadingSpinner} />
    로딩 중...
  </div>
);

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1 className={styles.errorTitle}>문제가 발생했습니다</h1>
          <p className={styles.errorMessage}>
            앱을 다시 시작해 주세요. 문제가 계속되면 페이지를 새로고침하세요.
          </p>
          <div className={styles.errorActions}>
            <button
              onClick={() => window.location.reload()}
              className="button button-primary"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Content
const AppContent: React.FC = () => {
  const { settings } = useSettings();
  // 템플릿 기능 제거
  const [showSettings, setShowSettings] = React.useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = React.useState(false);

  // 키보드 네비게이션 활성화
  useKeyboardNavigation({
    enableSpacebarToggle: true,
    enableArrowKeys: true,
    enableNumberKeys: true,
  });

  // Apply theme to document
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.ui.theme);
  }, [settings.ui.theme]);

  // Handle modal closing with Escape key
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSettings) {
          setShowSettings(false);
        } else if (showKeyboardShortcuts) {
          setShowKeyboardShortcuts(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showSettings, showKeyboardShortcuts]);

  const handleSettingsClick = React.useCallback(() => {
    setShowKeyboardShortcuts(false);
    setShowSettings(true);
  }, []);

  const handleHelpClick = React.useCallback(() => {
    setShowSettings(false);
    setShowKeyboardShortcuts(true);
  }, []);

  return (
    <div className={styles.app}>
      <div className={styles.container} data-testid="app-container">
        <Header onSettingsClick={handleSettingsClick} onHelpClick={handleHelpClick} />
        
        {/* Mode Selector - 상단바 아래에 위치 */}
        <div className={styles.modeSelectorSection}>
          <ModeSelector />
        </div>
        
        <main className={styles.main}>
          <div className={styles.timerSection}>
            <TimerDisplay />
          </div>
          
          <div className={styles.controlsSection}>
            <TimerControls />
          </div>
        </main>

        <Modal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          title="설정"
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Settings 
              onClose={() => setShowSettings(false)} 
            />
          </Suspense>
        </Modal>

        {/* Keyboard Shortcuts Modal */}
        {showKeyboardShortcuts && (
          <Suspense fallback={<LoadingSpinner />}>
            <KeyboardShortcuts
              isVisible={showKeyboardShortcuts}
              onClose={() => setShowKeyboardShortcuts(false)}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <PWAProvider>
        <SettingsProvider>
          <TimerProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <AppContent />
              </Suspense>
            </TimerProvider>
        </SettingsProvider>
      </PWAProvider>
    </ErrorBoundary>
  );
}

export default App
