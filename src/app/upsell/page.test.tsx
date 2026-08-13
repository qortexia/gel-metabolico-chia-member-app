import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UpsellPage from './page';

describe('UpsellPage', () => {
  it('muestra el título de la oferta', () => {
    render(<UpsellPage />);
    expect(screen.getByText('PROTOCOLO 90 DÍAS')).toBeInTheDocument();
  });

  it('el botón de aceptar lleva al checkout del upsell', () => {
    render(<UpsellPage />);
    expect(
      screen.getByText('SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS').closest('a')
    ).toHaveAttribute('href', 'https://pay.kiwify.com/RfpEvfO');
  });

  it('el botón de rechazar lleva al downsell', () => {
    render(<UpsellPage />);
    expect(screen.getByText('No, gracias. Continuar →').closest('a')).toHaveAttribute(
      'href',
      '/downsell'
    );
  });
});
