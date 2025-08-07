import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PWAService } from '../PWAService';

// Mock service worker registration
const mockServiceWorkerRegistration = {
  installing: null,
  waiting: null,
  active: null,
  scope: 'http://localhost:3000/',
  update: vi.fn().mockResolvedValue(undefined),
  unregister: vi.fn().mockResolvedValue(true),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

// Mock service worker
const mockServiceWorker = {
  state: 'activated',
  scriptURL: 'http://localhost:3000/sw.js',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  postMessage: vi.fn()
};

// Mock navigator.serviceWorker
const mockNavigatorServiceWorker = {
  register: vi.fn().mockResolvedValue(mockServiceWorkerRegistration),
  ready: Promise.resolve(mockServiceWorkerRegistration),
  controller: mockServiceWorker,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  getRegistration: vi.fn().mockResolvedValue(mockServiceWorkerRegistration),
  getRegistrations: vi.fn().mockResolvedValue([mockServiceWorkerRegistration])
};

// Mock beforeinstallprompt event
class MockBeforeInstallPromptEvent extends Event {
  prompt = vi.fn().mockResolvedValue({ outcome: 'accepted' });
  userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
  
  constructor() {
    super('beforeinstallprompt');
  }
}

describe('PWAService', () => {
  let service: PWAService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockNavigatorServiceWorker,
      writable: true,
      configurable: true
    });

    // Mock window.matchMedia for standalone detection
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })),
      writable: true
    });

    service = new PWAService();
  });

  afterEach(() => {
    if (service) {
      service.destroy();
    }
  });

  describe('initialization', () => {
    it('should create PWAService instance', () => {
      expect(service).toBeInstanceOf(PWAService);
      expect(service.isServiceWorkerSupported()).toBe(true);
    });

    it('should detect service worker support', () => {
      expect(service.isServiceWorkerSupported()).toBe(true);
    });

    it('should detect lack of service worker support', () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
        configurable: true
      });

      const newService = new PWAService();
      expect(newService.isServiceWorkerSupported()).toBe(false);
    });

    it('should initialize service worker', async () => {
      const result = await service.initialize('/sw.js');

      expect(result).toBe(true);
      expect(mockNavigatorServiceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/'
      });
    });

    it('should handle service worker registration failure', async () => {
      mockNavigatorServiceWorker.register.mockRejectedValue(new Error('Registration failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.initialize('/sw.js');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Service Worker registration failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should not initialize when service worker is not supported', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
        configurable: true
      });

      const newService = new PWAService();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await newService.initialize('/sw.js');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Service Workers are not supported in this browser');

      consoleSpy.mockRestore();
    });
  });

  describe('installation prompt', () => {
    it('should detect PWA installability', () => {
      expect(service.isInstallable()).toBe(false);

      // Simulate beforeinstallprompt event
      const event = new MockBeforeInstallPromptEvent();
      window.dispatchEvent(event);

      expect(service.isInstallable()).toBe(true);
    });

    it('should show install prompt', async () => {
      // Set up installable state
      const event = new MockBeforeInstallPromptEvent();
      (service as any).deferredPrompt = event;

      const result = await service.showInstallPrompt();

      expect(result).toEqual({ outcome: 'accepted' });
      expect(event.prompt).toHaveBeenCalled();
      expect(service.isInstallable()).toBe(false); // Should be reset after use
    });

    it('should handle install prompt when not available', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await service.showInstallPrompt();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Install prompt is not available');

      consoleSpy.mockRestore();
    });

    it('should handle install prompt errors', async () => {
      const event = new MockBeforeInstallPromptEvent();
      event.prompt.mockRejectedValue(new Error('Prompt failed'));
      (service as any).deferredPrompt = event;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.showInstallPrompt();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error showing install prompt:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('PWA detection', () => {
    it('should detect standalone mode', () => {
      // Mock standalone mode
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn()
        })),
        writable: true
      });

      expect(service.isRunningStandalone()).toBe(true);
    });

    it('should detect non-standalone mode', () => {
      // Mock non-standalone mode
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(() => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn()
        })),
        writable: true
      });

      expect(service.isRunningStandalone()).toBe(false);
    });

    it('should handle matchMedia not supported', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true
      });

      expect(service.isRunningStandalone()).toBe(false);
    });
  });

  describe('service worker updates', () => {
    beforeEach(async () => {
      await service.initialize('/sw.js');
    });

    it('should check for updates', async () => {
      const result = await service.checkForUpdates();

      expect(result).toBe(true);
      expect(mockServiceWorkerRegistration.update).toHaveBeenCalled();
    });

    it('should handle update check failure', async () => {
      mockServiceWorkerRegistration.update.mockRejectedValue(new Error('Update failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.checkForUpdates();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to check for updates:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle update check when not initialized', async () => {
      const uninitializedService = new PWAService();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await uninitializedService.checkForUpdates();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Service Worker is not registered');

      consoleSpy.mockRestore();
    });

    it('should skip waiting service worker', async () => {
      mockServiceWorkerRegistration.waiting = mockServiceWorker;

      await service.skipWaiting();

      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    });

    it('should handle skip waiting when no waiting worker', async () => {
      mockServiceWorkerRegistration.waiting = null;
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await service.skipWaiting();

      expect(consoleSpy).toHaveBeenCalledWith('No waiting service worker found');

      consoleSpy.mockRestore();
    });
  });

  describe('event listeners', () => {
    it('should set up install prompt listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      service.setupInstallPromptListener();

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    });

    it('should set up app installed listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      service.setupAppInstalledListener();

      expect(addEventListenerSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function));
    });

    it('should handle beforeinstallprompt event', () => {
      service.setupInstallPromptListener();

      const event = new MockBeforeInstallPromptEvent();
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(service.isInstallable()).toBe(true);
    });

    it('should handle appinstalled event', () => {
      const mockCallback = vi.fn();
      service.onAppInstalled(mockCallback);
      service.setupAppInstalledListener();

      const event = new Event('appinstalled');
      window.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalled();
      expect(service.isInstallable()).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('should set and call update available callback', async () => {
      const mockCallback = vi.fn();
      service.onUpdateAvailable(mockCallback);

      await service.initialize('/sw.js');

      // Simulate update available
      mockServiceWorkerRegistration.installing = mockServiceWorker;
      const updateFoundEvent = new Event('updatefound');
      mockServiceWorkerRegistration.dispatchEvent(updateFoundEvent);

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should set and call app installed callback', () => {
      const mockCallback = vi.fn();
      service.onAppInstalled(mockCallback);

      service.setupAppInstalledListener();
      const event = new Event('appinstalled');
      window.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should set and call install prompt available callback', () => {
      const mockCallback = vi.fn();
      service.onInstallPromptAvailable(mockCallback);

      service.setupInstallPromptListener();
      const event = new MockBeforeInstallPromptEvent();
      window.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('PWA status', () => {
    beforeEach(async () => {
      await service.initialize('/sw.js');
    });

    it('should return PWA status', () => {
      const status = service.getPWAStatus();

      expect(status).toEqual({
        isServiceWorkerSupported: true,
        isServiceWorkerRegistered: true,
        isInstallable: false,
        isRunningStandalone: true,
        hasUpdate: false
      });
    });

    it('should update status when installable', () => {
      const event = new MockBeforeInstallPromptEvent();
      (service as any).deferredPrompt = event;

      const status = service.getPWAStatus();

      expect(status.isInstallable).toBe(true);
    });

    it('should update status when update available', () => {
      (service as any).hasUpdate = true;

      const status = service.getPWAStatus();

      expect(status.hasUpdate).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should destroy service properly', async () => {
      await service.initialize('/sw.js');
      service.setupInstallPromptListener();
      service.setupAppInstalledListener();

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      service.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function));
    });

    it('should handle destroy when not initialized', () => {
      const uninitializedService = new PWAService();

      expect(() => uninitializedService.destroy()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle service worker registration errors gracefully', async () => {
      mockNavigatorServiceWorker.register.mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.initialize('/sw.js');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle event listener errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock callback that throws
      service.onInstallPromptAvailable(() => {
        throw new Error('Callback error');
      });

      service.setupInstallPromptListener();
      const event = new MockBeforeInstallPromptEvent();
      window.dispatchEvent(event);

      expect(consoleSpy).toHaveBeenCalledWith('Error in install prompt handler:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});