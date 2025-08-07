import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationService } from '../NotificationService';
import { AudioNotificationService } from '../AudioNotificationService';
import { VibrationService } from '../VibrationService';

// Mock the services
vi.mock('../AudioNotificationService');
vi.mock('../VibrationService');

const MockedAudioNotificationService = vi.mocked(AudioNotificationService);
const MockedVibrationService = vi.mocked(VibrationService);

describe('NotificationService', () => {
  let service: NotificationService;
  let mockAudioService: any;
  let mockVibrationService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock audio service
    mockAudioService = {
      loadSounds: vi.fn().mockResolvedValue(undefined),
      playCountdown: vi.fn().mockResolvedValue(undefined),
      playCompletion: vi.fn().mockResolvedValue(undefined),
      setVolume: vi.fn(),
      getVolume: vi.fn().mockReturnValue(0.8),
      isReady: vi.fn().mockReturnValue(true),
      getAudioContextState: vi.fn().mockReturnValue('running'),
      destroy: vi.fn(),
      initializeAfterUserInteraction: vi.fn().mockResolvedValue(undefined)
    };

    // Mock vibration service
    mockVibrationService = {
      vibrateCountdown: vi.fn(),
      vibrateCompletion: vi.fn(),
      setEnabled: vi.fn(),
      isVibrationEnabled: vi.fn().mockReturnValue(true),
      isVibrationSupported: vi.fn().mockReturnValue(true),
      getDeviceInfo: vi.fn().mockReturnValue({
        isSupported: true,
        isEnabled: true,
        userAgent: 'test',
        isMobile: true
      }),
      stopVibration: vi.fn()
    };

    MockedAudioNotificationService.mockImplementation(() => mockAudioService);
    MockedVibrationService.mockImplementation(() => mockVibrationService);

    service = new NotificationService();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('초기화', () => {
    it('오디오 및 진동 서비스를 생성해야 한다', () => {
      expect(MockedAudioNotificationService).toHaveBeenCalled();
      expect(MockedVibrationService).toHaveBeenCalled();
    });

    it('초기에는 준비되지 않은 상태여야 한다', () => {
      expect(service.isReady()).toBe(false);
    });

    it('initialize 호출 시 오디오 서비스를 로드해야 한다', async () => {
      await service.initialize();

      expect(mockAudioService.loadSounds).toHaveBeenCalled();
      expect(service.isReady()).toBe(true);
    });

    it('initialize 실패 시에도 예외를 던지지 않아야 한다', async () => {
      mockAudioService.loadSounds.mockRejectedValue(new Error('Load failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.initialize()).resolves.not.toThrow();
      expect(service.isReady()).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('설정 업데이트', () => {
    it('사운드 및 진동 설정을 업데이트해야 한다', () => {
      const soundSettings = {
        enabled: true,
        countdownSound: 'beep' as const,
        completionSound: 'bell' as const
      };

      const vibrationSettings = {
        enabled: false,
        pattern: [100, 50, 100]
      };

      service.updateSettings(soundSettings, vibrationSettings);

      expect(mockVibrationService.setEnabled).toHaveBeenCalledWith(false);
    });

    it('알림 옵션으로 설정을 업데이트해야 한다', () => {
      const options = {
        sound: true,
        vibration: false,
        countdownSound: 'chime' as const,
        completionSound: 'bell' as const,
        vibrationPattern: [200, 100, 200]
      };

      service.updateNotificationOptions(options);

      expect(mockVibrationService.setEnabled).toHaveBeenCalledWith(false);
    });
  });

  describe('카운트다운 알림', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('사운드와 진동 알림을 모두 실행해야 한다', async () => {
      await service.notifyCountdown();

      expect(mockAudioService.playCountdown).toHaveBeenCalled();
      expect(mockVibrationService.vibrateCountdown).toHaveBeenCalled();
    });

    it('초기화되지 않은 상태에서 경고를 출력해야 한다', async () => {
      const uninitializedService = new NotificationService();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await uninitializedService.notifyCountdown();

      expect(consoleSpy).toHaveBeenCalledWith('NotificationService is not initialized');
      consoleSpy.mockRestore();
    });

    it('오디오 서비스가 준비되지 않았을 때 사운드를 재생하지 않아야 한다', async () => {
      mockAudioService.isReady.mockReturnValue(false);

      await service.notifyCountdown();

      expect(mockAudioService.playCountdown).not.toHaveBeenCalled();
      expect(mockVibrationService.vibrateCountdown).toHaveBeenCalled();
    });

    it('진동이 비활성화되었을 때 진동하지 않아야 한다', async () => {
      mockVibrationService.isVibrationEnabled.mockReturnValue(false);

      await service.notifyCountdown();

      expect(mockAudioService.playCountdown).toHaveBeenCalled();
      expect(mockVibrationService.vibrateCountdown).not.toHaveBeenCalled();
    });

    it('알림 실행 중 에러가 발생해도 예외를 던지지 않아야 한다', async () => {
      mockAudioService.playCountdown.mockRejectedValue(new Error('Audio failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.notifyCountdown()).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Error during countdown notification:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('완료 알림', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('사운드와 진동 알림을 모두 실행해야 한다', async () => {
      await service.notifyCompletion();

      expect(mockAudioService.playCompletion).toHaveBeenCalled();
      expect(mockVibrationService.vibrateCompletion).toHaveBeenCalled();
    });

    it('초기화되지 않은 상태에서 경고를 출력해야 한다', async () => {
      const uninitializedService = new NotificationService();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await uninitializedService.notifyCompletion();

      expect(consoleSpy).toHaveBeenCalledWith('NotificationService is not initialized');
      consoleSpy.mockRestore();
    });

    it('알림 실행 중 에러가 발생해도 예외를 던지지 않아야 한다', async () => {
      mockAudioService.playCompletion.mockRejectedValue(new Error('Audio failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.notifyCompletion()).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Error during completion notification:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('알림 테스트', () => {
    it('카운트다운 테스트를 실행해야 한다', async () => {
      const notifyCountdownSpy = vi.spyOn(service, 'notifyCountdown').mockResolvedValue();

      await service.testNotification('countdown');

      expect(notifyCountdownSpy).toHaveBeenCalled();
    });

    it('완료 테스트를 실행해야 한다', async () => {
      const notifyCompletionSpy = vi.spyOn(service, 'notifyCompletion').mockResolvedValue();

      await service.testNotification('completion');

      expect(notifyCompletionSpy).toHaveBeenCalled();
    });

    it('초기화되지 않은 상태에서 자동으로 초기화해야 한다', async () => {
      const initializeSpy = vi.spyOn(service, 'initialize').mockResolvedValue();

      await service.testNotification('countdown');

      expect(initializeSpy).toHaveBeenCalled();
    });

    it('알 수 없는 타입일 때 경고를 출력해야 한다', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await service.testNotification('unknown' as any);

      expect(consoleSpy).toHaveBeenCalledWith('Unknown notification type: unknown');
      consoleSpy.mockRestore();
    });
  });

  describe('볼륨 관리', () => {
    it('볼륨을 설정해야 한다', () => {
      service.setVolume(0.5);

      expect(mockAudioService.setVolume).toHaveBeenCalledWith(0.5);
    });

    it('현재 볼륨을 반환해야 한다', () => {
      const volume = service.getVolume();

      expect(mockAudioService.getVolume).toHaveBeenCalled();
      expect(volume).toBe(0.8);
    });
  });

  describe('상태 정보', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('서비스 상태 정보를 반환해야 한다', () => {
      const status = service.getStatus();

      expect(status).toEqual({
        isInitialized: true,
        audio: {
          isReady: true,
          contextState: 'running',
          volume: 0.8
        },
        vibration: {
          isSupported: true,
          isEnabled: true,
          deviceInfo: expect.any(Object)
        },
        settings: expect.any(Object)
      });
    });
  });

  describe('사용자 상호작용 후 초기화', () => {
    it('초기화되지 않은 경우 initialize를 호출해야 한다', async () => {
      const initializeSpy = vi.spyOn(service, 'initialize').mockResolvedValue();

      await service.initializeAfterUserInteraction();

      expect(initializeSpy).toHaveBeenCalled();
    });

    it('이미 초기화된 경우 오디오 서비스만 초기화해야 한다', async () => {
      await service.initialize();

      await service.initializeAfterUserInteraction();

      expect(mockAudioService.initializeAfterUserInteraction).toHaveBeenCalled();
    });
  });

  describe('개별 서비스 접근', () => {
    it('오디오 서비스를 반환해야 한다', () => {
      const audioService = service.getAudioService();
      expect(audioService).toBe(mockAudioService);
    });

    it('진동 서비스를 반환해야 한다', () => {
      const vibrationService = service.getVibrationService();
      expect(vibrationService).toBe(mockVibrationService);
    });
  });

  describe('리소스 정리', () => {
    it('모든 서비스를 정리해야 한다', () => {
      service.destroy();

      expect(mockAudioService.destroy).toHaveBeenCalled();
      expect(mockVibrationService.stopVibration).toHaveBeenCalled();
      expect(service.isReady()).toBe(false);
    });
  });
});