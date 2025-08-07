import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TemplateForm from '../TemplateForm';
import { TemplateContext } from '../../../contexts/TemplateContext';
import type { Template, TemplateState } from '../../../types';

// Mock the Modal component
vi.mock('../../Modal/Modal', () => ({
  default: ({ children, isOpen, title }: any) => 
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null
}));

// Mock the Button component
vi.mock('../../Button/Button', () => ({
  default: ({ children, onClick, disabled, type, variant }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
      data-testid={`button-${children.replace(/\s+/g, '-')}`}
    >
      {children}
    </button>
  )
}));

// Mock the DragTimeInput component
vi.mock('../../DragTimeInput/DragTimeInput', () => ({
  default: ({ value, onChange, label, disabled, min, max }: any) => (
    <div data-testid={`drag-time-input-${label}`}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        min={min}
        max={max}
        data-testid={`input-${label}`}
      />
      <span>{label}</span>
    </div>
  )
}));

describe('TemplateForm', () => {
  const mockAddTemplate = vi.fn();
  const mockUpdateTemplate = vi.fn();
  const mockDeleteTemplate = vi.fn();
  const mockDispatch = vi.fn();

  const mockTemplateState: TemplateState = {
    templates: [],
    isLoading: false,
    error: null
  };

  const mockTemplateContext = {
    state: mockTemplateState,
    dispatch: mockDispatch,
    addTemplate: mockAddTemplate,
    updateTemplate: mockUpdateTemplate,
    deleteTemplate: mockDeleteTemplate
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    template: null
  };

  const sampleTemplate: Template = {
    id: 'test-1',
    name: '테스트 템플릿',
    duration: 90, // 1분 30초
    isDefault: false,
    createdAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithContext = (props = defaultProps) => {
    return render(
      <TemplateContext.Provider value={mockTemplateContext}>
        <TemplateForm {...props} />
      </TemplateContext.Provider>
    );
  };

  describe('New template creation', () => {
    it('renders form for new template', () => {
      renderWithContext();

      expect(screen.getByText('새 템플릿 추가')).toBeInTheDocument();
      expect(screen.getByLabelText('템플릿 이름')).toBeInTheDocument();
      expect(screen.getByTestId('drag-time-input-분')).toBeInTheDocument();
      expect(screen.getByTestId('drag-time-input-초')).toBeInTheDocument();
      expect(screen.getByTestId('button-저장')).toBeInTheDocument();
      expect(screen.getByTestId('button-취소')).toBeInTheDocument();
    });

    it('initializes with default values', () => {
      renderWithContext();

      expect(screen.getByDisplayValue('')).toBeInTheDocument(); // name input
      expect(screen.getByTestId('input-분')).toHaveValue(1);
      expect(screen.getByTestId('input-초')).toHaveValue(30);
    });

    it('handles name input change', () => {
      renderWithContext();

      const nameInput = screen.getByLabelText('템플릿 이름');
      fireEvent.change(nameInput, { target: { value: '새 운동' } });

      expect(nameInput).toHaveValue('새 운동');
    });

    it('handles time input changes via DragTimeInput', () => {
      renderWithContext();

      const minutesInput = screen.getByTestId('input-분');
      const secondsInput = screen.getByTestId('input-초');

      fireEvent.change(minutesInput, { target: { value: '2' } });
      fireEvent.change(secondsInput, { target: { value: '45' } });

      expect(minutesInput).toHaveValue(2);
      expect(secondsInput).toHaveValue(45);
    });

    it('submits new template with valid data', async () => {
      renderWithContext();

      // Fill form
      fireEvent.change(screen.getByLabelText('템플릿 이름'), { 
        target: { value: '새 운동' } 
      });
      fireEvent.change(screen.getByTestId('input-분'), { 
        target: { value: '2' } 
      });
      fireEvent.change(screen.getByTestId('input-초'), { 
        target: { value: '30' } 
      });

      // Submit
      fireEvent.click(screen.getByTestId('button-저장'));

      await waitFor(() => {
        expect(mockAddTemplate).toHaveBeenCalledWith('새 운동', 150); // 2분 30초 = 150초
      });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('handles cancel button', () => {
      renderWithContext();

      fireEvent.click(screen.getByTestId('button-취소'));

      expect(defaultProps.onClose).toHaveBeenCalled();
      expect(mockAddTemplate).not.toHaveBeenCalled();
    });
  });

  describe('Template editing', () => {
    const editProps = {
      ...defaultProps,
      template: sampleTemplate
    };

    it('renders form for editing template', () => {
      renderWithContext(editProps);

      expect(screen.getByText('템플릿 편집')).toBeInTheDocument();
      expect(screen.getByTestId('button-수정')).toBeInTheDocument();
    });

    it('initializes with template data', () => {
      renderWithContext(editProps);

      expect(screen.getByDisplayValue('테스트 템플릿')).toBeInTheDocument();
      expect(screen.getByTestId('input-분')).toHaveValue(1); // 90초 = 1분 30초
      expect(screen.getByTestId('input-초')).toHaveValue(30);
    });

    it('submits updated template', async () => {
      renderWithContext(editProps);

      // Modify data
      fireEvent.change(screen.getByLabelText('템플릿 이름'), { 
        target: { value: '수정된 템플릿' } 
      });
      fireEvent.change(screen.getByTestId('input-분'), { 
        target: { value: '3' } 
      });

      fireEvent.click(screen.getByTestId('button-수정'));

      await waitFor(() => {
        expect(mockUpdateTemplate).toHaveBeenCalledWith('test-1', {
          name: '수정된 템플릿',
          duration: 210 // 3분 30초 = 210초
        });
      });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('DragTimeInput integration', () => {
    it('integrates DragTimeInput components correctly', () => {
      renderWithContext();

      // Check that DragTimeInput components are rendered with correct props
      const minutesInput = screen.getByTestId('input-분');
      const secondsInput = screen.getByTestId('input-초');

      expect(minutesInput).toHaveAttribute('min', '0');
      expect(minutesInput).toHaveAttribute('max', '59');
      expect(secondsInput).toHaveAttribute('min', '0');
      expect(secondsInput).toHaveAttribute('max', '59');
    });

    it('updates form state when DragTimeInput values change', () => {
      renderWithContext();

      const minutesInput = screen.getByTestId('input-분');
      const secondsInput = screen.getByTestId('input-초');

      // Change values through DragTimeInput
      fireEvent.change(minutesInput, { target: { value: '5' } });
      fireEvent.change(secondsInput, { target: { value: '15' } });

      expect(minutesInput).toHaveValue(5);
      expect(secondsInput).toHaveValue(15);
    });

    it('shows drag hint text', () => {
      renderWithContext();

      expect(screen.getByText('위아래로 드래그하거나 +/- 버튼으로 조정하세요')).toBeInTheDocument();
    });
  });

  describe('Form reset on open/close', () => {
    it('resets form when reopened with different template', () => {
      const { rerender } = renderWithContext({ ...defaultProps, isOpen: false });

      // Reopen with different template
      rerender(
        <TemplateContext.Provider value={mockTemplateContext}>
          <TemplateForm {...defaultProps} template={sampleTemplate} />
        </TemplateContext.Provider>
      );

      expect(screen.getByDisplayValue('테스트 템플릿')).toBeInTheDocument();
      expect(screen.getByTestId('input-분')).toHaveValue(1);
      expect(screen.getByTestId('input-초')).toHaveValue(30);
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      renderWithContext();

      expect(screen.getByLabelText('템플릿 이름')).toBeInTheDocument();
      expect(screen.getByText('시간 설정')).toBeInTheDocument();
    });

    it('has proper input constraints', () => {
      renderWithContext();

      const nameInput = screen.getByLabelText('템플릿 이름');
      expect(nameInput).toHaveAttribute('maxLength', '50');
      expect(nameInput).toHaveAttribute('required');

      const minutesInput = screen.getByTestId('input-분');
      const secondsInput = screen.getByTestId('input-초');
      
      expect(minutesInput).toHaveAttribute('min', '0');
      expect(minutesInput).toHaveAttribute('max', '59');
      expect(secondsInput).toHaveAttribute('min', '0');
      expect(secondsInput).toHaveAttribute('max', '59');
    });
  });
});