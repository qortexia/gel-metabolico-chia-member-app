import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgeStep } from './AgeStep';

describe('AgeStep', () => {
  it('muestra el título y el valor con sufijo años, sin subtítulo', () => {
    render(<AgeStep value={32} onChange={() => {}} onContinue={() => {}} current={4} total={8} />);
    expect(screen.getByText('¿Cuál es tu edad?')).toBeInTheDocument();
    expect(screen.getByText('años')).toBeInTheDocument();
  });
});
