import { render, screen, act, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { vi } from 'vitest';
import { TemplateProvider, TemplateContext } from '../TemplateContext';
import { StorageService } from '../../services/StorageService';
import type { Template } from '../../types';

// Mock StorageService
vi.mock('../../services/StorageService');
const mockStorageService = StorageService as any;

// Test component to access context
const TestComponent = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    return <div>No context</div>;
  }

  const { state, addTemplate, updateTemplate, deleteTemplate, selectTemplate } = context;

  return (
    <div>
      <div data-testid="loading">{state.isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="error">{state.error || 'no-error'}</div>
      <div data-testid="template-count">{state.templates.length}</div>
      <div data-testid="templates">
        {state.templates.map(template => (
          <div key={template.id} data-testid={`template-${template.id}`}>
            {template.name} - {template.duration}s - {template.isDefault ? 'default' : 'custom'}
          </div>
        ))}
      </div>
      <button 
        data-testid="add-template" 
        onClick={() => addTemplate('Test Template', 120)}
      >
        Add Template
      </button>
      <button 
        data-testid="update-template" 
        onClick={() => updateTemplate('test-id', { name: 'Updated Template' })}
      >
        Update Template
      </button>
      <button 
        data-testid="delete-template" 
        onClick={() => deleteTemplate('test-id')}
      >
        Delete Template
      </button>
      <button 
        data-testid="select-template" 
        onClick={() => selectTemplate(state.templates[0])}
      >
        Select Template
      </button>
    </div>
  );
};

describe('TemplateContext', () => {
  const mockCustomTemplates: Template[] = [
    {
      id: 'custom-1',
      name: 'Custom 1',
      duration: 90,
      isDefault: false,
      createdAt: new Date('2023-01-01')
    },
    {
      id: 'custom-2',
      name: 'Custom 2',
      duration: 150,
      isDefault: false,
      createdAt: new Date('2023-01-02')
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorageService.loadTemplates = vi.fn().mockReturnValue([]);
    mockStorageService.saveTemplates = vi.fn().mockImplementation(() => {});
  });

  it('should provide context value', () => {
    render(
      <TemplateProvider>
        <TestComponent />
      </TemplateProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('should load default templates on initialization', async () => {
    render(
      <TemplateProvider>
        <TestComponent />
      </TemplateProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('template-count')).toHaveTextContent('3');
    });

    // Check default templates are loaded
    expect(screen.getByTestId('template-default-30s')).toHaveTextContent('30초 - 30s - default');
    expect(screen.getByTestId('template-default-1m')).toHaveTextContent('1분 - 60s - default');
    expect(screen.getByTestId('template-default-3m')).toHaveTextContent('3분 - 180s - default');
  });

  it('should load custom templates from storage', async () => {
    mockStorageService.loadTemplates = vi.fn().mockReturnValue(mockCustomTemplates);

    render(
      <TemplateProvider>
        <TestComponent />
      </TemplateProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('template-count')).toHaveTextContent('5');
    });

    // Check custom templates are loaded
    expect(screen.getByTestId('template-custom-1')).toHaveTextContent('Custom 1 - 90s - custom');
    expect(screen.getByTestId('template-custom-2')).toHaveTextContent('Custom 2 - 150s - custom');
  });

  it('should add new template', async () => {
    render(
      <TemplateProvider>
        <TestComponent />
      </TemplateProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('template-count')).toHaveTextContent('3');
    });

    act(() => {
      screen.getByTestId('add-template').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('template-count')).toHaveTextContent('4');
    });

    expect(mockStorageService.saveTemplates).toHaveBeenCalled();
  });

  it('should not add template with empty name', async () => {
    const TestComponentWithEmptyName = () => {
      const context = useContext(TemplateContext);
      if (!context) return <div>No context</div>;

      const { state, addTemplate } = context;

      return (
        <div>
          <div data-testid="error">{state.error || 'no-error'}</div>
          <button 
            data-testid="add-empty-template" 
            onClick={() => addTemplate('', 120)}
          >
            Add Empty Template
          </button>
        </div>
      );
    };

    render(
      <TemplateProvider>
        <TestComponentWithEmptyName />
      </TemplateProvider>
    );

    act(() => {
      screen.getByTestId('add-empty-template').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('템플릿 이름을 입력해주세요.');
    });
  });

  it('should not add template with duplicate name', async () => {
    const TestComponentWithDuplicate = () => {
      const context = useContext(TemplateContext);
      if (!context) return <div>No context</div>;

      const { state, addTemplate } = context;

      return (
        <div>
          <div data-testid="error">{state.error || 'no-error'}</div>
          <button 
            data-testid="add-duplicate-template" 
            onClick={() => addTemplate('30초', 120)}
          >
            Add Duplicate Template
          </button>
        </div>
      );
    };

    render(
      <TemplateProvider>
        <TestComponentWithDuplicate />
      </TemplateProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    act(() => {
      screen.getByTestId('add-duplicate-template').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('이미 존재하는 템플릿 이름입니다.');
    });
  });

  it('should not update default template', async () => {
    const TestComponentWithUpdate = () => {
      const context = useContext(TemplateContext);
      if (!context) return <div>No context</div>;

      const { state, updateTemplate } = context;

      return (
        <div>
          <div data-testid="error">{state.error || 'no-error'}</div>
          <button 
            data-testid="update-default-template" 
            onClick={() => updateTemplate('default-30s', { name: 'Updated Default' })}
          >
            Update Default Template
          </button>
        </div>
      );
    };

    render(
      <TemplateProvider>
        <TestComponentWithUpdate />
      </TemplateProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    act(() => {
      screen.getByTestId('update-default-template').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('기본 템플릿은 수정할 수 없습니다.');
    });
  });

  it('should not delete default template', async () => {
    const TestComponentWithDelete = () => {
      const context = useContext(TemplateContext);
      if (!context) return <div>No context</div>;

      const { state, deleteTemplate } = context;

      return (
        <div>
          <div data-testid="error">{state.error || 'no-error'}</div>
          <button 
            data-testid="delete-default-template" 
            onClick={() => deleteTemplate('default-30s')}
          >
            Delete Default Template
          </button>
        </div>
      );
    };

    render(
      <TemplateProvider>
        <TestComponentWithDelete />
      </TemplateProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    act(() => {
      screen.getByTestId('delete-default-template').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('기본 템플릿은 삭제할 수 없습니다.');
    });
  });

  it('should call onTemplateSelect when template is selected', async () => {
    const mockOnTemplateSelect = vi.fn();

    render(
      <TemplateProvider onTemplateSelect={mockOnTemplateSelect}>
        <TestComponent />
      </TemplateProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('template-count')).toHaveTextContent('3');
    });

    act(() => {
      screen.getByTestId('select-template').click();
    });

    expect(mockOnTemplateSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'default-30s',
        name: '30초',
        duration: 30,
        isDefault: true
      })
    );
  });

  it('should handle storage errors gracefully', async () => {
    mockStorageService.loadTemplates = vi.fn().mockImplementation(() => {
      throw new Error('Storage error');
    });

    render(
      <TemplateProvider>
        <TestComponent />
      </TemplateProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('템플릿을 불러오는데 실패했습니다.');
    });
  });
});