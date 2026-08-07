import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgeStep } from './AgeStep';

describe('AgeStep', () => {
  it('muestra el título y el valor con sufijo anos, sin subtítulo', () => {
    render(<AgeStep value={32} onChange={() => {}} onContinue={() => {}} current={4} total={8} />);
    expect(screen.getByText('Qual sua idade?')).toBeInTheDocument();
    expect(screen.getByText('anos')).toBeInTheDocument();
  });
});
