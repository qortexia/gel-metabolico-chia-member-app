import { describe, it, expect, beforeEach } from 'vitest';
import { useOnboardingStore } from './store';

describe('useOnboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it('starts at index 0 with the default answers', () => {
    const state = useOnboardingStore.getState();
    expect(state.currentIndex).toBe(0);
    expect(state.answers.nombre).toBeNull();
    expect(state.answers.peso).toBe(65);
  });

  it('setAnswer updates only the given field', () => {
    useOnboardingStore.getState().setAnswer('nombre', 'Valentina');
    expect(useOnboardingStore.getState().answers.nombre).toBe('Valentina');
    expect(useOnboardingStore.getState().answers.peso).toBe(65);
  });

  it('goNext advances the index and goBack never goes below 0', () => {
    useOnboardingStore.getState().goNext();
    useOnboardingStore.getState().goNext();
    expect(useOnboardingStore.getState().currentIndex).toBe(2);
    useOnboardingStore.getState().goBack();
    expect(useOnboardingStore.getState().currentIndex).toBe(1);
    useOnboardingStore.getState().goBack();
    useOnboardingStore.getState().goBack();
    expect(useOnboardingStore.getState().currentIndex).toBe(0);
  });

  it('goNext never advances past the last onboarding step', () => {
    useOnboardingStore.getState().goToIndex(7);
    useOnboardingStore.getState().goNext();
    useOnboardingStore.getState().goNext();
    expect(useOnboardingStore.getState().currentIndex).toBe(7);
  });

  it('goToIndex jumps directly to the given step and clamps out-of-range values', () => {
    useOnboardingStore.getState().goToIndex(5);
    expect(useOnboardingStore.getState().currentIndex).toBe(5);
    useOnboardingStore.getState().goToIndex(99);
    expect(useOnboardingStore.getState().currentIndex).toBe(7);
    useOnboardingStore.getState().goToIndex(-3);
    expect(useOnboardingStore.getState().currentIndex).toBe(0);
  });

  it('reset clears the index and answers', () => {
    useOnboardingStore.getState().setAnswer('nombre', 'Valentina');
    useOnboardingStore.getState().goToIndex(3);
    useOnboardingStore.getState().reset();
    expect(useOnboardingStore.getState().currentIndex).toBe(0);
    expect(useOnboardingStore.getState().answers.nombre).toBeNull();
  });

  describe('rehidratación desde localStorage con un esquema anterior', () => {
    it('rellena con los valores por defecto los campos ausentes en un guardado más antiguo', () => {
      const merge = useOnboardingStore.persist.getOptions().merge!;
      const current = useOnboardingStore.getState();
      const { antojoDulce, ...answersSinAntojoDulce } = current.answers;
      const merged = merge({ answers: answersSinAntojoDulce }, current) as typeof current;
      expect(merged.answers.antojoDulce).toBe(5);
    });

    it('corrige currentIndex inválido al rehidratar (evita pantalla en blanco)', () => {
      const merge = useOnboardingStore.persist.getOptions().merge!;
      const current = useOnboardingStore.getState();
      const merged = merge({ currentIndex: 99, answers: current.answers }, current) as typeof current;
      expect(merged.currentIndex).toBe(7);
    });
  });
});

