// Wake Lock Service - 화면 켜두기 기능
export class WakeLockService {
  private wakeLock: WakeLockSentinel | null = null;
  private isSupported: boolean = false;
  private isEnabled: boolean = false;

  constructor() {
    this.checkSupport();
  }

  /**
   * Wake Lock API 지원 여부 확인
   */
  private checkSupport(): void {
    this.isSupported = 'wakeLock' in navigator && 'request' in (navigator as any).wakeLock;
    
    if (!this.isSupported) {
      console.warn('Wake Lock API is not supported in this browser');
    }
  }

  /**
   * Wake Lock 활성화
   */
  async enable(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Wake Lock is not supported');
      return false;
    }

    if (this.wakeLock && !this.wakeLock.released) {
      console.log('Wake Lock is already active');
      return true;
    }

    try {
      this.wakeLock = await (navigator as any).wakeLock.request('screen');
      this.isEnabled = true;

      // Wake Lock이 해제되었을 때의 이벤트 리스너
      this.wakeLock?.addEventListener('release', () => {
        console.log('Wake Lock was released');
        this.isEnabled = false;
      });

      console.log('Wake Lock activated successfully');
      return true;
    } catch (error) {
      console.error('Failed to activate Wake Lock:', error);
      this.isEnabled = false;
      return false;
    }
  }

  /**
   * Wake Lock 비활성화
   */
  async disable(): Promise<void> {
    if (this.wakeLock && !this.wakeLock.released) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        this.isEnabled = false;
        console.log('Wake Lock deactivated successfully');
      } catch (error) {
        console.error('Failed to deactivate Wake Lock:', error);
      }
    }
  }

  /**
   * Wake Lock 토글
   */
  async toggle(): Promise<boolean> {
    if (this.isEnabled) {
      await this.disable();
      return false;
    } else {
      return await this.enable();
    }
  }

  /**
   * 페이지 가시성 변경 시 Wake Lock 재활성화
   */
  setupVisibilityHandler(): void {
    if (!this.isSupported) {
      return;
    }

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && this.isEnabled && (!this.wakeLock || this.wakeLock.released)) {
        // 페이지가 다시 보이고 Wake Lock이 해제된 상태라면 재활성화
        await this.enable();
      }
    });
  }

  /**
   * 타이머 상태에 따른 자동 Wake Lock 관리
   */
  async handleTimerStateChange(isRunning: boolean, autoWakeLock: boolean = true): Promise<void> {
    if (!autoWakeLock) {
      return;
    }

    if (isRunning) {
      await this.enable();
    } else {
      await this.disable();
    }
  }

  /**
   * Wake Lock 상태 확인
   */
  get active(): boolean {
    return this.isEnabled && this.wakeLock !== null && !this.wakeLock.released;
  }

  /**
   * Wake Lock API 지원 여부
   */
  get supported(): boolean {
    return this.isSupported;
  }

  /**
   * 현재 Wake Lock 정보 (디버깅용)
   */
  getDebugInfo(): {
    supported: boolean;
    enabled: boolean;
    active: boolean;
    released: boolean | null;
  } {
    return {
      supported: this.isSupported,
      enabled: this.isEnabled,
      active: this.active,
      released: this.wakeLock ? this.wakeLock.released : null
    };
  }

  /**
   * 서비스 정리
   */
  async destroy(): Promise<void> {
    await this.disable();
  }
}