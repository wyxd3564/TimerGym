import { VIBRATION_PATTERNS } from '../types';

/**
 * VibrationService - Vibration API를 사용한 진동 알림 서비스
 * 카운트다운 및 완료 시 진동 패턴을 제공합니다.
 */
export class VibrationService {
  private isSupported: boolean;
  private isEnabled: boolean = true;

  constructor() {
    this.isSupported = this.checkVibrationSupport();
  }

  /**
   * 진동 API 지원 여부 확인
   */
  private checkVibrationSupport(): boolean {
    // Navigator 객체와 vibrate 메서드 존재 확인
    if (typeof navigator === 'undefined' || !navigator.vibrate) {
      return false;
    }

    // 일부 브라우저에서는 vibrate가 존재하지만 실제로 작동하지 않을 수 있음
    try {
      // 0ms 진동으로 테스트 (실제 진동 없음)
      navigator.vibrate(0);
      return true;
    } catch (error) {
      console.warn('Vibration API test failed:', error);
      return false;
    }
  }

  /**
   * 진동 패턴 실행
   * @param pattern 진동 패턴 배열 [진동시간, 정지시간, 진동시간, ...]
   */
  vibrate(pattern: readonly number[]): void {
    if (!this.isSupported) {
      console.warn('Vibration API is not supported on this device');
      return;
    }

    if (!this.isEnabled) {
      console.log('Vibration is disabled');
      return;
    }

    if (!Array.isArray(pattern) || pattern.length === 0) {
      console.warn('Invalid vibration pattern provided');
      return;
    }

    // 패턴 값 검증 및 정규화
    const normalizedPattern = pattern.map(duration => {
      const normalized = Math.max(0, Math.min(10000, Math.floor(duration))); // 0-10초 제한
      return normalized;
    });

    try {
      navigator.vibrate(normalizedPattern);
      console.log('Vibration pattern executed:', normalizedPattern);
    } catch (error) {
      console.error('Failed to execute vibration pattern:', error);
    }
  }

  /**
   * 카운트다운 진동 (3, 2, 1초)
   * 짧고 간단한 진동
   */
  vibrateCountdown(): void {
    this.vibrate(VIBRATION_PATTERNS.COUNTDOWN);
  }

  /**
   * 완료 진동
   * 길고 복잡한 진동 패턴
   */
  vibrateCompletion(): void {
    this.vibrate(VIBRATION_PATTERNS.COMPLETION);
  }

  /**
   * 짧은 진동 (일반적인 피드백용)
   */
  vibrateShort(): void {
    this.vibrate(VIBRATION_PATTERNS.SHORT);
  }

  /**
   * 긴 진동 (강한 알림용)
   */
  vibrateLong(): void {
    this.vibrate(VIBRATION_PATTERNS.LONG);
  }

  /**
   * 사용자 정의 진동 패턴 실행
   * @param patternName 미리 정의된 패턴 이름
   */
  vibratePattern(patternName: keyof typeof VIBRATION_PATTERNS): void {
    const pattern = VIBRATION_PATTERNS[patternName];
    if (pattern) {
      this.vibrate(pattern);
    } else {
      console.warn(`Unknown vibration pattern: ${patternName}`);
    }
  }

  /**
   * 현재 진행 중인 진동 중지
   */
  stopVibration(): void {
    if (!this.isSupported) {
      return;
    }

    try {
      navigator.vibrate(0); // 0을 전달하면 진동 중지
      console.log('Vibration stopped');
    } catch (error) {
      console.error('Failed to stop vibration:', error);
    }
  }

  /**
   * 진동 활성화/비활성화 설정
   * @param enabled 진동 활성화 여부
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    // 비활성화 시 현재 진동 중지
    if (!enabled) {
      this.stopVibration();
    }
    
    console.log(`Vibration ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * 진동 활성화 상태 확인
   */
  isVibrationEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 진동 API 지원 여부 확인
   */
  isVibrationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * 디바이스 및 브라우저 정보 반환
   */
  getDeviceInfo(): {
    isSupported: boolean;
    isEnabled: boolean;
    userAgent: string;
    isMobile: boolean;
  } {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    return {
      isSupported: this.isSupported,
      isEnabled: this.isEnabled,
      userAgent,
      isMobile
    };
  }

  /**
   * 진동 패턴 유효성 검사
   * @param pattern 검사할 진동 패턴
   */
  validatePattern(pattern: number[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!Array.isArray(pattern)) {
      errors.push('Pattern must be an array');
      return { isValid: false, errors };
    }

    if (pattern.length === 0) {
      errors.push('Pattern cannot be empty');
    }

    if (pattern.length > 100) {
      errors.push('Pattern is too long (max 100 elements)');
    }

    pattern.forEach((duration, index) => {
      if (typeof duration !== 'number') {
        errors.push(`Element at index ${index} must be a number`);
      } else if (duration < 0) {
        errors.push(`Element at index ${index} cannot be negative`);
      } else if (duration > 10000) {
        errors.push(`Element at index ${index} is too long (max 10000ms)`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 진동 패턴 테스트 (개발/디버깅용)
   * @param pattern 테스트할 패턴
   */
  testPattern(pattern: number[]): void {
    const validation = this.validatePattern(pattern);
    
    if (!validation.isValid) {
      console.error('Invalid vibration pattern:', validation.errors);
      return;
    }

    console.log('Testing vibration pattern:', pattern);
    this.vibrate(pattern);
  }

  /**
   * 사용 가능한 진동 패턴 목록 반환
   */
  getAvailablePatterns(): Record<string, readonly number[]> {
    return { ...VIBRATION_PATTERNS };
  }

  /**
   * 진동 서비스 상태 정보 반환
   */
  getStatus(): {
    supported: boolean;
    enabled: boolean;
    deviceInfo: ReturnType<VibrationService['getDeviceInfo']>;
    availablePatterns: string[];
  } {
    return {
      supported: this.isSupported,
      enabled: this.isEnabled,
      deviceInfo: this.getDeviceInfo(),
      availablePatterns: Object.keys(VIBRATION_PATTERNS)
    };
  }
}