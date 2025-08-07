// Timer Service Class - setInterval 기반 타이머 로직
import type { TimerCallbacks } from '../types';
import { TIME_CONSTANTS } from '../types';

export class Timer {
  private intervalId: number | null = null;
  private callbacks: TimerCallbacks;
  private remainingTime: number = 0; // 밀리초 단위
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  constructor(callbacks: TimerCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * 타이머를 시작합니다
   * @param duration 타이머 지속 시간 (초)
   */
  start(duration: number): void {
    // 이미 실행 중이면 중지하고 새로 시작
    if (this.intervalId) {
      this.stop();
    }

    this.remainingTime = duration * 1000; // 초를 밀리초로 변환

    // 0 이하의 시간이면 즉시 완료 처리
    if (duration <= 0) {
      this.handleComplete();
      return;
    }

    this.isRunning = true;
    this.isPaused = false;

    // 즉시 첫 번째 틱 실행
    this.callbacks.onTick(this.remainingTime);

    // 100ms마다 틱 실행 (더 정확한 밀리초 표시)
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, 100);
  }

  /**
   * 타이머를 일시정지합니다
   */
  pause(): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    this.isPaused = true;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 일시정지된 타이머를 재개합니다
   */
  resume(): void {
    if (!this.isPaused || this.remainingTime <= 0) {
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    
    // 100ms마다 틱 실행 (start()와 동일한 간격)
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, 100);
  }

  /**
   * 타이머를 초기화합니다
   */
  reset(): void {
    this.stop();
    this.remainingTime = 0;
    this.isRunning = false;
    this.isPaused = false;
  }

  /**
   * 타이머를 완전히 정지합니다 (내부 메서드)
   */
  private stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.isPaused = false;
  }

  /**
   * 100ms마다 실행되는 틱 메서드
   */
  private tick(): void {
    // 시간 감소 (100ms씩)
    this.remainingTime -= 100;

    // 카운트다운 알림 (3, 2, 1초) - 시간 감소 후에 체크
    const remainingSeconds = Math.ceil(this.remainingTime / 1000);
    if (remainingSeconds <= TIME_CONSTANTS.COUNTDOWN_THRESHOLD && remainingSeconds > 0 && this.remainingTime % 1000 < 100) {
      this.callbacks.onCountdown(remainingSeconds);
    }

    // 틱 콜백 실행
    this.callbacks.onTick(this.remainingTime);

    // 시간이 0이 되면 완료 처리
    if (this.remainingTime <= 0) {
      this.handleComplete();
    }
  }

  /**
   * 타이머 완료 처리
   */
  private handleComplete(): void {
    this.stop();
    this.callbacks.onComplete();
  }

  /**
   * 타이머 리소스 정리
   */
  destroy(): void {
    this.stop();
    this.remainingTime = 0;
  }

  /**
   * 현재 타이머 상태 반환
   */
  getState() {
    return {
      remainingTime: this.remainingTime,
      isRunning: this.isRunning,
      isPaused: this.isPaused
    };
  }

  /**
   * 타이머가 실행 중인지 확인
   */
  get running(): boolean {
    return this.isRunning && !this.isPaused;
  }

  /**
   * 타이머가 일시정지 상태인지 확인
   */
  get paused(): boolean {
    return this.isPaused;
  }
}