// IndexedDB Service Tests
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IndexedDBService } from '../IndexedDBService';
import type { TimerState } from '../../types';

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

const mockIDBDatabase = {
  close: vi.fn(),
  createObjectStore: vi.fn(),
  transaction: vi.fn(),
  objectStoreNames: {
    contains: vi.fn(),
  },
};

const mockIDBTransaction = {
  objectStore: vi.fn(),
};

const mockIDBObjectStore = {
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
  createIndex: vi.fn(),
};

const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null as any,
  onerror: null as any,
};

// Setup global mocks
Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});

describe('IndexedDBService', () => {
  let service: IndexedDBService;
  let mockTimerState: TimerState;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockTimerState = {
      duration: 60,
      remainingTime: 30,
      repetitions: 5,
      isRunning: true,
      isPaused: false,
    };

    // Setup mock implementations
    mockIndexedDB.open.mockReturnValue(mockIDBRequest);
    mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
    mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
    mockIDBObjectStore.put.mockReturnValue(mockIDBRequest);
    mockIDBObjectStore.get.mockReturnValue(mockIDBRequest);
    mockIDBObjectStore.delete.mockReturnValue(mockIDBRequest);
    mockIDBObjectStore.getAll.mockReturnValue(mockIDBRequest);
    mockIDBDatabase.objectStoreNames.contains.mockReturnValue(false);
    mockIDBDatabase.createObjectStore.mockReturnValue(mockIDBObjectStore);
  });

  afterEach(() => {
    if (service) {
      service.destroy();
    }
  });

  it('should create IndexedDBService instance', () => {
    service = new IndexedDBService();
    expect(service).toBeInstanceOf(IndexedDBService);
  });

  it('should handle IndexedDB not supported', () => {
    // Mock IndexedDB as not supported
    Object.defineProperty(window, 'indexedDB', {
      value: undefined,
      writable: true,
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    service = new IndexedDBService();
    
    // Wait for initialization
    setTimeout(() => {
      expect(consoleSpy).toHaveBeenCalledWith('IndexedDB is not supported in this browser');
      expect(service.ready).toBe(false);
    }, 0);

    consoleSpy.mockRestore();
  });

  it('should initialize database successfully', async () => {
    service = new IndexedDBService();

    // Simulate successful database opening
    setTimeout(() => {
      mockIDBRequest.result = mockIDBDatabase;
      if (mockIDBRequest.onsuccess) {
        mockIDBRequest.onsuccess();
      }
    }, 0);

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(mockIndexedDB.open).toHaveBeenCalledWith('WorkoutTimerDB', 1);
  });

  it('should handle database initialization error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    service = new IndexedDBService();

    // Simulate database opening error
    setTimeout(() => {
      if (mockIDBRequest.onerror) {
        mockIDBRequest.onerror();
      }
    }, 0);

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(service.ready).toBe(false);
    
    consoleSpy.mockRestore();
  });

  it('should save and load current state', async () => {
    service = new IndexedDBService();

    // Mock successful initialization
    (service as any).isInitialized = true;
    (service as any).db = mockIDBDatabase;

    // Test save
    await service.saveCurrentState(mockTimerState);
    expect(mockIDBDatabase.transaction).toHaveBeenCalledWith(['timerStates'], 'readwrite');

    // Test load
    mockIDBRequest.result = {
      id: 'current',
      ...mockTimerState,
      timestamp: Date.now(),
      version: 1,
    };

    const loadedState = await service.loadCurrentState();
    expect(mockIDBDatabase.transaction).toHaveBeenCalledWith(['timerStates'], 'readonly');
  });

  it('should clear current state', async () => {
    service = new IndexedDBService();

    // Mock successful initialization
    (service as any).isInitialized = true;
    (service as any).db = mockIDBDatabase;

    await service.clearCurrentState();
    expect(mockIDBDatabase.transaction).toHaveBeenCalledWith(['timerStates'], 'readwrite');
  });

  it('should handle version mismatch', async () => {
    service = new IndexedDBService();

    // Mock successful initialization
    (service as any).isInitialized = true;
    (service as any).db = mockIDBDatabase;

    // Mock stored state with different version
    mockIDBRequest.result = {
      id: 'current',
      ...mockTimerState,
      timestamp: Date.now(),
      version: 999, // Different version
    };

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const loadedState = await service.loadCurrentState();
    
    expect(consoleSpy).toHaveBeenCalledWith('Stored state version mismatch, ignoring stored state');
    expect(loadedState).toBeNull();
    
    consoleSpy.mockRestore();
  });

  it('should manage backup states', async () => {
    service = new IndexedDBService();

    // Mock successful initialization
    (service as any).isInitialized = true;
    (service as any).db = mockIDBDatabase;

    // Test save backup
    const backupId = await service.saveBackupState(mockTimerState);
    expect(backupId).toMatch(/^backup_\d+$/);

    // Test load backup
    mockIDBRequest.result = {
      id: backupId,
      ...mockTimerState,
      timestamp: Date.now(),
      version: 1,
    };

    const loadedBackup = await service.loadBackupState(backupId);
    expect(loadedBackup).toEqual(mockTimerState);
  });

  it('should get backup list', async () => {
    service = new IndexedDBService();

    // Mock successful initialization
    (service as any).isInitialized = true;
    (service as any).db = mockIDBDatabase;

    const mockBackups = [
      { id: 'backup_1', timestamp: 1000 },
      { id: 'backup_2', timestamp: 2000 },
      { id: 'current', timestamp: 1500 }, // Should be filtered out
    ];

    mockIDBRequest.result = mockBackups;

    const backupList = await service.getBackupList();
    
    // Should only include backup items, sorted by timestamp descending
    expect(backupList).toEqual([
      { id: 'backup_2', timestamp: 2000 },
      { id: 'backup_1', timestamp: 1000 },
    ]);
  });

  it('should cleanup old backups', async () => {
    service = new IndexedDBService();

    // Mock successful initialization
    (service as any).isInitialized = true;
    (service as any).db = mockIDBDatabase;

    // Mock many backups
    const mockBackups = Array.from({ length: 15 }, (_, i) => ({
      id: `backup_${i}`,
      timestamp: i * 1000,
    }));

    mockIDBRequest.result = mockBackups;

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    await service.cleanupOldBackups(10);
    
    expect(consoleSpy).toHaveBeenCalledWith('Cleaned up 5 old backups');
    
    consoleSpy.mockRestore();
  });

  it('should handle service destruction', () => {
    service = new IndexedDBService();

    // Mock successful initialization
    (service as any).isInitialized = true;
    (service as any).db = mockIDBDatabase;

    service.destroy();

    expect(mockIDBDatabase.close).toHaveBeenCalled();
    expect(service.ready).toBe(false);
  });
});