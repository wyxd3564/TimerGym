import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimerDisplay from '../TimerDisplay';
import { TimerProvider } from '../../../contexts/TimerContext';
import { SettingsProvider } from '../../../contexts/SettingsContext';
import { TemplateProvider } from '../../../contexts/TemplateContext';

// Mock the VoiceCountService
vi.mock('../../../services/VoiceCountService', () => ({
  VoiceCountService: vi.fn().mockImplementation(() => ({
    startVoiceCount: vi.fn(),
    stopVoiceCount: vi.fn(),
    toggleVoiceCount: vi.fn(),
    isVoiceCountActive: vi.fn().mockReturnValue(false),
    getCurrentCount: vi.fn().mockReturnValue(0),
    setVolume: vi.fn(),
    getVolume: vi.fn().mockReturnValue(0.8),
    isAvailable: vi.fn().mockReturnValue(true),
    initializeAfterUserInteraction: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn(),
  }))
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>
    <TemplateProvider>
      <TimerProvider>
        {children}
      </TimerProvider>
    </TemplateProvider>
  </SettingsProvider>
);

describe('VoiceCount Integration', () => {
  it('should render voice count button in timer display', () => {
    render(
      <TestWrapper>
        <TimerDisplay />
      </TestWrapper>
    );

    const voiceButton = screen.getByTestId('voice-count-button');
    expect(voiceButton).toBeInTheDocument();
    expect(voiceButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should toggle voice count when button is clicked', () => {
    render(
      <TestWrapper>
        <TimerDisplay />
      </TestWrapper>
    );

    const voiceButton = screen.getByTestId('voice-count-button');
    
    // Initially inactive
    expect(voiceButton).toHaveAttribute('aria-pressed', 'false');
    
    // Click to activate
    fireEvent.click(voiceButton);
    
    // Should be active now (this tests the integration with TimerContext)
    expect(voiceButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <TimerDisplay />
      </TestWrapper>
    );

    const voiceButton = screen.getByTestId('voice-count-button');
    
    expect(voiceButton).toHaveAttribute('aria-label', '음성 카운트 시작');
    expect(voiceButton).toHaveAttribute('type', 'button');
    expect(voiceButton).toHaveAttribute('title', '음성 카운트를 시작합니다');
  });
});