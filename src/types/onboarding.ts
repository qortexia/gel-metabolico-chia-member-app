export interface OnboardingAnswers {
  nome: string | null;
  peso: number;
  altura: number;
  idade: number;
  horarioFome: string | null;
  vontadeDoce: number;
  metaPeso: string | null;
  horarioAcorda: string;
}

export const INITIAL_ONBOARDING_ANSWERS: OnboardingAnswers = {
  nome: null,
  peso: 65,
  altura: 165,
  idade: 32,
  horarioFome: null,
  vontadeDoce: 5,
  metaPeso: null,
  horarioAcorda: '07:00',
};
