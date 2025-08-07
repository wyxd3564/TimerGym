import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BackgroundSyncService } from '../BackgroundSyncService';
import type { TimerState } from '../../types';

// Mock IndexedDBService
vi.mock('../IndexedDBService', () => ({
  IndexedDBService: vi.fn().mockImplementation(() => ({
    ready: true,
    saveCurrentState: vi.fn().mockResolvedValue(undefined),
    loadCurrentState: vi.fn().mockResolvedValue(null),
    clearCurrentState: vi.fn().mockResolvedValue(undefined),
    saveBackupState: vi.fn().mockResolvedValue('backup_123'),
    destroy: vi.fn()
  }))
}));

// Mock document visibility API
Object.defineProperty(document, 'hidden', {
  writable: true,
  value: false
});

Object.defineProperty(document, 'visibilityState', {
  writable: true,
  value: 'visible'
});

describe('BackgroundSyncService', () => {
  let service: BackgroundSyncService;
  let mockTimerState: TimerState;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    mockTimerState = {
      duration: 60,
      remainingTime: 30,
      repetitions: 5,
      isRunning: true,
      isPaused: false
    };

    service = new BackgroundSyncService();
  });

  afterEach(() => {
    if (service) {
      service.destroy();
    }
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should create BackgroundSyncService instance', () => {
      expect(service).toBeInstanceOf(BackgroundSyncService);
      expect(service.isInitialized()).toBe(false);
    });

    it('should initialize successfully', async () => {
      await service.initialize();
      
      expect(service.isInitialized()).toBe(true);
    });

    it('should handle initialization failure gracefully', async () => {
      const mockIndexedDBService = (service as any).indexedDBService;
      mockIndexedDBService.ready = false;
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await service.initialize();
      
      expect(service.isInitialized()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize BackgroundSyncService: IndexedDB not ready');
      
      consoleSpy.mockRestore();
    });
  });

  describe('timer state synchronization', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should save timer state', async () => {
      const mockIndexedDBService = (service as any).indexedDBService;
      
      await service.saveTimerState(mockTimerState);
      
      expect(mockIndexedDBService.saveCurrentState).toHaveBeenCalledWith(mockTimerState);
    });

    it('should load timer state', async () => {
      const mockIndexedDBService = (service as any).indexedDBService;
      mockIndexedDBService.loadCurrentState.mockResolvedValue(mockTimerState);
      
      const result = await service.loadTimerState();
      
      expect(result).toEqual(mockTimerState);
      expect(mockIndexedDBService.loadCurrentState).toHaveBeenCalled();
    });

    it('should clear timer state', async () => {
      const mockIndexedDBService = (service as any).indexedDBService;
      
      await service.clearTimerState();
      
      expect(mockIndexedDBService.clearCurrentState).toHaveBeenCalled();
    });

    it('should handle save errors gracefully', async () => {
      const mockIndexedDBService = (service as any).indexedDBService;
      mockIndexedDBService.saveCurrentState.mockRejectedValue(new Error('Save failed'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await service.saveTimerState(mockTimerState);
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save timer state:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle load errors gracefully', async () => {
      const mockIndexedDBService = (service as any).indexedDBService;
      mockIndexedDBService.loadCurrentState.mockRejectedValue(new Error('Load failed'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await service.loadTimerState();
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load timer state:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('background sync', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should start background sync', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      service.startBackgroundSync();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
      expect(service.isBackgroundSyncActive()).toBe(true);
    });

    it('should stop background sync', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      service.startBackgroundSync();
      service.stopBackgroundSync();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
      expect(service.isBackgroundSyncActive()).toBe(false);
    });

    it('should handle visibility change to hidden', async () => {
      const mockCallback = vi.fn();
      service.setOnBackgroundCallback(mockCallback);
      service.startBackgroundSync();
      
      // Simulate page becoming hidden
      Object.defineProperty(document, 'hidden', { value: true });
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      
      // Trigger visibility change event
      const visibilityChangeEvent = new Event('visibilitychange');
      document.dispatchEvent(visibilityChangeEvent);
      
      expect(mockCallback).toHaveBeenCalledWith('background');
    });

    it('should handle visibility change to visible', async () => {
      const mockCallback = vi.fn();
      service.setOnForegroundCallback(mockCallback);
      service.startBackgroundSync();
      
      // First make it hidden
      Object.defineProperty(document, 'hidden', { value: true });
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      
      // Then make it visible
      Object.defineProperty(document, 'hidden', { value: false });
      Object.defineProperty(document, 'visibilityState', { value: 'visible' });
      
      // Trigger visibility change event
      const visibilityChangeEvent = new Event('visibilitychange');
      document.dispatchEvent(visibilityChangeEvent);
      
      expect(mockCallback).toHaveBeenCalledWith('foreground');
    });
  });

  describe('periodic sync', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should start periodic sync', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      service.startPeriodicSync(1000);
      
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      expect(service.isPeriodicSyncActive()).toBe(true);
    });

    it('should stop periodic sync', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      service.startPeriodicSync(1000);
      service.stopPeriodicSync();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(service.isPeriodicSyncActive()).toBe(false);
    });

    it('should execute periodic sync callback', async () => {
      const mockCallback = vi.fn();
      service.setOnPeriodicSyncCallback(mockCallback);
      
      service.startPeriodicSync(1000);
      
      // Fast-forward time to trigger interval
      vi.advanceTimersByTime(1000);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should use default interval when none provided', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      service.startPeriodicSync();
      
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000); // Default 30 seconds
    });
  });

  describe('backup management', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should create backup', async () => {
      const mockIndexedDBService = (service as any).indexedDBService;
      mockIndexedDBService.saveBackupState.mockResolvedValue('backup_123');
      
      const backupId = await service.createBackup(mockTimerState);
      
      expect(backupId).toBe('backup_123');
      expect(mockIndexedDBService.saveBackupState).toHaveBeenCalledWith(mockTimerState);
    });

    it('should handle backup creation errors', async () => {
      const mockIndexedDBService = (service as any).indexedDBService;
      mockIndexedDBService.saveBackupState.mockRejectedValue(new Error('Backup failed'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const backupId = await service.createBackup(mockTimerState);
      
      expect(backupId).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create backup:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('sync status', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return sync status', () => {
      service.startBackgroundSync();
      service.startPeriodicSync(5000);
      
      const status = service.getSyncStatus();
      
      expect(status).toEqual({
        initialized: true,
        backgroundSyncActive: true,
        periodicSyncActive: true,
        lastSyncTime: expect.any(Number),
        syncInterval: 5000
      });
    });

    it('should update last sync time', () => {
      const initialStatus = service.getSyncStatus();
      const initialTime = initialStatus.lastSyncTime;
      
      // Wait a bit and update
      vi.advanceTimersByTime(1000);
      service.updateLastSyncTime();
      
      const updatedStatus = service.getSyncStatus();
      expect(updatedStatus.lastSyncTime).toBeGreaterThan(initialTime);
    });
  });

  describe('callbacks', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should set and call background callback', () => {
      const mockCallback = vi.fn();
      service.setOnBackgroundCallback(mockCallback);
      
      // Trigger background callback internally
      (service as any).handleVisibilityChange();
      
      // Since document.hidden is false by default, this won't trigger background
      // Let's set it to hidden first
      Object.defineProperty(document, 'hidden', { value: true });
      (service as any).handleVisibilityChange();
      
      expect(mockCallback).toHaveBeenCalledWith('background');
    });

    it('should set and call foreground callback', () => {
      const mockCallback = vi.fn();
      service.setOnForegroundCallback(mockCallback);
      
      // Set to hidden first, then visible
      Object.defineProperty(document, 'hidden', { value: true });
      (service as any).handleVisibilityChange();
      
      Object.defineProperty(document, 'hidden', { value: false });
      (service as any).handleVisibilityChange();
      
      expect(mockCallback).toHaveBeenCalledWith('foreground');
    });

    it('should set and call periodic sync callback', () => {
      const mockCallback = vi.fn();
      service.setOnPeriodicSyncCallback(mockCallback);
      
      service.startPeriodicSync(1000);
      vi.advanceTimersByTime(1000);
      
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should destroy service properly', async () => {
      await service.initialize();
      service.startBackgroundSync();
      service.startPeriodicSync(1000);
      
      const mockIndexedDBService = (service as any).indexedDBService;
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      service.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(mockIndexedDBService.destroy).toHaveBeenCalled();
      expect(service.isInitialized()).toBe(false);
      expect(service.isBackgroundSyncActive()).toBe(false);
      expect(service.isPeriodicSyncActive()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle operations when not initialized', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await service.saveTimerState(mockTimerState);
      
      expect(consoleSpy).toHaveBeenCalledWith('BackgroundSyncService is not initialized');
      
      consoleSpy.mockRestore();
    });

    it('should handle visibility change errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock callback that throws
      service.setOnBackgroundCallback(() => {
        throw new Error('Callback error');
      });
      
      service.startBackgroundSync();
      Object.defineProperty(document, 'hidden', { value: true });
      (service as any).handleVisibilityChange();
      
      expect(consoleSpy).toHaveBeenCalledWith('Error in visibility change handler:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle periodic sync errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock callback that throws
      service.setOnPeriodicSyncCallback(() => {
        throw new Error('Periodic sync error');
      });
      
      service.startPeriodicSync(1000);
      vi.advanceTimersByTime(1000);
      
      expect(consoleSpy).toHaveBeenCalledWith('Error in periodic sync:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});