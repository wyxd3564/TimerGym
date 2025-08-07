import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioNotificationService } from '../AudioNotificationService';
import { AUDIO_CONSTANTS } from '../../types';

// Mock Web Audio API
const mockAudioContext = {
  state: 'running',
  sampleRate: 44100,
  destination: {},
  createBuffer: vi.fn(),
  createBufferSource: vi.fn(),
  createGain: vi.fn(),
  resume: vi.fn(),
  close: vi.fn()
};

const mockBuffer = {
  getChannelData: vi.fn(() => new Float32Array(1024))
};

const mockSource = {
  buffer: null,
  connect: vi.fn(),
  start: vi.fn()
};

const mockGainNode = {
  gain: { value: 0 },
  connect: vi.fn()
};

// Global mocks
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn(() => mockAudioContext)
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: vi.fn(() => mockAudioContext)
});

describe('AudioNotificationService', () => {
  let service: AudioNotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockAudioContext.createBuffer.mockReturnValue(mockBuffer);
    mockAudioContext.createBufferSource.mockReturnValue(mockSource);
    mockAudioContext.createGain.mockReturnValue(mockGainNode);
    mockAudioContext.resume.mockResolvedValue(undefined);
    
    service = new AudioNotificationService();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('초기화', () => {
    it('AudioContext가 생성되어야 한다', () => {
      expect(window.AudioContext).toHaveBeenCalled();
    });

    it('초기 볼륨이 기본값으로 설정되어야 한다', () => {
      expect(service.getVolume()).toBe(AUDIO_CONSTANTS.DEFAULT_VOLUME);
    });

    it('초기에는 준비되지 않은 상태여야 한다', () => {
      expect(service.isReady()).toBe(false);
    });
  });

  describe('loadSounds', () => {
    it('사운드를 성공적으로 로드해야 한다', async () => {
      await service.loadSounds();
      
      expect(mockAudioContext.createBuffer).toHaveBeenCalledTimes(3); // beep, bell, chime
      expect(service.isReady()).toBe(true);
    });

    it('AudioContext가 suspended 상태일 때 resume을 호출해야 한다', async () => {
      mockAudioContext.state = 'suspended';
      
      await service.loadSounds();
      
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('AudioContext가 없을 때 경고를 출력해야 한다', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      service.destroy(); // AudioContext 제거
      
      const newService = new AudioNotificationService();
      // AudioContext 생성 실패 시뮬레이션
      Object.defineProperty(window, 'AudioContext', {
        writable: true,
        value: undefined
      });
      Object.defineProperty(window, 'webkitAudioContext', {
        writable: true,
        value: undefined
      });
      
      const serviceWithoutAudio = new AudioNotificationService();
      await serviceWithoutAudio.loadSounds();
      
      expect(consoleSpy).toHaveBeenCalledWith('AudioContext is not available');
      consoleSpy.mockRestore();
    });
  });

  describe('playCountdown', () => {
    beforeEach(async () => {
      await service.loadSounds();
    });

    it('카운트다운 사운드를 재생해야 한다', async () => {
      await service.playCountdown();
      
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockSource.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
      expect(mockSource.start).toHaveBeenCalled();
    });

    it('카운트다운 볼륨으로 재생해야 한다', async () => {
      await service.playCountdown();
      
      expect(mockGainNode.gain.value).toBe(AUDIO_CONSTANTS.COUNTDOWN_VOLUME);
    });
  });

  describe('playCompletion', () => {
    beforeEach(async () => {
      await service.loadSounds();
    });

    it('완료 사운드를 재생해야 한다', async () => {
      await service.playCompletion();
      
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
      expect(mockSource.start).toHaveBeenCalled();
    });

    it('완료 볼륨으로 재생해야 한다', async () => {
      await service.playCompletion();
      
      expect(mockGainNode.gain.value).toBe(AUDIO_CONSTANTS.COMPLETION_VOLUME);
    });
  });

  describe('setVolume', () => {
    it('볼륨을 올바르게 설정해야 한다', () => {
      service.setVolume(0.5);
      expect(service.getVolume()).toBe(0.5);
    });

    it('볼륨이 0 미만일 때 0으로 제한해야 한다', () => {
      service.setVolume(-0.5);
      expect(service.getVolume()).toBe(0);
    });

    it('볼륨이 1 초과일 때 1로 제한해야 한다', () => {
      service.setVolume(1.5);
      expect(service.getVolume()).toBe(1);
    });
  });

  describe('getAudioContextState', () => {
    it('AudioContext 상태를 반환해야 한다', () => {
      expect(service.getAudioContextState()).toBe('running');
    });

    it('AudioContext가 없을 때 unavailable을 반환해야 한다', () => {
      service.destroy();
      expect(service.getAudioContextState()).toBe('unavailable');
    });
  });

  describe('destroy', () => {
    it('리소스를 정리해야 한다', () => {
      service.destroy();
      
      expect(mockAudioContext.close).toHaveBeenCalled();
      expect(service.isReady()).toBe(false);
      expect(service.getAudioContextState()).toBe('unavailable');
    });
  });

  describe('initializeAfterUserInteraction', () => {
    it('초기화되지 않은 경우 loadSounds를 호출해야 한다', async () => {
      const loadSoundsSpy = vi.spyOn(service, 'loadSounds');
      
      await service.initializeAfterUserInteraction();
      
      expect(loadSoundsSpy).toHaveBeenCalled();
    });

    it('이미 초기화된 경우 AudioContext를 resume해야 한다', async () => {
      await service.loadSounds(); // 초기화
      mockAudioContext.state = 'suspended';
      
      await service.initializeAfterUserInteraction();
      
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    it('사운드 재생 중 에러가 발생해도 예외를 던지지 않아야 한다', async () => {
      await service.loadSounds();
      mockSource.start.mockImplementation(() => {
        throw new Error('Audio playback failed');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(service.playCountdown()).resolves.not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to play sound:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('초기화되지 않은 상태에서 사운드 재생 시 경고를 출력해야 한다', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await service.playCountdown();
      
      expect(consoleSpy).toHaveBeenCalledWith('AudioNotificationService is not initialized');
      consoleSpy.mockRestore();
    });
  });
});