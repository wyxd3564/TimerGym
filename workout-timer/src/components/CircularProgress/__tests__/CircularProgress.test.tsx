import React from 'react';
import { render, screen } from '@testing-library/react';
import CircularProgress from '../CircularProgress';

describe('CircularProgress', () => {
  const defaultProps = {
    progress: 50,
    size: 200,
    strokeWidth: 8,
    color: '#28a745'
  };

  it('renders without crashing', () => {
    const { container } = render(<CircularProgress {...defaultProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with correct size', () => {
    const { container } = render(<CircularProgress {...defaultProps} size={300} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '300');
    expect(svg).toHaveAttribute('height', '300');
  });

  it('renders with correct viewBox', () => {
    const { container } = render(<CircularProgress {...defaultProps} size={200} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 200 200');
  });

  it('renders background and progress circles', () => {
    const { container } = render(<CircularProgress {...defaultProps} />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
  });

  it('calculates correct stroke-dashoffset for progress', () => {
    const { container } = render(<CircularProgress {...defaultProps} progress={25} />);
    const progressCircle = container.querySelector('circle:last-child');
    
    // Calculate expected values
    const center = 200 / 2;
    const radius = center - 8 / 2;
    const circumference = 2 * Math.PI * radius;
    const expectedOffset = circumference - (25 / 100) * circumference;
    
    expect(progressCircle).toHaveAttribute('stroke-dashoffset', expectedOffset.toString());
  });

  it('applies custom background color', () => {
    const { container } = render(
      <CircularProgress {...defaultProps} backgroundColor="#ff0000" />
    );
    const backgroundCircle = container.querySelector('circle:first-child');
    expect(backgroundCircle).toHaveAttribute('stroke', '#ff0000');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CircularProgress {...defaultProps} className="custom-class" />
    );
    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveClass('custom-class');
  });

  it('handles 0% progress correctly', () => {
    const { container } = render(<CircularProgress {...defaultProps} progress={0} />);
    const progressCircle = container.querySelector('circle:last-child');
    
    const center = 200 / 2;
    const radius = center - 8 / 2;
    const circumference = 2 * Math.PI * radius;
    
    expect(progressCircle).toHaveAttribute('stroke-dashoffset', circumference.toString());
  });

  it('handles 100% progress correctly', () => {
    const { container } = render(<CircularProgress {...defaultProps} progress={100} />);
    const progressCircle = container.querySelector('circle:last-child');
    
    expect(progressCircle).toHaveAttribute('stroke-dashoffset', '0');
  });

  it('applies correct stroke properties', () => {
    const { container } = render(<CircularProgress {...defaultProps} />);
    const progressCircle = container.querySelector('circle:last-child');
    
    expect(progressCircle).toHaveAttribute('stroke', '#28a745');
    expect(progressCircle).toHaveAttribute('stroke-width', '8');
    expect(progressCircle).toHaveAttribute('stroke-linecap', 'round');
    expect(progressCircle).toHaveAttribute('fill', 'none');
  });

  it('sets correct transform origin and rotation', () => {
    const { container } = render(<CircularProgress {...defaultProps} size={200} />);
    const progressCircle = container.querySelector('circle:last-child');
    
    expect(progressCircle).toHaveStyle({
      transform: 'rotate(-90deg)',
      transformOrigin: '100px 100px'
    });
  });
});