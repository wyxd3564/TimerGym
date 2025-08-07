import { AudioNotificationService } from './AudioNotificationService';
import { VibrationService } from './VibrationService';
import type { SettingsState, NotificationOptions } from '../types';

/**
 * NotificationService - 오디오 및 진동 알림을 통합 관리하는 서비스
 * 설정에 따라 알림을 활성화/비활성화하고 타이머와 연동합니다.
 */
export class NotificationService {
  private audioService: AudioNotificationService;
  private vibrationService: VibrationService;
  private settings: SettingsState['sound'] & SettingsState['vibration'];
  private isInitialized: boolean = false;

  constructor() {
    this.audioService = new AudioNotificationService();
    this.vibrationService = new VibrationService();
    
    // 기본 설정
    this.settings = {
      enabled: true,
      countdownSound: 'beep',
      completionSound: 'bell',
      pattern: [200, 100, 200]
    };
  }

  /**
   * 알림 서비스 초기화
   * 사용자 상호작용 후에 호출되어야 합니다 (브라우저 정책)
   */
  async initialize(): Promise<void> {
    try {
      // 오디오 서비스 초기화
      await this.audioService.loadSounds();
      
      // 진동 서비스는 별도 초기화 불필요
      this.isInitialized = true;
      
      console.log('NotificationService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
    }
  }

  /**
   * 설정 업데이트
   * @param soundSettings 사운드 설정
   * @param vibrationSettings 진동 설정
   */
  updateSettings(
    soundSettings: SettingsState['sound'],
    vibrationSettings: SettingsState['vibration']
  ): void {
    this.settings = {
      enabled: soundSettings.enabled,
      countdownSound: soundSettings.countdownSound,
      completionSound: soundSettings.completionSound,
      pattern: vibrationSettings.pattern
    };

    // 진동 서비스 활성화/비활성화
    if (this.vibrationService && typeof this.vibrationService.setEnabled === 'function') {
      this.vibrationService.setEnabled(vibrationSettings.enabled);
    }
    
    console.log('NotificationService settings updated:', this.settings);
  }

  /**
   * 카운트다운 알림 (3, 2, 1초)
   * 설정에 따라 사운드와 진동을 실행합니다.
   */
  async notifyCountdown(): Promise<void> {
    if (!this.isInitialized) {
      console.warn('NotificationService is not initialized');
      return;
    }

    const promises: Promise<void>[] = [];

    // 사운드 알림
    if (this.settings.enabled && this.audioService.isReady()) {
      promises.push(this.audioService.playCountdown());
    }

    // 진동 알림
    if (this.vibrationService.isVibrationEnabled() && this.vibrationService.isVibrationSupported()) {
      this.vibrationService.vibrateCountdown();
    }

    // 모든 알림을 병렬로 실행
    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error during countdown notification:', error);
    }
  }

  /**
   * 완료 알림
   * 설정에 따라 사운드와 진동을 실행합니다.
   */
  async notifyCompletion(): Promise<void> {
    if (!this.isInitialized) {
      console.warn('NotificationService is not initialized');
      return;
    }

    const promises: Promise<void>[] = [];

    // 사운드 알림
    if (this.settings.enabled && this.audioService.isReady()) {
      promises.push(this.audioService.playCompletion());
    }

    // 진동 알림
    if (this.vibrationService.isVibrationEnabled() && this.vibrationService.isVibrationSupported()) {
      this.vibrationService.vibrateCompletion();
    }

    // 모든 알림을 병렬로 실행
    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error during completion notification:', error);
    }
  }

  /**
   * 알림 테스트 (설정 화면에서 사용)
   * @param type 테스트할 알림 타입
   */
  async testNotification(type: 'countdown' | 'completion'): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    switch (type) {
      case 'countdown':
        await this.notifyCountdown();
        break;
      case 'completion':
        await this.notifyCompletion();
        break;
      default:
        console.warn(`Unknown notification type: ${type}`);
    }
  }

  /**
   * 사용자 상호작용 후 초기화
   * 브라우저 정책을 준수하기 위해 사용자 액션 후에 호출
   */
  async initializeAfterUserInteraction(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    } else {
      // 이미 초기화된 경우 오디오 컨텍스트만 재개
      await this.audioService.initializeAfterUserInteraction();
    }
  }

  /**
   * 오디오 볼륨 설정
   * @param volume 볼륨 (0.0 ~ 1.0)
   */
  setVolume(volume: number): void {
    this.audioService.setVolume(volume);
  }

  /**
   * 현재 볼륨 반환
   */
  getVolume(): number {
    return this.audioService.getVolume();
  }

  /**
   * 서비스 상태 정보 반환
   */
  getStatus(): {
    isInitialized: boolean;
    audio: {
      isReady: boolean;
      contextState: string;
      volume: number;
    };
    vibration: {
      isSupported: boolean;
      isEnabled: boolean;
      deviceInfo: ReturnType<VibrationService['getDeviceInfo']>;
    };
    settings: {
      sound: { enabled: boolean; selectedSound: string };
      vibration: { enabled: boolean };
    };
  } {
    return {
      isInitialized: this.isInitialized,
      audio: {
        isReady: this.audioService.isReady(),
        contextState: this.audioService.getAudioContextState(),
        volume: this.audioService.getVolume()
      },
      vibration: {
        isSupported: this.vibrationService.isVibrationSupported(),
        isEnabled: this.vibrationService.isVibrationEnabled(),
        deviceInfo: this.vibrationService.getDeviceInfo()
      },
      settings: {
        sound: { 
          enabled: this.settings.enabled, 
          selectedSound: this.settings.countdownSound 
        },
        vibration: { 
          enabled: this.settings.enabled 
        }
      }
    };
  }

  /**
   * 알림 서비스가 준비되었는지 확인
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    if (this.audioService && typeof this.audioService.destroy === 'function') {
      this.audioService.destroy();
    }
    if (this.vibrationService && typeof this.vibrationService.stopVibration === 'function') {
      this.vibrationService.stopVibration();
    }
    this.isInitialized = false;
  }

  /**
   * 개별 서비스 접근 (고급 사용자용)
   */
  getAudioService(): AudioNotificationService {
    return this.audioService;
  }

  /**
   * 개별 서비스 접근 (고급 사용자용)
   */
  getVibrationService(): VibrationService {
    return this.vibrationService;
  }

  /**
   * 알림 옵션으로 설정 업데이트 (편의 메서드)
   */
  updateNotificationOptions(options: NotificationOptions): void {
    const soundSettings = {
      enabled: options.sound,
      countdownSound: options.countdownSound || 'beep',
      completionSound: options.completionSound || 'bell'
    };

    const vibrationSettings = {
      enabled: options.vibration,
      pattern: options.vibrationPattern || [200, 100, 200]
    };

    this.updateSettings(soundSettings, vibrationSettings);
  }
}