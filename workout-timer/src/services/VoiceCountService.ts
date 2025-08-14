/**
 * VoiceCountService - 음성 카운트 MP3 재생 서비스
 * 버튼 토글 동작으로 count-ko.mp3를 재생/정지합니다.
 */
import countKoUrl from '../assets/count-ko.mp3?url';
export class VoiceCountService {
  private currentCount: number = 0;
  private isActive: boolean = false;
  private volume: number = 0.8;
  private mp3Audio: HTMLAudioElement | null = null;
  private isMp3Playing: boolean = false;

  constructor() {}

  /**
   * 음성 카운트 MP3 파일 재생 시작
   * - 첫 클릭: 재생 시작
   * - 다시 클릭: 정지 및 초기화
   * - 재시작 시 항상 처음부터 재생
   */
  startVoiceCount(): void {
    // 상태 플래그
    this.isActive = true;

    // 기존 인터벌/합성은 사용하지 않음

    // MP3 재생 준비 및 시작
    if (!this.mp3Audio) {
      try {
        // Vite 에셋 URL로 오디오 생성 (테스트/개발/빌드 환경 모두 안전)
        this.mp3Audio = new Audio(countKoUrl);
        this.mp3Audio.preload = 'auto';
      } catch (error) {
        console.error('Failed to create audio element for count-ko.mp3', error);
        return;
      }
    }

    try {
      this.mp3Audio.currentTime = 0; // 항상 처음부터
      this.mp3Audio.volume = this.volume;
      
      // 재생 시작
      const playPromise = this.mp3Audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isMp3Playing = true;
          })
          .catch((error) => {
            console.error('Failed to play count-ko.mp3', error);
            this.isActive = false;
            this.isMp3Playing = false;
          });
      }
      
      // 재생이 끝나면 상태 초기화
      this.mp3Audio.onended = () => {
        this.isMp3Playing = false;
        this.isActive = false;
        this.currentCount = 0;
      };
      
      // 에러 처리
      this.mp3Audio.onerror = () => {
        console.error('Audio playback error');
        this.isMp3Playing = false;
        this.isActive = false;
        this.currentCount = 0;
      };
      
    } catch (error) {
      console.error('Failed to play count-ko.mp3', error);
      this.isActive = false;
      this.isMp3Playing = false;
    }
  }

  /**
   * 음성 카운트 중지
   */
  stopVoiceCount(): void {
    this.isActive = false;

    // 인터벌/음성 합성 사용 안 함

    // MP3 재생 중지 및 초기화
    if (this.mp3Audio) {
      try {
        this.mp3Audio.pause();
        this.mp3Audio.currentTime = 0;
      } catch (error) {
        console.warn('Failed to stop audio playback', error);
      }
      this.isMp3Playing = false;
    }

    this.currentCount = 0;
  }

  /**
   * 음성 카운트 토글
   * - 재생 중이면 정지 및 초기화
   * - 정지 상태면 처음부터 재생
   */
  toggleVoiceCount(): void {
    if (this.isActive || this.isMp3Playing) {
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
   * 활성 상태 확인 (재생 중인지 확인)
   */
  isVoiceCountActive(): boolean {
    return this.isActive || this.isMp3Playing;
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
    // HTMLAudioElement 사용 가능 여부 기준
    return typeof Audio !== 'undefined';
  }

  /**
   * 사용자 상호작용 후 초기화 (브라우저 정책 준수)
   */
  async initializeAfterUserInteraction(): Promise<void> { /* no-op */ }

  /**
   * 리소스 정리
   */
  destroy(): void {
    this.stopVoiceCount();
    
    // 오디오 컨텍스트/합성 사용 안 함
    if (this.mp3Audio) {
      try {
        this.mp3Audio.pause();
      } catch {}
      this.mp3Audio.src = '';
      this.mp3Audio = null;
    }
  }
}