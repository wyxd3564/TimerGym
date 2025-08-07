// PWA Service - Service Worker 등록 및 업데이트 관리
import { Workbox } from 'workbox-window';

export interface PWAUpdateInfo {
  isUpdateAvailable: boolean;
  skipWaiting: () => Promise<void>;
}

export class PWAService {
  private workbox: Workbox | null = null;
  private updateCallback: ((updateInfo: PWAUpdateInfo) => void) | null = null;
  private isReady: boolean = false;

  constructor() {
    this.initializeServiceWorker();
  }

  /**
   * Service Worker 초기화
   */
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.workbox = new Workbox('/sw.js');
        
        // Service Worker 이벤트 리스너 설정
        this.setupEventListeners();
        
        // Service Worker 등록
        await this.workbox.register();
        
        this.isReady = true;
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    } else {
      console.warn('Service Worker is not supported in this browser');
    }
  }

  /**
   * Service Worker 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    if (!this.workbox) return;

    // 새로운 Service Worker가 설치되었을 때
    this.workbox.addEventListener('installed', (event) => {
      console.log('New Service Worker installed');
      
      if (event.isUpdate) {
        // 업데이트가 있을 때 사용자에게 알림
        this.notifyUpdate();
      }
    });

    // Service Worker가 활성화되었을 때
    this.workbox.addEventListener('activated', (event) => {
      console.log('Service Worker activated');
      
      if (event.isUpdate) {
        // 페이지 새로고침 또는 업데이트 완료 알림
        window.location.reload();
      }
    });

    // Service Worker가 대기 중일 때
    this.workbox.addEventListener('waiting', () => {
      console.log('Service Worker is waiting');
      this.notifyUpdate();
    });

    // Service Worker 제어 변경 시
    this.workbox.addEventListener('controlling', () => {
      console.log('Service Worker is now controlling the page');
      window.location.reload();
    });
  }

  /**
   * 업데이트 알림
   */
  private notifyUpdate(): void {
    if (this.updateCallback && this.workbox) {
      const updateInfo: PWAUpdateInfo = {
        isUpdateAvailable: true,
        skipWaiting: async () => {
          if (this.workbox) {
            // 대기 중인 Service Worker를 활성화
            this.workbox.messageSkipWaiting();
          }
        }
      };
      
      this.updateCallback(updateInfo);
    }
  }

  /**
   * 업데이트 콜백 설정
   */
  setUpdateCallback(callback: (updateInfo: PWAUpdateInfo) => void): void {
    this.updateCallback = callback;
  }

  /**
   * 수동으로 업데이트 확인
   */
  async checkForUpdates(): Promise<void> {
    if (this.workbox) {
      try {
        await this.workbox.update();
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }
  }

  /**
   * PWA 설치 프롬프트 관리
   */
  setupInstallPrompt(): void {
    let deferredPrompt: any = null;

    // beforeinstallprompt 이벤트 리스너
    window.addEventListener('beforeinstallprompt', (e) => {
      // 기본 설치 프롬프트 방지
      e.preventDefault();
      deferredPrompt = e;
      
      // 커스텀 설치 버튼 표시 이벤트 발생
      const installEvent = new CustomEvent('pwa-install-available');
      document.dispatchEvent(installEvent);
    });

    // 설치 프롬프트 표시 함수를 전역으로 노출
    (window as any).showInstallPrompt = async () => {
      if (deferredPrompt) {
        // 설치 프롬프트 표시
        deferredPrompt.prompt();
        
        // 사용자 선택 결과 대기
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User ${outcome} the install prompt`);
        
        deferredPrompt = null;
      }
    };

    // 앱이 설치되었을 때
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
      
      // 설치 완료 이벤트 발생
      const installedEvent = new CustomEvent('pwa-installed');
      document.dispatchEvent(installedEvent);
    });
  }

  /**
   * 오프라인 상태 감지
   */
  setupOfflineDetection(): void {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      const event = new CustomEvent('network-status-change', {
        detail: { isOnline }
      });
      document.dispatchEvent(event);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // 초기 상태 설정
    updateOnlineStatus();
  }

  /**
   * Service Worker 메시지 전송
   */
  async sendMessage(message: any): Promise<any> {
    if (this.workbox) {
      try {
        return await this.workbox.messageSW(message);
      } catch (error) {
        console.error('Failed to send message to Service Worker:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * 캐시 관리
   */
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('All caches cleared');
      } catch (error) {
        console.error('Failed to clear caches:', error);
      }
    }
  }

  /**
   * 서비스 준비 상태 확인
   */
  get ready(): boolean {
    return this.isReady;
  }

  /**
   * 서비스 정리
   */
  destroy(): void {
    this.updateCallback = null;
    
    if (this.workbox) {
      // Workbox 이벤트 리스너 정리는 자동으로 처리됨
      this.workbox = null;
    }
  }
}