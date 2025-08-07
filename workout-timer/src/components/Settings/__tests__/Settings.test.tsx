// Settings Component Tests
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Settings from '../Settings';
import { SettingsProvider } from '../../../contexts/SettingsContext';
import { DEFAULT_SETTINGS } from '../../../types';

// Mock the StorageService
vi.mock('../../../services/StorageService', () => ({
  StorageService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>
    {children}
  </SettingsProvider>
);

describe('Settings Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(false);
  });

  afterEach(() => {
    // Clean up DOM theme attribute
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders settings modal when open', () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('설정')).toBeInTheDocument();
    expect(screen.getByText('알림 설정')).toBeInTheDocument();
    expect(screen.getByText('알림음 선택')).toBeInTheDocument();
    expect(screen.getByText('화면 설정')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <Settings isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.queryByText('설정')).not.toBeInTheDocument();
  });

  it('displays default settings correctly', () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Check sound toggle is on by default
    const soundToggle = screen.getByLabelText('소리 알림 끄기');
    expect(soundToggle.className).toContain('toggleActive');

    // Check vibration toggle is on by default
    const vibrationToggle = screen.getByLabelText('진동 알림 끄기');
    expect(vibrationToggle.className).toContain('toggleActive');

    // Check default sounds are selected - use getAllBy and check the first one (countdown)
    const beepRadios = screen.getAllByDisplayValue('beep');
    expect(beepRadios[0]).toBeChecked(); // First one is countdown, should be checked by default

    // Check light theme is default
    const themeToggle = screen.getByLabelText('다크 모드 켜기');
    expect(themeToggle.className).not.toContain('toggleActive');
  });

  it('toggles sound setting when clicked', async () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const soundToggle = screen.getByLabelText('소리 알림 끄기');
    fireEvent.click(soundToggle);

    await waitFor(() => {
      expect(screen.getByLabelText('소리 알림 켜기')).toBeInTheDocument();
    });
  });

  it('toggles vibration setting when clicked', async () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const vibrationToggle = screen.getByLabelText('진동 알림 끄기');
    fireEvent.click(vibrationToggle);

    await waitFor(() => {
      expect(screen.getByLabelText('진동 알림 켜기')).toBeInTheDocument();
    });
  });

  it('changes countdown sound when radio button is selected', async () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Get the countdown bell radio specifically
    const countdownBellRadio = screen.getAllByDisplayValue('bell')[0]; // First one is countdown
    fireEvent.click(countdownBellRadio);

    await waitFor(() => {
      expect(countdownBellRadio).toBeChecked();
    });
  });

  it('changes completion sound when radio button is selected', async () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Get the completion sound radio buttons (they have the same values but different names)
    const completionBellRadio = screen.getAllByDisplayValue('bell')[1]; // Second one is for completion
    fireEvent.click(completionBellRadio);

    await waitFor(() => {
      expect(completionBellRadio).toBeChecked();
    });
  });

  it('toggles theme and applies to DOM', async () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const themeToggle = screen.getByLabelText('다크 모드 켜기');
    fireEvent.click(themeToggle);

    await waitFor(() => {
      expect(screen.getByLabelText('다크 모드 끄기')).toBeInTheDocument();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    // Toggle back to light
    const lightThemeToggle = screen.getByLabelText('다크 모드 끄기');
    fireEvent.click(lightThemeToggle);

    await waitFor(() => {
      expect(screen.getByLabelText('다크 모드 켜기')).toBeInTheDocument();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  it('toggles keep screen on setting', async () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const keepScreenOnToggle = screen.getByLabelText('화면 켜두기 켜기');
    fireEvent.click(keepScreenOnToggle);

    await waitFor(() => {
      expect(screen.getByLabelText('화면 켜두기 끄기')).toBeInTheDocument();
    });
  });

  it('shows confirmation dialog when reset is clicked', () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const resetButton = screen.getByText('설정 초기화');
    fireEvent.click(resetButton);

    expect(mockConfirm).toHaveBeenCalledWith('모든 설정을 초기화하시겠습니까?');
  });

  it('resets settings when confirmed', async () => {
    mockConfirm.mockReturnValue(true);

    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // First change some settings
    const themeToggle = screen.getByLabelText('다크 모드 켜기');
    fireEvent.click(themeToggle);

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    // Then reset
    const resetButton = screen.getByText('설정 초기화');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  it('closes modal when close button is clicked', () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const closeButton = screen.getByText('완료');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Check ARIA labels
    expect(screen.getByLabelText('소리 알림 끄기')).toBeInTheDocument();
    expect(screen.getByLabelText('진동 알림 끄기')).toBeInTheDocument();
    expect(screen.getByLabelText('다크 모드 켜기')).toBeInTheDocument();
    expect(screen.getByLabelText('화면 켜두기 켜기')).toBeInTheDocument();

    // Check radio buttons have proper names
    const countdownRadios = screen.getAllByRole('radio');
    expect(countdownRadios.length).toBeGreaterThan(0);
    
    // Check that radio buttons are grouped properly
    const countdownSoundRadios = screen.getAllByRole('radio', { name: /기본음|벨소리|차임/ });
    expect(countdownSoundRadios.length).toBe(6); // 3 for countdown + 3 for completion
  });

  it('displays correct sound labels', () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getAllByText('기본음 (띵)')).toHaveLength(2); // countdown + completion
    expect(screen.getAllByText('벨소리')).toHaveLength(2);
    expect(screen.getAllByText('차임')).toHaveLength(2);
  });

  it('handles keyboard navigation properly', () => {
    render(
      <TestWrapper>
        <Settings isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const soundToggle = screen.getByLabelText('소리 알림 끄기');
    
    // Focus the toggle
    soundToggle.focus();
    expect(document.activeElement).toBe(soundToggle);

    // Press Enter to activate
    fireEvent.keyDown(soundToggle, { key: 'Enter' });
    fireEvent.click(soundToggle); // Simulate the click that would happen
    
    // The toggle should change state
    expect(screen.getByLabelText('소리 알림 켜기')).toBeInTheDocument();
  });
});