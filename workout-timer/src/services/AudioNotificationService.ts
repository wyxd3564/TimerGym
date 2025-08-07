import { AUDIO_CONSTANTS, type SoundType } from '../types';

/**
 * AudioNotificationService - Web Audio API를 사용한 오디오 알림 서비스
 * 카운트다운 및 완료 알림음을 생성하고 재생합니다.
 */
export class AudioNotificationService {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private volume: number = AUDIO_CONSTANTS.DEFAULT_VOLUME;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeAudioContext();
  }

  /**
   * AudioContext 초기화
   */
  private initializeAudioContext(): void {
    try {
      // AudioContext 생성 (브라우저 호환성 고려)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      } else {
        console.warn('Web Audio API is not supported in this browser');
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  /**
   * 오디오 컨텍스트 재개 (사용자 상호작용 후 필요)
   */
  private async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    }
  }

  /**
   * 사운드 로딩 및 초기화
   */
  async loadSounds(): Promise<void> {
    if (!this.audioContext) {
      console.warn('AudioContext is not available');
      return;
    }

    try {
      await this.resumeAudioContext();
      
      // 프로그래밍 방식으로 사운드 생성
      await this.generateBeepSound();
      await this.generateBellSound();
      await this.generateChimeSound();
      
      this.isInitialized = true;
      console.log('Audio sounds loaded successfully');
    } catch (error) {
      console.error('Failed to load sounds:', error);
    }
  }

  /**
   * 비프음 생성 (카운트다운용)
   */
  private async generateBeepSound(): Promise<void> {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2; // 200ms
    const frequency = 800; // 800Hz
    
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // 사인파 생성 with envelope
      const envelope = Math.exp(-t * 5); // 감쇠 효과
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    this.sounds.set(AUDIO_CONSTANTS.SOUNDS.BEEP, buffer);
  }

  /**
   * 벨 사운드 생성 (완료용)
   */
  private async generateBellSound(): Promise<void> {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.8; // 800ms
    
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // 복합 주파수로 벨 소리 생성
      const fundamental = Math.sin(2 * Math.PI * 523 * t); // C5
      const harmonic1 = Math.sin(2 * Math.PI * 659 * t) * 0.5; // E5
      const harmonic2 = Math.sin(2 * Math.PI * 784 * t) * 0.3; // G5
      
      const envelope = Math.exp(-t * 2); // 느린 감쇠
      channelData[i] = (fundamental + harmonic1 + harmonic2) * envelope * 0.2;
    }

    this.sounds.set(AUDIO_CONSTANTS.SOUNDS.BELL, buffer);
  }

  /**
   * 차임 사운드 생성
   */
  private async generateChimeSound(): Promise<void> {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.6; // 600ms
    
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // 상승하는 톤으로 차임 효과
      const frequency = 440 + (t * 220); // 440Hz에서 660Hz로 상승
      const envelope = Math.exp(-t * 3);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.25;
    }

    this.sounds.set(AUDIO_CONSTANTS.SOUNDS.CHIME, buffer);
  }

  /**
   * 사운드 재생
   */
  private async playSound(soundType: SoundType, volume: number = this.volume): Promise<void> {
    if (!this.audioContext || !this.isInitialized) {
      console.warn('AudioNotificationService is not initialized');
      return;
    }

    try {
      await this.resumeAudioContext();
      
      const buffer = this.sounds.get(soundType);
      if (!buffer) {
        console.warn(`Sound ${soundType} not found`);
        return;
      }

      // AudioBufferSourceNode 생성
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
      
      // 연결: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 재생
      source.start();
      
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }

  /**
   * 카운트다운 알림음 재생 (3, 2, 1초)
   */
  async playCountdown(): Promise<void> {
    await this.playSound(AUDIO_CONSTANTS.SOUNDS.BEEP, AUDIO_CONSTANTS.COUNTDOWN_VOLUME);
  }

  /**
   * 완료 알림음 재생
   */
  async playCompletion(): Promise<void> {
    await this.playSound(AUDIO_CONSTANTS.SOUNDS.BELL, AUDIO_CONSTANTS.COMPLETION_VOLUME);
  }

  /**
   * 특정 사운드 타입 재생
   */
  async playSoundType(soundType: SoundType): Promise<void> {
    await this.playSound(soundType, this.volume);
  }

  /**
   * 볼륨 설정 (0.0 ~ 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 현재 볼륨 반환
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * 서비스 초기화 상태 확인
   */
  isReady(): boolean {
    return this.isInitialized && this.audioContext !== null;
  }

  /**
   * 오디오 컨텍스트 상태 확인
   */
  getAudioContextState(): string {
    return this.audioContext?.state || 'unavailable';
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.sounds.clear();
    this.isInitialized = false;
  }

  /**
   * 사용자 상호작용 후 초기화 (브라우저 정책 준수)
   */
  async initializeAfterUserInteraction(): Promise<void> {
    if (!this.isInitialized) {
      await this.loadSounds();
    } else {
      await this.resumeAudioContext();
    }
  }
}