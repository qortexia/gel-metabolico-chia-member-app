export interface OnboardingAnswers {
  nombre: string | null;
  peso: number;
  estatura: number;
  edad: number;
  horarioHambre: string | null;
  antojoDulce: number;
  metaPeso: string | null;
  horaDespertar: string;
}

export const INITIAL_ONBOARDING_ANSWERS: OnboardingAnswers = {
  nombre: null,
  peso: 65,
  estatura: 165,
  edad: 32,
  horarioHambre: null,
  antojoDulce: 5,
  metaPeso: null,
  horaDespertar: '07:00',
};
