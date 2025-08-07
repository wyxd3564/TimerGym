import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KeyboardShortcuts from '../KeyboardShortcuts';

describe('KeyboardShortcuts', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isVisible is false', () => {
    render(<KeyboardShortcuts isVisible={false} onClose={mockOnClose} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isVisible is true', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('키보드 단축키')).toBeInTheDocument();
  });

  it('should display all keyboard shortcuts', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    // Check for some key shortcuts
    expect(screen.getByText('Space')).toBeInTheDocument();
    expect(screen.getByText('타이머 시작/정지')).toBeInTheDocument();
    
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('반복 횟수 증가')).toBeInTheDocument();
    
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('반복 횟수 감소')).toBeInTheDocument();
    
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('타이머 초기화')).toBeInTheDocument();
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('30초 템플릿 선택')).toBeInTheDocument();
    
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1분 템플릿 선택')).toBeInTheDocument();
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('3분 템플릿 선택')).toBeInTheDocument();
    
    expect(screen.getByText('Esc')).toBeInTheDocument();
    expect(screen.getByText('모달 닫기')).toBeInTheDocument();
    
    expect(screen.getByText('Tab')).toBeInTheDocument();
    expect(screen.getByText('다음 요소로 이동')).toBeInTheDocument();
    
    expect(screen.getByText('Shift + Tab')).toBeInTheDocument();
    expect(screen.getByText('이전 요소로 이동')).toBeInTheDocument();
  });

  it('should display note about input field behavior', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('참고:')).toBeInTheDocument();
    expect(screen.getByText(/입력 필드가 활성화된 상태에서는 단축키가 비활성화됩니다/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: '단축키 도움말 닫기' });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal content is clicked', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    const modalContent = screen.getByText('키보드 단축키');
    fireEvent.click(modalContent);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'shortcuts-title');
    
    const title = screen.getByText('키보드 단축키');
    expect(title).toHaveAttribute('id', 'shortcuts-title');
  });

  it('should have proper list structure', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(10); // Should have 10 shortcuts
  });

  it('should render keyboard keys with proper styling', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    const spaceKey = screen.getByText('Space');
    expect(spaceKey.tagName).toBe('KBD');
    
    const upKey = screen.getByText('↑');
    expect(upKey.tagName).toBe('KBD');
  });

  it('should stop propagation when modal content is clicked', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    const modal = screen.getByRole('dialog').firstElementChild as HTMLElement;
    
    // Test that clicking modal content doesn't close the modal
    fireEvent.click(modal);
    expect(mockOnClose).not.toHaveBeenCalled();
    
    // Test that the modal content has the expected click handler
    expect(modal).toBeInTheDocument();
  });

  it('should render all expected shortcut keys', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    const expectedKeys = ['Space', '↑', '↓', 'R', '1', '2', '3', 'Esc', 'Tab', 'Shift + Tab'];
    
    expectedKeys.forEach(key => {
      expect(screen.getByText(key)).toBeInTheDocument();
    });
  });

  it('should render all expected descriptions', () => {
    render(<KeyboardShortcuts isVisible={true} onClose={mockOnClose} />);
    
    const expectedDescriptions = [
      '타이머 시작/정지',
      '반복 횟수 증가',
      '반복 횟수 감소',
      '타이머 초기화',
      '30초 템플릿 선택',
      '1분 템플릿 선택',
      '3분 템플릿 선택',
      '모달 닫기',
      '다음 요소로 이동',
      '이전 요소로 이동'
    ];
    
    expectedDescriptions.forEach(description => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });
});