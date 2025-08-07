// IndexedDB Service - 타이머 상태 영구 저장
import type { TimerState } from '../types';

export interface StoredTimerState extends TimerState {
  id: string;
  timestamp: number;
  version: number;
}

export class IndexedDBService {
  private static readonly DB_NAME = 'WorkoutTimerDB';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'timerStates';
  private static readonly CURRENT_STATE_ID = 'current';
  
  private db: IDBDatabase | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeDB();
  }

  /**
   * IndexedDB 초기화
   */
  private async initializeDB(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB is not supported in this browser');
      return;
    }

    try {
      this.db = await this.openDatabase();
      this.isInitialized = true;
      console.log('IndexedDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  /**
   * 데이터베이스 열기
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IndexedDBService.DB_NAME, IndexedDBService.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 타이머 상태 저장소 생성
        if (!db.objectStoreNames.contains(IndexedDBService.STORE_NAME)) {
          const store = db.createObjectStore(IndexedDBService.STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * 현재 타이머 상태 저장
   */
  async saveCurrentState(timerState: TimerState): Promise<void> {
    if (!this.isInitialized || !this.db) {
      console.warn('IndexedDB is not initialized');
      return;
    }

    const storedState: StoredTimerState = {
      ...timerState,
      id: IndexedDBService.CURRENT_STATE_ID,
      timestamp: Date.now(),
      version: IndexedDBService.DB_VERSION
    };

    try {
      await this.putData(storedState);
    } catch (error) {
      console.error('Failed to save timer state to IndexedDB:', error);
    }
  }

  /**
   * 현재 타이머 상태 로드
   */
  async loadCurrentState(): Promise<TimerState | null> {
    if (!this.isInitialized || !this.db) {
      console.warn('IndexedDB is not initialized');
      return null;
    }

    try {
      const storedState = await this.getData(IndexedDBService.CURRENT_STATE_ID);
      
      if (storedState) {
        // 버전 호환성 확인
        if (storedState.version !== IndexedDBService.DB_VERSION) {
          console.warn('Stored state version mismatch, ignoring stored state');
          await this.clearCurrentState();
          return null;
        }

        // StoredTimerState에서 TimerState로 변환
        const { id, timestamp, version, ...timerState } = storedState;
        return timerState;
      }

      return null;
    } catch (error) {
      console.error('Failed to load timer state from IndexedDB:', error);
      return null;
    }
  }

  /**
   * 현재 타이머 상태 삭제
   */
  async clearCurrentState(): Promise<void> {
    if (!this.isInitialized || !this.db) {
      return;
    }

    try {
      await this.deleteData(IndexedDBService.CURRENT_STATE_ID);
    } catch (error) {
      console.error('Failed to clear timer state from IndexedDB:', error);
    }
  }

  /**
   * 데이터 저장 (내부 메서드)
   */
  private putData(data: StoredTimerState): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([IndexedDBService.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(IndexedDBService.STORE_NAME);
      const request = store.put(data);

      request.onerror = () => {
        reject(new Error('Failed to save data'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * 데이터 로드 (내부 메서드)
   */
  private getData(id: string): Promise<StoredTimerState | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([IndexedDBService.STORE_NAME], 'readonly');
      const store = transaction.objectStore(IndexedDBService.STORE_NAME);
      const request = store.get(id);

      request.onerror = () => {
        reject(new Error('Failed to load data'));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  /**
   * 데이터 삭제 (내부 메서드)
   */
  private deleteData(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([IndexedDBService.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(IndexedDBService.STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => {
        reject(new Error('Failed to delete data'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * 백업 상태 저장 (히스토리 관리용)
   */
  async saveBackupState(timerState: TimerState, backupId?: string): Promise<string> {
    if (!this.isInitialized || !this.db) {
      throw new Error('IndexedDB is not initialized');
    }

    const id = backupId || `backup_${Date.now()}`;
    const storedState: StoredTimerState = {
      ...timerState,
      id,
      timestamp: Date.now(),
      version: IndexedDBService.DB_VERSION
    };

    await this.putData(storedState);
    return id;
  }

  /**
   * 백업 상태 로드
   */
  async loadBackupState(backupId: string): Promise<TimerState | null> {
    if (!this.isInitialized || !this.db) {
      return null;
    }

    try {
      const storedState = await this.getData(backupId);
      
      if (storedState) {
        const { id, timestamp, version, ...timerState } = storedState;
        return timerState;
      }

      return null;
    } catch (error) {
      console.error('Failed to load backup state:', error);
      return null;
    }
  }

  /**
   * 모든 백업 상태 목록 가져오기
   */
  async getBackupList(): Promise<Array<{ id: string; timestamp: number }>> {
    if (!this.isInitialized || !this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([IndexedDBService.STORE_NAME], 'readonly');
      const store = transaction.objectStore(IndexedDBService.STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error('Failed to get backup list'));
      };

      request.onsuccess = () => {
        const results = request.result
          .filter((item: StoredTimerState) => item.id.startsWith('backup_'))
          .map((item: StoredTimerState) => ({
            id: item.id,
            timestamp: item.timestamp
          }))
          .sort((a, b) => b.timestamp - a.timestamp); // 최신순 정렬

        resolve(results);
      };
    });
  }

  /**
   * 오래된 백업 정리 (최대 10개 유지)
   */
  async cleanupOldBackups(maxBackups: number = 10): Promise<void> {
    if (!this.isInitialized || !this.db) {
      return;
    }

    try {
      const backupList = await this.getBackupList();
      
      if (backupList.length > maxBackups) {
        const toDelete = backupList.slice(maxBackups);
        
        for (const backup of toDelete) {
          await this.deleteData(backup.id);
        }
        
        console.log(`Cleaned up ${toDelete.length} old backups`);
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  /**
   * 데이터베이스 상태 확인
   */
  get ready(): boolean {
    return this.isInitialized && this.db !== null;
  }

  /**
   * 서비스 정리
   */
  destroy(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
  }
}