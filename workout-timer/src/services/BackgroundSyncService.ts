// Background Sync Service - 백그라운드 타이머 상태 동기화
import type { TimerState } from '../types';
import { IndexedDBService } from './IndexedDBService';

export interface BackgroundTimerState {
  duration: number;
  remainingTime: number;
  repetitions: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number; // 타이머 시작 시점의 timestamp
  lastUpdateTime: number; // 마지막 업데이트 시점의 timestamp
}

export class BackgroundSyncService {
  private static readonly STORAGE_KEY = 'workout-timer-background-state';
  private static readonly SYNC_INTERVAL = 1000; // 1초마다 동기화
  private syncIntervalId: number | null = null;
  private isVisible: boolean = true;
  private indexedDBService: IndexedDBService;

  constructor() {
    this.indexedDBService = new IndexedDBService();
    this.setupVisibilityHandlers();
  }

  /**
   * 페이지 가시성 변경 이벤트 핸들러 설정
   */
  private setupVisibilityHandlers(): void {
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      
      if (this.isVisible) {
        // 포그라운드로 복귀 시 상태 복원
        this.handleForegroundReturn();
      } else {
        // 백그라운드로 전환 시 상태 저장
        this.handleBackgroundTransition();
      }
    });

    // 페이지 언로드 시에도 상태 저장
    window.addEventListener('beforeunload', () => {
      this.handleBackgroundTransition();
    });
  }

  /**
   * 백그라운드 전환 시 처리
   */
  private async handleBackgroundTransition(): Promise<void> {
    // 현재 실행 중인 타이머가 있다면 상태 저장
    const currentState = this.getCurrentTimerState();
    if (currentState && currentState.isRunning && !currentState.isPaused) {
      await this.saveBackgroundState(currentState);
      this.startBackgroundSync();
    }
  }

  /**
   * 포그라운드 복귀 시 처리
   */
  private async handleForegroundReturn(): Promise<void> {
    this.stopBackgroundSync();
    
    // 저장된 백그라운드 상태가 있다면 복원
    const backgroundState = await this.getBackgroundState();
    if (backgroundState) {
      const restoredState = this.calculateRestoredState(backgroundState);
      await this.clearBackgroundState();
      
      // 상태 복원 이벤트 발생
      this.dispatchStateRestoreEvent(restoredState);
    }
  }

  /**
   * 현재 타이머 상태를 가져오는 함수 (외부에서 설정)
   */
  private getCurrentTimerState(): TimerState | null {
    // TimerContext에서 현재 상태를 가져오는 콜백
    // 실제 구현에서는 Context를 통해 상태를 가져옴
    const event = new CustomEvent('get-timer-state');
    document.dispatchEvent(event);
    return (event as any).detail || null;
  }

  /**
   * 백그라운드 상태를 저장 (IndexedDB 우선, localStorage 백업)
   */
  private async saveBackgroundState(timerState: TimerState): Promise<void> {
    const backgroundState: BackgroundTimerState = {
      duration: timerState.duration,
      remainingTime: timerState.remainingTime,
      repetitions: timerState.repetitions,
      isRunning: timerState.isRunning,
      isPaused: timerState.isPaused,
      startTime: Date.now() - (timerState.duration - timerState.remainingTime) * 1000,
      lastUpdateTime: Date.now()
    };

    // IndexedDB에 저장 시도
    try {
      if (this.indexedDBService.ready) {
        await this.indexedDBService.saveCurrentState(timerState);
      }
    } catch (error) {
      console.error('Failed to save to IndexedDB:', error);
    }

    // localStorage에 백업 저장
    try {
      localStorage.setItem(
        BackgroundSyncService.STORAGE_KEY,
        JSON.stringify(backgroundState)
      );
    } catch (error) {
      console.error('Failed to save background timer state to localStorage:', error);
    }
  }

  /**
   * 백그라운드 상태 가져오기 (IndexedDB 우선, localStorage 백업)
   */
  private async getBackgroundState(): Promise<BackgroundTimerState | null> {
    // IndexedDB에서 먼저 시도
    try {
      if (this.indexedDBService.ready) {
        const timerState = await this.indexedDBService.loadCurrentState();
        if (timerState) {
          // TimerState를 BackgroundTimerState로 변환
          return {
            ...timerState,
            startTime: Date.now() - (timerState.duration - timerState.remainingTime) * 1000,
            lastUpdateTime: Date.now()
          };
        }
      }
    } catch (error) {
      console.error('Failed to load from IndexedDB:', error);
    }

    // localStorage에서 백업 로드
    try {
      const stored = localStorage.getItem(BackgroundSyncService.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load background timer state from localStorage:', error);
      return null;
    }
  }

  /**
   * 백그라운드 상태 삭제
   */
  private async clearBackgroundState(): Promise<void> {
    // IndexedDB에서 삭제
    try {
      if (this.indexedDBService.ready) {
        await this.indexedDBService.clearCurrentState();
      }
    } catch (error) {
      console.error('Failed to clear IndexedDB state:', error);
    }

    // localStorage에서 삭제
    try {
      localStorage.removeItem(BackgroundSyncService.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear background timer state from localStorage:', error);
    }
  }

  /**
   * 백그라운드에서 경과된 시간을 계산하여 상태 복원
   */
  private calculateRestoredState(backgroundState: BackgroundTimerState): TimerState {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - backgroundState.lastUpdateTime) / 1000);
    
    let remainingTime = backgroundState.remainingTime - elapsedSeconds;
    let repetitions = backgroundState.repetitions;
    let isRunning = backgroundState.isRunning;
    let isPaused = backgroundState.isPaused;

    // 시간이 0 이하로 떨어졌다면 완료 처리
    if (remainingTime <= 0 && isRunning && !isPaused) {
      remainingTime = backgroundState.duration;
      repetitions += 1;
      isRunning = false;
      isPaused = false;
    }

    return {
      duration: backgroundState.duration,
      remainingTime: Math.max(0, remainingTime),
      repetitions,
      isRunning,
      isPaused
    };
  }

  /**
   * 백그라운드 동기화 시작
   */
  private startBackgroundSync(): void {
    if (this.syncIntervalId) {
      return;
    }

    this.syncIntervalId = window.setInterval(async () => {
      const backgroundState = await this.getBackgroundState();
      if (backgroundState && backgroundState.isRunning && !backgroundState.isPaused) {
        // 상태 업데이트
        backgroundState.lastUpdateTime = Date.now();
        await this.saveBackgroundState({
          duration: backgroundState.duration,
          remainingTime: backgroundState.remainingTime,
          repetitions: backgroundState.repetitions,
          isRunning: backgroundState.isRunning,
          isPaused: backgroundState.isPaused
        });
      }
    }, BackgroundSyncService.SYNC_INTERVAL);
  }

  /**
   * 백그라운드 동기화 중지
   */
  private stopBackgroundSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  /**
   * 상태 복원 이벤트 발생
   */
  private dispatchStateRestoreEvent(restoredState: TimerState): void {
    const event = new CustomEvent('restore-timer-state', {
      detail: restoredState
    });
    document.dispatchEvent(event);
  }

  /**
   * 서비스 정리
   */
  async destroy(): Promise<void> {
    this.stopBackgroundSync();
    await this.clearBackgroundState();
    
    if (this.indexedDBService) {
      this.indexedDBService.destroy();
    }
    
    document.removeEventListener('visibilitychange', this.handleForegroundReturn);
    window.removeEventListener('beforeunload', this.handleBackgroundTransition);
  }

  /**
   * 현재 백그라운드 상태 확인 (디버깅용)
   */
  async getDebugInfo(): Promise<BackgroundTimerState | null> {
    return await this.getBackgroundState();
  }
}