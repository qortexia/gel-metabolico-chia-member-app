import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessingScreen } from './ProcessingScreen';

describe('ProcessingScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el texto exacto', () => {
    render(<ProcessingScreen onComplete={() => {}} />);
    expect(screen.getByText('Armando tu protocolo personalizado…')).toBeInTheDocument();
    expect(screen.getByText('Calculando tu dosis ideal, horarios y ritual ✨')).toBeInTheDocument();
  });

  it('llama a onComplete después de durationMs', () => {
    const onComplete = vi.fn();
    render(<ProcessingScreen onComplete={onComplete} durationMs={3000} />);
    expect(onComplete).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
