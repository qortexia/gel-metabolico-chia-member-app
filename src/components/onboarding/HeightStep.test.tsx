import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeightStep } from './HeightStep';

describe('HeightStep', () => {
  it('muestra el título, subtítulo y el valor con sufijo cm', () => {
    render(<HeightStep value={165} onChange={() => {}} onContinue={() => {}} current={3} total={8} />);
    expect(screen.getByText('Qual sua altura?')).toBeInTheDocument();
    expect(screen.getByText('Vai compor seu IMC e meta')).toBeInTheDocument();
    expect(screen.getByText('cm')).toBeInTheDocument();
  });
});
