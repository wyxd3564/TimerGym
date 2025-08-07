import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VibrationService } from '../VibrationService';
import { VIBRATION_PATTERNS } from '../../types';

// Mock navigator.vibrate
const mockVibrate = vi.fn();

// Mock navigator object
Object.defineProperty(global, 'navigator', {
  writable: true,
  value: {
    vibrate: mockVibrate,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  }
});

describe('VibrationService', () => {
  let service: VibrationService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVibrate.mockReturnValue(true);
    service = new VibrationService();
  });

  describe('초기화', () => {
    it('진동 API 지원 여부를 올바르게 감지해야 한다', () => {
      expect(service.isVibrationSupported()).toBe(true);
    });

    it('초기에는 진동이 활성화되어 있어야 한다', () => {
      expect(service.isVibrationEnabled()).toBe(true);
    });

    it('navigator.vibrate가 없을 때 지원하지 않는다고 판단해야 한다', () => {
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
          // vibrate 속성 없음
        }
      });
      
      const serviceWithoutVibrate = new VibrationService();
      expect(serviceWithoutVibrate.isVibrationSupported()).toBe(false);
      
      // 원래 mock으로 복원
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: {
          vibrate: mockVibrate,
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      });
    });
  });

  describe('vibrate', () => {
    it('유효한 패턴으로 진동을 실행해야 한다', () => {
      const pattern = [200, 100, 200];
      service.vibrate(pattern);
      
      expect(mockVibrate).toHaveBeenCalledWith(pattern);
    });

    it('진동이 지원되지 않을 때 경고를 출력해야 한다', () => {
      Object.defineProperty(navigator, 'vibrate', {
        writable: true,
        value: undefined
      });
      
      const serviceWithoutVibrate = new VibrationService();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      serviceWithoutVibrate.vibrate([100]);
      
      expect(consoleSpy).toHaveBeenCalledWith('Vibration API is not supported on this device');
      consoleSpy.mockRestore();
    });

    it('진동이 비활성화되었을 때 실행하지 않아야 한다', () => {
      service.setEnabled(false);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      service.vibrate([100]);
      
      expect(mockVibrate).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Vibration is disabled');
      consoleSpy.mockRestore();
    });

    it('잘못된 패턴일 때 경고를 출력해야 한다', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      service.vibrate([]);
      
      expect(consoleSpy).toHaveBeenCalledWith('Invalid vibration pattern provided');
      expect(mockVibrate).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('패턴 값을 정규화해야 한다', () => {
      const pattern = [-100, 50, 15000]; // 음수, 정상값, 너무 큰 값
      service.vibrate(pattern);
      
      expect(mockVibrate).toHaveBeenCalledWith([0, 50, 10000]);
    });
  });

  describe('미리 정의된 진동 패턴', () => {
    it('카운트다운 진동을 실행해야 한다', () => {
      service.vibrateCountdown();
      
      expect(mockVibrate).toHaveBeenCalledWith(VIBRATION_PATTERNS.COUNTDOWN);
    });

    it('완료 진동을 실행해야 한다', () => {
      service.vibrateCompletion();
      
      expect(mockVibrate).toHaveBeenCalledWith(VIBRATION_PATTERNS.COMPLETION);
    });

    it('짧은 진동을 실행해야 한다', () => {
      service.vibrateShort();
      
      expect(mockVibrate).toHaveBeenCalledWith(VIBRATION_PATTERNS.SHORT);
    });

    it('긴 진동을 실행해야 한다', () => {
      service.vibrateLong();
      
      expect(mockVibrate).toHaveBeenCalledWith(VIBRATION_PATTERNS.LONG);
    });

    it('패턴 이름으로 진동을 실행해야 한다', () => {
      service.vibratePattern('COUNTDOWN');
      
      expect(mockVibrate).toHaveBeenCalledWith(VIBRATION_PATTERNS.COUNTDOWN);
    });

    it('존재하지 않는 패턴 이름일 때 경고를 출력해야 한다', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      service.vibratePattern('INVALID_PATTERN' as any);
      
      expect(consoleSpy).toHaveBeenCalledWith('Unknown vibration pattern: INVALID_PATTERN');
      expect(mockVibrate).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('stopVibration', () => {
    it('진동을 중지해야 한다', () => {
      service.stopVibration();
      
      expect(mockVibrate).toHaveBeenCalledWith(0);
    });

    it('진동이 지원되지 않을 때 아무것도 하지 않아야 한다', () => {
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
          // vibrate 속성 없음
        }
      });
      
      const serviceWithoutVibrate = new VibrationService();
      serviceWithoutVibrate.stopVibration();
      
      expect(mockVibrate).not.toHaveBeenCalled();
      
      // 원래 mock으로 복원
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: {
          vibrate: mockVibrate,
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      });
    });
  });

  describe('setEnabled', () => {
    it('진동을 비활성화해야 한다', () => {
      service.setEnabled(false);
      
      expect(service.isVibrationEnabled()).toBe(false);
      expect(mockVibrate).toHaveBeenCalledWith(0); // 현재 진동 중지
    });

    it('진동을 활성화해야 한다', () => {
      service.setEnabled(false);
      vi.clearAllMocks();
      
      service.setEnabled(true);
      
      expect(service.isVibrationEnabled()).toBe(true);
      expect(mockVibrate).not.toHaveBeenCalled(); // 활성화 시에는 진동 중지 호출 안함
    });
  });

  describe('getDeviceInfo', () => {
    it('디바이스 정보를 반환해야 한다', () => {
      const deviceInfo = service.getDeviceInfo();
      
      expect(deviceInfo).toEqual({
        isSupported: true,
        isEnabled: true,
        userAgent: expect.any(String),
        isMobile: true // iPhone userAgent로 설정했으므로
      });
    });
  });

  describe('validatePattern', () => {
    it('유효한 패턴을 검증해야 한다', () => {
      const result = service.validatePattern([100, 200, 300]);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('배열이 아닌 값을 거부해야 한다', () => {
      const result = service.validatePattern('invalid' as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pattern must be an array');
    });

    it('빈 배열을 거부해야 한다', () => {
      const result = service.validatePattern([]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pattern cannot be empty');
    });

    it('너무 긴 패턴을 거부해야 한다', () => {
      const longPattern = new Array(101).fill(100);
      const result = service.validatePattern(longPattern);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pattern is too long (max 100 elements)');
    });

    it('음수 값을 거부해야 한다', () => {
      const result = service.validatePattern([100, -50, 200]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Element at index 1 cannot be negative');
    });

    it('너무 큰 값을 거부해야 한다', () => {
      const result = service.validatePattern([100, 15000, 200]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Element at index 1 is too long (max 10000ms)');
    });

    it('숫자가 아닌 값을 거부해야 한다', () => {
      const result = service.validatePattern([100, 'invalid' as any, 200]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Element at index 1 must be a number');
    });
  });

  describe('testPattern', () => {
    it('유효한 패턴을 테스트해야 한다', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const pattern = [100, 200];
      
      service.testPattern(pattern);
      
      expect(consoleSpy).toHaveBeenCalledWith('Testing vibration pattern:', pattern);
      expect(mockVibrate).toHaveBeenCalledWith(pattern);
      consoleSpy.mockRestore();
    });

    it('잘못된 패턴일 때 에러를 출력해야 한다', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      service.testPattern([]);
      
      expect(consoleSpy).toHaveBeenCalledWith('Invalid vibration pattern:', ['Pattern cannot be empty']);
      expect(mockVibrate).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getAvailablePatterns', () => {
    it('사용 가능한 패턴 목록을 반환해야 한다', () => {
      const patterns = service.getAvailablePatterns();
      
      expect(patterns).toEqual(VIBRATION_PATTERNS);
      expect(Object.keys(patterns)).toContain('COUNTDOWN');
      expect(Object.keys(patterns)).toContain('COMPLETION');
    });
  });

  describe('getStatus', () => {
    it('서비스 상태 정보를 반환해야 한다', () => {
      const status = service.getStatus();
      
      expect(status).toEqual({
        supported: true,
        enabled: true,
        deviceInfo: expect.any(Object),
        availablePatterns: expect.any(Array)
      });
      
      expect(status.availablePatterns).toContain('COUNTDOWN');
      expect(status.availablePatterns).toContain('COMPLETION');
    });
  });

  describe('에러 처리', () => {
    it('진동 실행 중 에러가 발생해도 예외를 던지지 않아야 한다', () => {
      mockVibrate.mockImplementation(() => {
        throw new Error('Vibration failed');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => service.vibrate([100])).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to execute vibration pattern:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('진동 중지 중 에러가 발생해도 예외를 던지지 않아야 한다', () => {
      mockVibrate.mockImplementation(() => {
        throw new Error('Stop vibration failed');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => service.stopVibration()).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to stop vibration:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});