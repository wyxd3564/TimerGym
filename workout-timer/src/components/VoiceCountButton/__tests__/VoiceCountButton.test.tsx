import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VoiceCountButton from '../VoiceCountButton';

describe('VoiceCountButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('렌더링', () => {
    it('기본 상태로 렌더링되어야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', '음성 카운트 시작');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('활성 상태로 렌더링되어야 함', () => {
      render(<VoiceCountButton isActive={true} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      expect(button).toHaveAttribute('aria-label', '음성 카운트 중지');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('비활성화 상태로 렌더링되어야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} disabled={true} />);
      
      const button = screen.getByTestId('voice-count-button');
      expect(button).toBeDisabled();
    });

    it('커스텀 className이 적용되어야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} className="custom-class" />);
      
      const button = screen.getByTestId('voice-count-button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('상호작용', () => {
    it('클릭 시 onClick 콜백이 호출되어야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('비활성화 상태에서 클릭해도 onClick이 호출되지 않아야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} disabled={true} />);
      
      const button = screen.getByTestId('voice-count-button');
      fireEvent.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('Enter 키 입력 시 onClick 콜백이 호출되어야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('Space 키 입력 시 onClick 콜백이 호출되어야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('다른 키 입력 시 onClick이 호출되지 않아야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      fireEvent.keyDown(button, { key: 'Escape' });
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('비활성화 상태에서 키보드 입력해도 onClick이 호출되지 않아야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} disabled={true} />);
      
      const button = screen.getByTestId('voice-count-button');
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('접근성', () => {
    it('적절한 ARIA 속성을 가져야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-pressed');
      expect(button).toHaveAttribute('title');
    });

    it('활성 상태에 따라 적절한 레이블을 가져야 함', () => {
      const { rerender } = render(<VoiceCountButton isActive={false} onClick={mockOnClick} />);
      
      let button = screen.getByTestId('voice-count-button');
      expect(button).toHaveAttribute('aria-label', '음성 카운트 시작');
      expect(button).toHaveAttribute('title', '음성 카운트를 시작합니다');
      
      rerender(<VoiceCountButton isActive={true} onClick={mockOnClick} />);
      
      button = screen.getByTestId('voice-count-button');
      expect(button).toHaveAttribute('aria-label', '음성 카운트 중지');
      expect(button).toHaveAttribute('title', '음성 카운트를 중지합니다');
    });

    it('SVG 아이콘이 aria-hidden 속성을 가져야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} />);
      
      const svgIcon = screen.getByRole('button').querySelector('svg');
      expect(svgIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('시각적 상태', () => {
    it('비활성 상태에서 기본 마이크 아이콘을 표시해야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      const waveform = button.querySelector('.waveform');
      
      // 파형이 있지만 비활성 상태에서는 보이지 않음
      expect(waveform).toBeNull();
    });

    it('활성 상태에서 파형 애니메이션을 표시해야 함', () => {
      render(<VoiceCountButton isActive={true} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      const waveformElements = button.querySelectorAll('rect');
      
      // 파형 애니메이션을 위한 rect 요소들이 있는지 확인
      expect(waveformElements.length).toBeGreaterThan(0);
    });

    it('활성 상태에서 활성 표시기를 표시해야 함', () => {
      render(<VoiceCountButton isActive={true} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      const activeIndicator = button.querySelector('[aria-hidden="true"]');
      
      expect(activeIndicator).toBeInTheDocument();
    });
  });

  describe('CSS 클래스', () => {
    it('기본 CSS 클래스를 가져야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      expect(button.className).toContain('voiceButton');
    });

    it('활성 상태에서 active 클래스를 가져야 함', () => {
      render(<VoiceCountButton isActive={true} onClick={mockOnClick} />);
      
      const button = screen.getByTestId('voice-count-button');
      expect(button.className).toContain('active');
    });

    it('비활성화 상태에서 disabled 클래스를 가져야 함', () => {
      render(<VoiceCountButton isActive={false} onClick={mockOnClick} disabled={true} />);
      
      const button = screen.getByTestId('voice-count-button');
      expect(button.className).toContain('disabled');
    });
  });
});