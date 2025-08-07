import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Header from '../Header';

describe('Header Component', () => {
  const mockOnTemplateClick = vi.fn();
  const mockOnSettingsClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default title', () => {
    render(
      <Header
        onTemplateClick={mockOnTemplateClick}
        onSettingsClick={mockOnSettingsClick}
      />
    );

    expect(screen.getByText('운동 타이머')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    const customTitle = '커스텀 타이머';
    render(
      <Header
        onTemplateClick={mockOnTemplateClick}
        onSettingsClick={mockOnSettingsClick}
        title={customTitle}
      />
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('renders template button with correct text and aria-label', () => {
    render(
      <Header
        onTemplateClick={mockOnTemplateClick}
        onSettingsClick={mockOnSettingsClick}
      />
    );

    const templateButton = screen.getByRole('button', { name: '템플릿 선택' });
    expect(templateButton).toBeInTheDocument();
    expect(templateButton).toHaveTextContent('템플릿');
  });

  it('renders settings button with correct aria-label', () => {
    render(
      <Header
        onTemplateClick={mockOnTemplateClick}
        onSettingsClick={mockOnSettingsClick}
      />
    );

    const settingsButton = screen.getByRole('button', { name: '설정' });
    expect(settingsButton).toBeInTheDocument();
    expect(settingsButton).toHaveTextContent('⚙️');
  });

  it('calls onTemplateClick when template button is clicked', () => {
    render(
      <Header
        onTemplateClick={mockOnTemplateClick}
        onSettingsClick={mockOnSettingsClick}
      />
    );

    const templateButton = screen.getByRole('button', { name: '템플릿 선택' });
    fireEvent.click(templateButton);

    expect(mockOnTemplateClick).toHaveBeenCalledTimes(1);
  });

  it('calls onSettingsClick when settings button is clicked', () => {
    render(
      <Header
        onTemplateClick={mockOnTemplateClick}
        onSettingsClick={mockOnSettingsClick}
      />
    );

    const settingsButton = screen.getByRole('button', { name: '설정' });
    fireEvent.click(settingsButton);

    expect(mockOnSettingsClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-header';
    const { container } = render(
      <Header
        onTemplateClick={mockOnTemplateClick}
        onSettingsClick={mockOnSettingsClick}
        className={customClass}
      />
    );

    const header = container.querySelector('header');
    expect(header).toHaveClass(customClass);
  });

  it('has proper semantic structure', () => {
    render(
      <Header
        onTemplateClick={mockOnTemplateClick}
        onSettingsClick={mockOnSettingsClick}
      />
    );

    // Check for header element
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    // Check for h1 heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('운동 타이머');
  });

  it('has proper button accessibility attributes', () => {
    render(
      <Header
        onTemplateClick={mockOnTemplateClick}
        onSettingsClick={mockOnSettingsClick}
      />
    );

    const templateButton = screen.getByRole('button', { name: '템플릿 선택' });
    const settingsButton = screen.getByRole('button', { name: '설정' });

    expect(templateButton).toHaveAttribute('aria-label', '템플릿 선택');
    expect(settingsButton).toHaveAttribute('aria-label', '설정');
  });

  it('maintains focus management for keyboard navigation', () => {
    render(
      <Header
        onTemplateClick={mockOnTemplateClick}
        onSettingsClick={mockOnSettingsClick}
      />
    );

    const templateButton = screen.getByRole('button', { name: '템플릿 선택' });
    const settingsButton = screen.getByRole('button', { name: '설정' });

    // Both buttons should be focusable
    templateButton.focus();
    expect(templateButton).toHaveFocus();

    settingsButton.focus();
    expect(settingsButton).toHaveFocus();
  });

  it('renders buttons with proper type attribute', () => {
    render(
      <Header
        onTemplateClick={mockOnTemplateClick}
        onSettingsClick={mockOnSettingsClick}
      />
    );

    const templateButton = screen.getByRole('button', { name: '템플릿 선택' });
    const settingsButton = screen.getByRole('button', { name: '설정' });

    expect(templateButton).toHaveAttribute('type', 'button');
    expect(settingsButton).toHaveAttribute('type', 'button');
  });
});