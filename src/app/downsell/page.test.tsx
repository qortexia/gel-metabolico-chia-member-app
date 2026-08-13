import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DownsellPage from './page';

describe('DownsellPage', () => {
  it('muestra el título de la oferta', () => {
    render(<DownsellPage />);
    expect(screen.getByText('KIT DE APOYO')).toBeInTheDocument();
  });

  it('el botón de aceptar lleva al checkout del downsell', () => {
    render(<DownsellPage />);
    expect(screen.getByText('SÍ, QUIERO MI KIT DE APOYO').closest('a')).toHaveAttribute(
      'href',
      'https://pay.kiwify.com/IeqleVF'
    );
  });

  it('el botón de rechazar lleva a la página de obrigado', () => {
    render(<DownsellPage />);
    expect(screen.getByText('No, gracias. Continuar →').closest('a')).toHaveAttribute(
      'href',
      '/gracias'
    );
  });
});
