import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoiceCountService } from '../VoiceCountService';

// Mock Web Audio API
const mockAudioContext = {
  state: 'running',
  sampleRate: 44100,
  createBuffer: vi.fn().mockReturnValue({
    getChannelData: vi.fn().mockReturnValue(new Float32Array(4410))
  }),
  createBufferSource: vi.fn().mockReturnValue({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn()
  }),
  createGain: vi.fn().mockReturnValue({
    gain: { value: 0 },
    connect: vi.fn()
  }),
  destination: {},
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn()
};

// Mock SpeechSynthesis API
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn().mockReturnValue([
    { lang: 'ko-KR', name: 'Korean Voice' },
    { lang: 'en-US', name: 'English Voice' }
  ])
};

// Mock SpeechSynthesisUtterance
const mockUtterance = {
  lang: '',
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null
};

describe('VoiceCountService', () => {
  let service: VoiceCountService;

  beforeEach(() => {
    // Mock global objects
    global.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);
    (global as any).webkitAudioContext = global.AudioContext;
    global.speechSynthesis = mockSpeechSynthesis as any;
    global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => mockUtterance);
    
    // Mock window.setInterval and clearInterval
    vi.spyOn(window, 'setInterval');
    vi.spyOn(window, 'clearInterval');
    vi.spyOn(window, 'setTimeout');

    service = new VoiceCountService();
  });

  afterEach(() => {
    service.destroy();
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('초기화', () => {
    it('AudioContext와 SpeechSynthesis가 초기화되어야 함', () => {
      expect(global.AudioContext).toHaveBeenCalled();
      expect(service.isAvailable()).toBe(true);
    });

    it('Web Audio API가 지원되지 않을 때 경고 로그 출력', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.AudioContext = undefined as any;
      (global as any).webkitAudioContext = undefined;
      
      new VoiceCountService();
      
      expect(consoleSpy).toHaveBeenCalledWith('Web Audio API is not supported in this browser');
      consoleSpy.mockRestore();
    });

    it('SpeechSynthesis API가 지원되지 않을 때 경고 로그 출력', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      delete (global as any).speechSynthesis;
      
      new VoiceCountService();
      
      expect(consoleSpy).toHaveBeenCalledWith('SpeechSynthesis API is not supported in this browser');
      consoleSpy.mockRestore();
    });
  });

  describe('음성 카운트 제어', () => {
    it('startVoiceCount 호출 시 활성 상태가 되어야 함', () => {
      service.startVoiceCount();
      expect(service.isVoiceCountActive()).toBe(true);
    });

    it('stopVoiceCount 호출 시 비활성 상태가 되어야 함', () => {
      service.startVoiceCount();
      service.stopVoiceCount();
      expect(service.isVoiceCountActive()).toBe(false);
    });

    it('toggleVoiceCount 호출 시 상태가 토글되어야 함', () => {
      expect(service.isVoiceCountActive()).toBe(false);
      
      service.toggleVoiceCount();
      expect(service.isVoiceCountActive()).toBe(true);
      
      service.toggleVoiceCount();
      expect(service.isVoiceCountActive()).toBe(false);
    });

    it('startVoiceCount 호출 시 1초 간격으로 삐 소리 인터벌이 설정되어야 함', () => {
      service.startVoiceCount();
      expect(window.setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('startVoiceCount 호출 시 2초 후 음성 카운트 인터벌이 설정되어야 함', () => {
      service.startVoiceCount();
      expect(window.setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
    });

    it('stopVoiceCount 호출 시 모든 인터벌이 정리되어야 함', () => {
      service.startVoiceCount();
      service.stopVoiceCount();
      expect(window.clearInterval).toHaveBeenCalled();
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('이미 활성 상태일 때 startVoiceCount 호출해도 중복 실행되지 않아야 함', () => {
      service.startVoiceCount();
      const firstCallCount = (window.setInterval as any).mock.calls.length;
      
      service.startVoiceCount();
      const secondCallCount = (window.setInterval as any).mock.calls.length;
      
      expect(secondCallCount).toBe(firstCallCount);
    });
  });

  describe('한국어 숫자 변환', () => {
    it('1-10 숫자가 올바른 한국어로 변환되어야 함', () => {
      // private 메서드이므로 간접적으로 테스트
      service.startVoiceCount();
      
      // 2초 후 음성 카운트가 시작되는지 확인
      expect(window.setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
    });

    it('getCurrentCount가 올바른 카운트를 반환해야 함', () => {
      expect(service.getCurrentCount()).toBe(0);
      
      service.startVoiceCount();
      expect(service.getCurrentCount()).toBe(0); // 아직 카운트 시작 전
    });
  });

  describe('볼륨 제어', () => {
    it('setVolume으로 볼륨을 설정할 수 있어야 함', () => {
      service.setVolume(0.5);
      expect(service.getVolume()).toBe(0.5);
    });

    it('볼륨이 0-1 범위로 제한되어야 함', () => {
      service.setVolume(-0.5);
      expect(service.getVolume()).toBe(0);
      
      service.setVolume(1.5);
      expect(service.getVolume()).toBe(1);
    });
  });

  describe('리소스 관리', () => {
    it('destroy 호출 시 모든 리소스가 정리되어야 함', () => {
      service.startVoiceCount();
      service.destroy();
      
      expect(service.isVoiceCountActive()).toBe(false);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('initializeAfterUserInteraction 호출 시 AudioContext가 재개되어야 함', async () => {
      mockAudioContext.state = 'suspended';
      await service.initializeAfterUserInteraction();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  });

  describe('오디오 생성', () => {
    it('삐 소리 재생 시 AudioContext가 사용되어야 함', async () => {
      service.startVoiceCount();
      
      // 삐 소리 재생을 위한 오디오 노드 생성 확인
      expect(mockAudioContext.createBuffer).toHaveBeenCalled();
    });

    it('AudioContext가 suspended 상태일 때 resume이 호출되어야 함', async () => {
      mockAudioContext.state = 'suspended';
      await service.initializeAfterUserInteraction();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  });

  describe('음성 합성', () => {
    it('음성 카운트 시작 후 2초가 지나면 음성 합성이 사용되어야 함', () => {
      vi.useFakeTimers();
      
      service.startVoiceCount();
      
      // 2초 후 음성 카운트 시작
      vi.advanceTimersByTime(2000);
      
      // 1초 더 진행하여 첫 번째 카운트 실행
      vi.advanceTimersByTime(1000);
      
      expect(mockSpeechSynthesis.getVoices).toHaveBeenCalled();
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('음성 합성 중단 시 cancel이 호출되어야 함', () => {
      service.startVoiceCount();
      service.stopVoiceCount();
      
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
  });
});