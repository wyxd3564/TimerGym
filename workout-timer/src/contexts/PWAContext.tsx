// PWA Context - PWA 기능 관리
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { PWAService } from '../services/PWAService';
import type { PWAUpdateInfo } from '../services/PWAService';

interface PWAContextType {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  updateAvailable: boolean;
  installApp: () => Promise<void>;
  updateApp: () => Promise<void>;
  clearCache: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const pwaServiceRef = useRef<PWAService | null>(null);
  const updateInfoRef = useRef<PWAUpdateInfo | null>(null);

  useEffect(() => {
    // PWA 서비스 초기화
    pwaServiceRef.current = new PWAService();

    // 업데이트 콜백 설정
    pwaServiceRef.current.setUpdateCallback((updateInfo) => {
      updateInfoRef.current = updateInfo;
      setUpdateAvailable(updateInfo.isUpdateAvailable);
    });

    // PWA 설치 프롬프트 설정
    pwaServiceRef.current.setupInstallPrompt();

    // 오프라인 감지 설정
    pwaServiceRef.current.setupOfflineDetection();

    // 이벤트 리스너 설정
    const handleNetworkStatusChange = (event: CustomEvent) => {
      setIsOnline(event.detail.isOnline);
    };

    const handlePWAInstallAvailable = () => {
      setIsInstallable(true);
    };

    const handlePWAInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    document.addEventListener('network-status-change', handleNetworkStatusChange as EventListener);
    document.addEventListener('pwa-install-available', handlePWAInstallAvailable);
    document.addEventListener('pwa-installed', handlePWAInstalled);

    // 이미 설치된 상태인지 확인
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    return () => {
      if (pwaServiceRef.current) {
        pwaServiceRef.current.destroy();
      }
      document.removeEventListener('network-status-change', handleNetworkStatusChange as EventListener);
      document.removeEventListener('pwa-install-available', handlePWAInstallAvailable);
      document.removeEventListener('pwa-installed', handlePWAInstalled);
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (isInstallable && (window as any).showInstallPrompt) {
      await (window as any).showInstallPrompt();
    }
  };

  const updateApp = async (): Promise<void> => {
    if (updateAvailable && updateInfoRef.current) {
      await updateInfoRef.current.skipWaiting();
      setUpdateAvailable(false);
    }
  };

  const clearCache = async (): Promise<void> => {
    if (pwaServiceRef.current) {
      await pwaServiceRef.current.clearCache();
    }
  };

  const contextValue: PWAContextType = {
    isOnline,
    isInstallable,
    isInstalled,
    updateAvailable,
    installApp,
    updateApp,
    clearCache,
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA(): PWAContextType {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}