import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_ONBOARDING_ANSWERS, OnboardingAnswers } from '@/types/onboarding';

export const ONBOARDING_STORAGE_KEY = 'gel-chia-member-onboarding';

interface OnboardingState {
  currentIndex: number;
  answers: OnboardingAnswers;
  setAnswer: <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void;
  goNext: () => void;
  goBack: () => void;
  goToIndex: (index: number) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentIndex: 0,
      answers: INITIAL_ONBOARDING_ANSWERS,
      setAnswer: (key, value) =>
        set((state) => ({ answers: { ...state.answers, [key]: value } })),
      goNext: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),
      goBack: () => set((state) => ({ currentIndex: Math.max(0, state.currentIndex - 1) })),
      goToIndex: (index) => set({ currentIndex: index }),
      reset: () => set({ currentIndex: 0, answers: INITIAL_ONBOARDING_ANSWERS }),
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      // Answers saved before a future OnboardingAnswers shape change (new
      // field, or a field's type changing) must not silently overwrite
      // fresh defaults with `undefined`. Merge onto current.answers
      // field-by-field instead of letting the persisted `answers` object
      // fully replace it — see quiz-app/src/lib/store.ts for the same fix
      // applied after a real production crash there.
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<OnboardingState>;
        const persistedAnswers = (persistedState.answers ?? {}) as Partial<OnboardingAnswers>;
        return {
          ...current,
          ...persistedState,
          answers: { ...current.answers, ...persistedAnswers },
        };
      },
    }
  )
);
