import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTemplate } from '../useTemplate';
import { TemplateProvider } from '../../contexts/TemplateContext';
import type { ReactNode } from 'react';

// Mock StorageService
vi.mock('../../services/StorageService', () => ({
  StorageService: {
    loadTemplates: vi.fn().mockReturnValue([]),
    saveTemplates: vi.fn()
  }
}));

describe('useTemplate', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TemplateProvider>{children}</TemplateProvider>
  );

  it('returns template context when used within provider', () => {
    const { result } = renderHook(() => useTemplate(), { wrapper });

    expect(result.current).toEqual(
      expect.objectContaining({
        state: expect.objectContaining({
          templates: expect.any(Array),
          isLoading: expect.any(Boolean),
          error: expect.any(String)
        }),
        addTemplate: expect.any(Function),
        updateTemplate: expect.any(Function),
        deleteTemplate: expect.any(Function),
        selectTemplate: expect.any(Function)
      })
    );
  });

  it('throws error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTemplate());
    }).toThrow('useTemplate must be used within a TemplateProvider');

    consoleSpy.mockRestore();
  });

  it('provides default templates initially', () => {
    const { result } = renderHook(() => useTemplate(), { wrapper });

    expect(result.current.state.templates).toHaveLength(3);
    expect(result.current.state.templates[0]).toEqual(
      expect.objectContaining({
        id: 'default-30s',
        name: '30초',
        duration: 30,
        isDefault: true
      })
    );
  });

  it('has no error initially', () => {
    const { result } = renderHook(() => useTemplate(), { wrapper });

    expect(result.current.state.error).toBeNull();
  });

  it('is not loading initially', () => {
    const { result } = renderHook(() => useTemplate(), { wrapper });

    expect(result.current.state.isLoading).toBe(false);
  });
});