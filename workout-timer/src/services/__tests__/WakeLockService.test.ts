// Wake Lock Service Tests
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WakeLockService } from '../WakeLockService';

// Mock Wake Lock API
const mockWakeLockSentinel = {
  released: false,
  release: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const mockWakeLock = {
  request: vi.fn(),
};

describe('WakeLockService', () => {
  let service: WakeLockService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset Wake Lock API mock
    mockWakeLockSentinel.released = false;
    mockWakeLock.request.mockResolvedValue(mockWakeLockSentinel);
    
    // Mock navigator.wakeLock
    Object.defineProperty(navigator, 'wakeLock', {
      value: mockWakeLock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    if (service) {
      service.destroy();
    }
  });

  it('should create WakeLockService instance', () => {
    service = new WakeLockService();
    expect(service).toBeInstanceOf(WakeLockService);
    expect(service.supported).toBe(true);
  });

  it('should detect unsupported Wake Lock API', () => {
    // Remove Wake Lock API
    Object.defineProperty(navigator, 'wakeLock', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    service = new WakeLockService();
    
    expect(service.supported).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Wake Lock API is not supported in this browser');
    
    consoleSpy.mockRestore();
  });

  it('should enable Wake Lock successfully', async () => {
    service = new WakeLockService();
    
    const result = await service.enable();
    
    expect(result).toBe(true);
    expect(mockWakeLock.request).toHaveBeenCalledWith('screen');
    expect(service.active).toBe(true);
    expect(mockWakeLockSentinel.addEventListener).toHaveBeenCalledWith('release', expect.any(Function));
  });

  it('should handle Wake Lock enable failure', async () => {
    service = new WakeLockService();
    
    const error = new Error('Wake Lock failed');
    mockWakeLock.request.mockRejectedValue(error);
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const result = await service.enable();
    
    expect(result).toBe(false);
    expect(service.active).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to activate Wake Lock:', error);
    
    consoleSpy.mockRestore();
  });

  it('should not enable Wake Lock if unsupported', async () => {
    // Remove Wake Lock API
    Object.defineProperty(navigator, 'wakeLock', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    service = new WakeLockService();
    const result = await service.enable();
    
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Wake Lock is not supported');
    
    consoleSpy.mockRestore();
  });

  it('should handle already active Wake Lock', async () => {
    service = new WakeLockService();
    
    // Enable first time
    await service.enable();
    
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Try to enable again
    const result = await service.enable();
    
    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith('Wake Lock is already active');
    expect(mockWakeLock.request).toHaveBeenCalledTimes(1); // Should not call again
    
    consoleSpy.mockRestore();
  });

  it('should disable Wake Lock successfully', async () => {
    service = new WakeLockService();
    
    // Enable first
    await service.enable();
    
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Then disable
    await service.disable();
    
    expect(mockWakeLockSentinel.release).toHaveBeenCalled();
    expect(service.active).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Wake Lock deactivated successfully');
    
    consoleSpy.mockRestore();
  });

  it('should handle disable when not active', async () => {
    service = new WakeLockService();
    
    // Try to disable without enabling
    await service.disable();
    
    expect(mockWakeLockSentinel.release).not.toHaveBeenCalled();
  });

  it('should toggle Wake Lock state', async () => {
    service = new WakeLockService();
    
    // Toggle on
    let result = await service.toggle();
    expect(result).toBe(true);
    expect(service.active).toBe(true);
    
    // Toggle off
    result = await service.toggle();
    expect(result).toBe(false);
    expect(service.active).toBe(false);
  });

  it('should handle timer state changes', async () => {
    service = new WakeLockService();
    
    // Timer starts - should enable Wake Lock
    await service.handleTimerStateChange(true, true);
    expect(service.active).toBe(true);
    
    // Timer stops - should disable Wake Lock
    await service.handleTimerStateChange(false, true);
    expect(service.active).toBe(false);
  });

  it('should not handle timer state changes when auto Wake Lock is disabled', async () => {
    service = new WakeLockService();
    
    // Timer starts but auto Wake Lock is disabled
    await service.handleTimerStateChange(true, false);
    expect(service.active).toBe(false);
  });

  it('should setup visibility handler', () => {
    service = new WakeLockService();
    
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    
    service.setupVisibilityHandler();
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    
    addEventListenerSpy.mockRestore();
  });

  it('should provide debug info', () => {
    service = new WakeLockService();
    
    const debugInfo = service.getDebugInfo();
    
    expect(debugInfo).toEqual({
      supported: true,
      enabled: false,
      active: false,
      released: null,
    });
  });

  it('should handle Wake Lock release event', async () => {
    service = new WakeLockService();
    
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Enable Wake Lock
    await service.enable();
    
    // Simulate release event
    const releaseHandler = mockWakeLockSentinel.addEventListener.mock.calls[0][1];
    releaseHandler();
    
    expect(consoleSpy).toHaveBeenCalledWith('Wake Lock was released');
    
    consoleSpy.mockRestore();
  });

  it('should destroy service properly', async () => {
    service = new WakeLockService();
    
    // Enable Wake Lock first
    await service.enable();
    
    // Destroy service
    await service.destroy();
    
    expect(mockWakeLockSentinel.release).toHaveBeenCalled();
  });
});