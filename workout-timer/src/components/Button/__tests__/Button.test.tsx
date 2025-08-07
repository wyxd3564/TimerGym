import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('primary');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button').className).toContain('secondary');
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button').className).toContain('outline');
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    expect(screen.getByRole('button').className).toContain('small');
    
    rerender(<Button size="medium">Medium</Button>);
    expect(screen.getByRole('button').className).toContain('medium');
    
    rerender(<Button size="large">Large</Button>);
    expect(screen.getByRole('button').className).toContain('large');
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('should set correct type attribute', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    
    rerender(<Button type="reset">Reset</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    
    rerender(<Button>Default</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('should handle keyboard events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Button</Button>);
    
    const button = screen.getByRole('button');
    
    // Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Space key
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
    
    // Other keys should not trigger click
    fireEvent.keyDown(button, { key: 'a' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should not handle keyboard events when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Button</Button>);
    
    const button = screen.getByRole('button');
    
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.keyDown(button, { key: ' ' });
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should set aria-label when provided', () => {
    render(<Button aria-label="Custom label">Button</Button>);
    
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label');
  });

  it('should set tabIndex correctly', () => {
    const { rerender } = render(<Button tabIndex={0}>Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '0');
    
    rerender(<Button disabled>Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '-1');
  });

  it('should pass through additional props', () => {
    render(<Button data-testid="custom-button" id="button-id">Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-testid', 'custom-button');
    expect(button).toHaveAttribute('id', 'button-id');
  });

  it('should handle keyboard events correctly', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Button</Button>);
    
    const button = screen.getByRole('button');
    
    // Test that Enter and Space trigger click
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
    
    // Test that other keys don't trigger click
    fireEvent.keyDown(button, { key: 'a' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});