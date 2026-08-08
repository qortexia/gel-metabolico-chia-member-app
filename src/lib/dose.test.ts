import { describe, it, expect } from 'vitest';
import { calculateDose } from './dose';

describe('calculateDose', () => {
  it('devuelve la dosis de la franja hasta 65kg', () => {
    expect(calculateDose(60, 3, 30)).toEqual({
      chia: '1 cucharada',
      psyllium: '1 cucharadita',
      linaza: '1 cucharada',
      agua: '250 ml',
      tip: null,
    });
  });

  it('devuelve la dosis de la franja 65-90kg', () => {
    expect(calculateDose(80, 3, 30)).toEqual({
      chia: '1½ cucharada',
      psyllium: '1½ cucharadita',
      linaza: '1 cucharada',
      agua: '300 ml',
      tip: null,
    });
  });

  it('devuelve la dosis de la franja arriba de 90kg', () => {
    expect(calculateDose(95, 3, 30)).toEqual({
      chia: '2 cucharadas',
      psyllium: '2 cucharaditas',
      linaza: '1 cucharada',
      agua: '350 ml',
      tip: null,
    });
  });

  it('aumenta el psyllium cuando el antojo de dulce es 7 o más', () => {
    expect(calculateDose(60, 7, 30).psyllium).toBe('1½ cucharadita');
    expect(calculateDose(80, 7, 30).psyllium).toBe('2 cucharaditas');
  });

  it('el ajuste por antojo no supera el techo de 2 cucharaditas', () => {
    expect(calculateDose(95, 10, 30).psyllium).toBe('2 cucharaditas');
  });

  it('no aumenta el psyllium cuando el antojo es menor a 7', () => {
    expect(calculateDose(60, 6, 30).psyllium).toBe('1 cucharadita');
  });

  it('agrega el tip de edad para 55 años o más', () => {
    expect(calculateDose(60, 3, 55).tip).toBe('Empieza con la cantidad menor por unos días antes de aumentar.');
  });

  it('no agrega tip de edad para menores de 55', () => {
    expect(calculateDose(60, 3, 54).tip).toBeNull();
  });
});
