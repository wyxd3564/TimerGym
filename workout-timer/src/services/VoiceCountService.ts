/**
 * VoiceCountService - 음성 카운트 기능을 제공하는 서비스
 * 1초 간격 삐 소리와 한국어 음성 카운트를 제공합니다.
 */
export class VoiceCountService {
  private audioContext: AudioContext | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private beepInterval: number | null = null;
  private voiceInterval: number | null = null;
  private currentCount: number = 0;
  private isActive: boolean = false;
  private volume: number = 0.8;
  private beepBuffer: AudioBuffer | null = null;

  constructor() {
    this.initializeServices();
  }

  /**
   * 오디오 컨텍스트와 음성 합성 초기화
   */
  private initializeServices(): void {
    try {
      // AudioContext 초기화
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.generateBeepSound();
      } else {
        console.warn('Web Audio API is not supported in this browser');
      }

      // SpeechSynthesis 초기화
      if ('speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis;
      } else {
        console.warn('SpeechSynthesis API is not supported in this browser');
      }
    } catch (error) {
      console.error('Failed to initialize VoiceCountService:', error);
    }
  }

  /**
   * 삐 소리용 오디오 버퍼 생성
   */
  private async generateBeepSound(): Promise<void> {
    if (!this.audioContext) return;

    try {
      await this.resumeAudioContext();
      
      const sampleRate = this.audioContext.sampleRate;
      const duration = 0.1; // 100ms
      const frequency = 1000; // 1000Hz
      
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const channelData = buffer.getChannelData(0);

      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate;
        // 짧은 삐 소리 생성
        const envelope = Math.exp(-t * 10); // 빠른 감쇠
        channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
      }

      this.beepBuffer = buffer;
    } catch (error) {
      console.error('Failed to generate beep sound:', error);
    }
  }

  /**
   * AudioContext 재개 (사용자 상호작용 후 필요)
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
   * 삐 소리 재생
   */
  private async playBeep(): Promise<void> {
    if (!this.audioContext || !this.beepBuffer) return;

    try {
      await this.resumeAudioContext();
      
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.beepBuffer;
      gainNode.gain.value = this.volume * 0.5; // 삐 소리는 조금 더 작게
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.error('Failed to play beep:', error);
    }
  }

  /**
   * 숫자를 한국어로 변환
   */
  private getKoreanNumber(number: number): string {
    const koreanNumbers = [
      '', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열',
      '열하나', '열둘', '열셋', '열넷', '열다섯', '열여섯', '열일곱', '열여덟', '열아홉', '스물',
      '스물하나', '스물둘', '스물셋', '스물넷', '스물다섯', '스물여섯', '스물일곱', '스물여덟', '스물아홉', '서른',
      '서른하나', '서른둘', '서른셋', '서른넷', '서른다섯', '서른여섯', '서른일곱', '서른여덟', '서른아홉', '마흔',
      '마흔하나', '마흔둘', '마흔셋', '마흔넷', '마흔다섯', '마흔여섯', '마흔일곱', '마흔여덟', '마흔아홉', '쉰'
    ];

    if (number >= 1 && number <= 50) {
      return koreanNumbers[number];
    }

    // 50 이상의 경우 기본적인 변환 로직
    if (number > 50 && number <= 99) {
      const tens = Math.floor(number / 10);
      const ones = number % 10;
      const tensNames = ['', '', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
      
      if (ones === 0) {
        return tensNames[tens];
      } else {
        return tensNames[tens] + koreanNumbers[ones];
      }
    }

    // 100 이상은 숫자로 반환
    return number.toString();
  }

  /**
   * 음성으로 숫자 말하기
   */
  private speakNumber(number: number): void {
    if (!this.speechSynthesis) return;

    try {
      // 기존 음성 중단
      this.speechSynthesis.cancel();

      const koreanText = this.getKoreanNumber(number);
      const utterance = new SpeechSynthesisUtterance(koreanText);
      
      // 한국어 음성 설정
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8; // 조금 느리게
      utterance.pitch = 1.0;
      utterance.volume = this.volume;

      // 한국어 음성 찾기
      const voices = this.speechSynthesis.getVoices();
      const koreanVoice = voices.find(voice => 
        voice.lang.startsWith('ko') || voice.name.includes('Korean')
      );
      
      if (koreanVoice) {
        utterance.voice = koreanVoice;
      }

      this.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to speak number:', error);
    }
  }

  /**
   * 음성 카운트 시작
   */
  startVoiceCount(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.currentCount = 0;

    // 즉시 첫 번째 삐 소리 재생
    this.playBeep();

    // 1초마다 삐 소리 재생
    this.beepInterval = window.setInterval(() => {
      if (!this.isActive) return;
      this.playBeep();
    }, 1000);

    // 2초 후부터 음성 카운트 시작 (1초마다)
    setTimeout(() => {
      if (!this.isActive) return;
      
      // 첫 번째 카운트 (하나)
      this.currentCount = 1;
      this.speakNumber(this.currentCount);
      
      // 이후 1초마다 카운트 증가
      this.voiceInterval = window.setInterval(() => {
        if (!this.isActive) return;
        
        this.currentCount++;
        this.speakNumber(this.currentCount);
      }, 1000);
    }, 2000);
  }

  /**
   * 음성 카운트 중지
   */
  stopVoiceCount(): void {
    this.isActive = false;

    // 인터벌 정리
    if (this.beepInterval) {
      clearInterval(this.beepInterval);
      this.beepInterval = null;
    }

    if (this.voiceInterval) {
      clearInterval(this.voiceInterval);
      this.voiceInterval = null;
    }

    // 음성 합성 중단
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }

    this.currentCount = 0;
  }

  /**
   * 음성 카운트 토글
   */
  toggleVoiceCount(): void {
    if (this.isActive) {
      this.stopVoiceCount();
    } else {
      this.startVoiceCount();
    }
  }

  /**
   * 현재 카운트 숫자 반환
   */
  getCurrentCount(): number {
    return this.currentCount;
  }

  /**
   * 활성 상태 확인
   */
  isVoiceCountActive(): boolean {
    return this.isActive;
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
   * 서비스 사용 가능 여부 확인
   */
  isAvailable(): boolean {
    return this.audioContext !== null && this.speechSynthesis !== null;
  }

  /**
   * 사용자 상호작용 후 초기화 (브라우저 정책 준수)
   */
  async initializeAfterUserInteraction(): Promise<void> {
    await this.resumeAudioContext();
    if (!this.beepBuffer) {
      await this.generateBeepSound();
    }
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    this.stopVoiceCount();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.speechSynthesis = null;
    this.beepBuffer = null;
  }
}